import { beforeAll, afterEach, afterAll } from 'vitest'
import '@testing-library/jest-dom'
import { server } from './src/mocks/server'

// jsdom does not implement HTMLCanvasElement.getContext, so it returns null.
// canvas-confetti (fired via requestAnimationFrame in some store tests) then
// calls ctx.clearRect on null, throwing an unhandled error that fails the run.
// Stub a 2D context whose methods are all no-ops, with sane returns for the
// few accessors that need a value.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return new Proxy(
      {
        canvas: this,
        measureText: () => ({ width: 0 }),
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        createLinearGradient: () => ({ addColorStop() {} }),
        createRadialGradient: () => ({ addColorStop() {} }),
        createPattern: () => null,
      },
      {
        get(target, prop) {
          if (prop in target) return (target as Record<string | symbol, unknown>)[prop]
          // Every other canvas method is a no-op.
          return () => undefined
        },
      }
    ) as unknown as CanvasRenderingContext2D
  } as typeof HTMLCanvasElement.prototype.getContext
}

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())
