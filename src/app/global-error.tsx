'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import './globals.css';

/** Replaces the root layout when it fails, so it renders its own html and body. */
export default function GlobalError({
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
        <html lang="en">
            <body className="bg-canvas text-foreground antialiased">
                <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
                    <h1 className="text-3xl font-semibold">Skill Mapper could not load</h1>
                    <p className="max-w-md text-text-muted">
                        The error has been reported. Your progress is saved in this browser.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-[10px] border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm font-medium text-signal hover:bg-signal/20"
                    >
                        Try again
                    </button>
                </main>
            </body>
        </html>
    );
}
