import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.hoisted(() => vi.fn());

vi.mock('@upstash/redis', () => ({ Redis: class {} }));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    limit = limit;
  }
  return { Ratelimit };
});

import { checkRateLimit } from '@/lib/rate-limit';

const req = () =>
  new Request('https://example.com/api/ai/feedback', { headers: { 'x-forwarded-for': '1.2.3.4' } });

describe('checkRateLimit', () => {
  beforeEach(() => limit.mockReset());

  it('reports unavailable (not success) when the limiter times out', async () => {
    limit.mockResolvedValue({ success: true, reason: 'timeout', reset: 0 });
    expect(await checkRateLimit(req())).toEqual({ success: false, unavailable: true });
  });

  it('denies over the limit', async () => {
    limit.mockResolvedValue({ success: false, reset: Date.now() + 5000 });
    const r = await checkRateLimit(req());
    expect(r.success).toBe(false);
    expect(r.unavailable).toBeUndefined();
  });

  it('allows normally', async () => {
    limit.mockResolvedValue({ success: true, reset: 0 });
    expect(await checkRateLimit(req())).toEqual({ success: true });
  });
});
