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

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const [first] = forwardedFor.split(',');
    if (first) return first.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export async function checkRateLimit(
  request: Request
): Promise<{ success: boolean; resetInSeconds?: number; unavailable?: boolean }> {
  if (!feedbackRatelimit) return { success: false, unavailable: true };

  const ip = getClientIp(request);
  let result: Awaited<ReturnType<Ratelimit['limit']>>;
  try {
    result = await feedbackRatelimit.limit(ip);
  } catch (error) {
    // Redis down or misconfigured: fail closed (503), since this gates paid AI calls.
    console.error('Rate limiter error:', error);
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
