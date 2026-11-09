import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.hoisted(() => vi.fn());
const failure = vi.hoisted(() => ({ error: null as Error | null }));

vi.mock('@upstash/redis', () => ({ Redis: class {} }));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    limit = async (ip: string) => {
      if (failure.error) throw failure.error;
      return limit(ip);
    };
  }
  return { Ratelimit };
});

process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

const { checkRateLimit } = await import('@/lib/rate-limit');

const req = () =>
  new Request('https://example.com/api/ai/feedback', { headers: { 'x-forwarded-for': '1.2.3.4' } });

describe('checkRateLimit', () => {
  beforeEach(() => {
    limit.mockReset();
    failure.error = null;
  });

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

  it('reports unavailable when the limiter throws', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    failure.error = new Error('ECONNREFUSED');
    expect(await checkRateLimit(req())).toEqual({ success: false, unavailable: true });
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
