import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.hoisted(() => vi.fn());
const failure = vi.hoisted(() => ({ error: null as Error | null }));

const pipe = vi.hoisted(() => ({ exec: vi.fn(), incr: vi.fn(), expire: vi.fn() }));
vi.mock('@upstash/redis', () => ({
  Redis: class {
    pipeline() {
      const p = {
        incr: (k: string) => (pipe.incr(k), p),
        expire: (k: string, s: number) => (pipe.expire(k, s), p),
        exec: () => pipe.exec(),
      };
      return p;
    }
  },
}));
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

const { checkRateLimit, checkGlobalDailyCap, getClientIp } = await import('@/lib/rate-limit');

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

describe('checkGlobalDailyCap', () => {
  const day = new Date('2026-11-13T10:00:00Z');
  beforeEach(() => {
    pipe.exec.mockReset();
    pipe.incr.mockReset();
    pipe.expire.mockReset();
    delete process.env.AI_GLOBAL_DAILY_CAP;
  });

  it('uses a repo-prefixed daily key and sets expiry', async () => {
    pipe.exec.mockResolvedValue([1, 1]);
    expect(await checkGlobalDailyCap(day)).toEqual({ success: true });
    expect(pipe.incr).toHaveBeenCalledWith('skill-mapper:ai:daily:2026-11-13:global');
    expect(pipe.expire).toHaveBeenCalledWith('skill-mapper:ai:daily:2026-11-13:global', expect.any(Number));
  });

  it('allows exactly the default cap and denies the next call', async () => {
    pipe.exec.mockResolvedValue([1000, 1]);
    expect((await checkGlobalDailyCap(day)).success).toBe(true);
    pipe.exec.mockResolvedValue([1001, 1]);
    const r = await checkGlobalDailyCap(day);
    expect(r.success).toBe(false);
    expect(r.unavailable).toBeUndefined();
    expect(r.resetInSeconds).toBe(50400);
  });

  it('honours the env override', async () => {
    process.env.AI_GLOBAL_DAILY_CAP = '5';
    pipe.exec.mockResolvedValue([6, 1]);
    expect((await checkGlobalDailyCap(day)).success).toBe(false);
  });

  it('fails closed when Redis throws', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    pipe.exec.mockRejectedValue(new Error('ECONNREFUSED'));
    expect(await checkGlobalDailyCap(day)).toEqual({ success: false, unavailable: true });
    logged.mockRestore();
  });

  it('fails closed on a malformed result', async () => {
    pipe.exec.mockResolvedValue([undefined, 1]);
    expect(await checkGlobalDailyCap(day)).toEqual({ success: false, unavailable: true });
  });
});

describe('getClientIp', () => {
  const h = (headers: Record<string, string>) => new Request('https://example.com', { headers });

  it('prefers x-vercel-forwarded-for, then x-real-ip', () => {
    expect(getClientIp(h({ 'x-vercel-forwarded-for': '203.0.113.7', 'x-real-ip': '198.51.100.1' }))).toBe('203.0.113.7');
    expect(getClientIp(h({ 'x-real-ip': '198.51.100.1' }))).toBe('198.51.100.1');
  });

  it('a spoofed x-forwarded-for does not change the key', () => {
    const base = { 'x-vercel-forwarded-for': '203.0.113.7' };
    expect(getClientIp(h({ ...base, 'x-forwarded-for': '6.6.6.6' }))).toBe('203.0.113.7');
    expect(getClientIp(h({ ...base, 'x-forwarded-for': '7.7.7.7' }))).toBe('203.0.113.7');
    expect(getClientIp(h({ 'x-forwarded-for': '6.6.6.6' }))).toBe('unknown');
  });
});
