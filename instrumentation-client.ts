/**
 * Client-side Sentry init (Next.js App Router / Turbopack convention).
 * No-op until NEXT_PUBLIC_SENTRY_DSN is set in the environment.
 */
import { captureRouterTransitionStart, init } from "@sentry/nextjs";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  // Drop noise from browser extensions / Electron hosts injecting scripts.
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    /extension context invalidated/i,
  ],
  // Discard uncaught errors whose entire stack is injected third-party code
  // (only `<anonymous>` frames, no first-party filename).
  beforeSend(event) {
    const frames = event.exception?.values?.flatMap(
      (value) => value.stacktrace?.frames ?? [],
    );
    if (frames && frames.length > 0) {
      const hasFirstPartyFrame = frames.some((frame) => {
        const file = frame.filename ?? "";
        return file !== "" && file !== "<anonymous>";
      });
      if (!hasFirstPartyFrame) return null;
    }
    return event;
  },
});

/** Instruments App Router navigations for tracing. */
export const onRouterTransitionStart = captureRouterTransitionStart;
