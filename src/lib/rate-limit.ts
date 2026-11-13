import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash Redis-based rate limiter for API routes.
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Rate limiter for AI feedback - 10 requests per minute. Null when Redis is not
// configured: the route then reports unavailable instead of running unmetered.
const feedbackRatelimit = redisUrl && redisToken ? new Ratelimit({
  redis: redis as Redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:feedback',
  // Default is 5s and a timeout resolves { success: true, reason: 'timeout' } instead of
  // throwing. Keep it short and report 'unavailable' below.
  timeout: 1500,
}) : null;

/**
 * Client IP for rate-limit keys. The left-most x-forwarded-for hop is client-supplied, so
 * rotating it would bypass the per-IP limit. Use the platform-set headers only.
 */
export function getClientIp(request: Request): string {
  const vercel = request.headers.get('x-vercel-forwarded-for')?.trim();
  if (vercel) return vercel;
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

export type LimitOutcome = { success: boolean; resetInSeconds?: number; unavailable?: boolean };

/**
 * Run one limiter check. A thrown error or a timeout means Redis is down or
 * misconfigured: report unavailable (503) instead of letting the request through.
 */
export async function runLimit(limiter: Ratelimit, key: string, label: string): Promise<LimitOutcome> {
  let result: Awaited<ReturnType<Ratelimit['limit']>>;
  try {
    result = await limiter.limit(key);
  } catch (error) {
    console.error(`${label} error:`, error);
    return { success: false, unavailable: true };
  }

  if (result.reason === 'timeout') {
    return { success: false, unavailable: true };
  }

  if (!result.success) {
    return {
      success: false,
      resetInSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  }

  return { success: true };
}

export async function checkRateLimit(request: Request): Promise<LimitOutcome> {
  if (!feedbackRatelimit) return { success: false, unavailable: true };
  // Redis down or misconfigured fails closed, since this gates paid AI calls.
  return runLimit(feedbackRatelimit, getClientIp(request), 'Rate limiter');
}

const DEFAULT_GLOBAL_DAILY_CAP = 1000;
const GLOBAL_CAP_TIMEOUT_MS = 1500;

function globalDailyCap(): number {
  const n = Number.parseInt(process.env.AI_GLOBAL_DAILY_CAP ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_GLOBAL_DAILY_CAP;
}

/**
 * Global (all callers) daily ceiling on paid AI calls, so a distributed abuser cannot
 * outrun the per-IP limit. Key is prefixed with the repo name because the Upstash DB
 * is shared. Fails closed: Redis missing, erroring or slow all report unavailable.
 */
export async function checkGlobalDailyCap(now: Date = new Date()): Promise<LimitOutcome> {
  if (!redis) return { success: false, unavailable: true };
  const day = now.toISOString().slice(0, 10);
  const key = `skill-mapper:ai:daily:${day}:global`;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('global cap timeout')), GLOBAL_CAP_TIMEOUT_MS);
    });
    const results = await Promise.race([
      redis.pipeline().incr(key).expire(key, 60 * 60 * 48).exec<[number, number]>(),
      timeout,
    ]);
    const count = Number(results[0]);
    if (!Number.isFinite(count)) return { success: false, unavailable: true };
    if (count > globalDailyCap()) {
      const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      return { success: false, resetInSeconds: Math.max(1, Math.ceil((nextUtcMidnight - now.getTime()) / 1000)) };
    }
    return { success: true };
  } catch (error) {
    console.error('Global daily cap error:', error);
    return { success: false, unavailable: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
