import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash Redis-based rate limiter for API routes.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter for AI feedback - 10 requests per minute
const feedbackRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:feedback',
});

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
): Promise<{ success: boolean; resetInSeconds?: number }> {
  const ip = getClientIp(request);
  const result = await feedbackRatelimit.limit(ip);

  if (!result.success) {
    return {
      success: false,
      resetInSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  }

  return { success: true };
}
