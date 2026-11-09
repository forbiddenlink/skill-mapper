import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash Redis-based rate limiter for API routes.
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Rate limiter for AI feedback - 10 requests per minute. Null when Redis is not
// configured: the route then reports unavailable instead of running unmetered.
const feedbackRatelimit = redisUrl && redisToken ? new Ratelimit({
  redis: new Redis({ url: redisUrl, token: redisToken }),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:feedback',
  // Default is 5s and a timeout resolves { success: true, reason: 'timeout' } instead of
  // throwing. Keep it short and report 'unavailable' below.
  timeout: 1500,
}) : null;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const [first] = forwardedFor.split(',');
    if (first) return first.trim();
  }
  const realIp = request.headers.get('x-real-ip');
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
