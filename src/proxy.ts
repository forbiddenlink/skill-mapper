import arcjet, { shield, detectBot } from '@arcjet/next';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, runLimit } from '@/lib/rate-limit';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: 'LIVE' }), detectBot({ mode: 'LIVE', allow: ['CATEGORY:SEARCH_ENGINE'] })],
});

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '10 s'),
        analytics: true,
        prefix: 'rl',
        // Default 5s; a timeout resolves success:true, so keep it short. runLimit fails closed.
        timeout: 1500,
      })
    : null;

export async function proxy(request: NextRequest) {
  if (ratelimit) {
    const { success, unavailable } = await runLimit(ratelimit, getClientIp(request), 'Proxy rate limiter');
    if (unavailable) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }
    if (!success) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  const decision = await aj.protect(request);
  if (decision.isDenied()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
