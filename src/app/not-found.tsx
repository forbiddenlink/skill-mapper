import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page not found',
    robots: { index: false },
};

export default function NotFound() {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 text-center text-foreground">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">404</p>
            <h1 className="font-display text-3xl font-semibold">This page is not on the map</h1>
            <p className="max-w-md text-text-muted">
                The link may be old, or the page may have moved. Your progress is saved in this browser.
            </p>
            <Link
                href="/"
                className="rounded-[10px] border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm font-medium text-signal transition-colors hover:bg-signal/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
                Back to your skill tree
            </Link>
        </main>
    );
}
