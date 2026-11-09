import confetti from 'canvas-confetti';

/**
 * canvas-confetti draws on a canvas that the global reduced-motion CSS cannot reach.
 * Every burst goes through here so `prefers-reduced-motion: reduce` is always honored.
 */
export function fireConfetti(options: confetti.Options = {}): void {
    if (typeof window === 'undefined') return;
    void confetti({ ...options, disableForReducedMotion: true });
}
