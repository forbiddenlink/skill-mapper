'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function RouteError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 text-center text-foreground">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-decay">Error</p>
            <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
            <p className="max-w-md text-text-muted">
                The error has been reported. Your progress is saved in this browser, so trying again is safe.
            </p>
            <button
                type="button"
                onClick={reset}
                className="rounded-[10px] border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm font-medium text-signal transition-colors hover:bg-signal/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
                Try again
            </button>
        </main>
    );
}
