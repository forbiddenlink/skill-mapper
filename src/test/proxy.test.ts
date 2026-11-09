import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ error: null as Error | null, denied: false }));

vi.mock('@upstash/redis', () => ({
  Redis: class {
    static fromEnv() {
      return {};
    }
  },
}));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    limit = async () => {
      if (state.error) throw state.error;
      return { success: true, reset: 0 };
    };
  }
  return { Ratelimit };
});
vi.mock('@arcjet/next', () => ({
  default: () => ({ protect: async () => ({ isDenied: () => state.denied }) }),
  shield: () => ({}),
  detectBot: () => ({}),
}));

process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

const { NextRequest } = await import('next/server');
const { proxy } = await import('@/proxy');

const req = () =>
  new NextRequest('https://example.com/api/ai/feedback', {
    method: 'POST',
    headers: { 'x-forwarded-for': '1.2.3.4' },
  });

describe('proxy', () => {
  beforeEach(() => {
    state.error = null;
    state.denied = false;
  });

  it('returns 503 instead of crashing when the rate limiter throws', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Production failure: a malformed Upstash pipeline response threw inside limit().
    state.error = new TypeError('g.map is not a function');
    const res = await proxy(req());
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  it('passes allowed requests on to Arcjet and through', async () => {
    const res = await proxy(req());
    expect(res.status).toBe(200);
  });

  it('blocks requests Arcjet denies', async () => {
    state.denied = true;
    const res = await proxy(req());
    expect(res.status).toBe(403);
  });
});
