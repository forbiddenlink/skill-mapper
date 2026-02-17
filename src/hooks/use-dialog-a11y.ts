import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Adds dialog-level keyboard and focus behavior:
 * - focus initial interactive control
 * - keep tab focus trapped within the dialog
 * - optionally close on Escape
 * - restore prior focus on close
 */
export function useDialogA11y<T extends HTMLElement>(
    isOpen: boolean,
    onClose?: () => void
) {
    const containerRef = useRef<T | null>(null);

    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const root = containerRef.current;
        const previousFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;

        const getFocusable = () =>
            Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
                (element) => !element.hasAttribute('aria-hidden')
            );

        const focusables = getFocusable();
        (focusables[0] ?? root).focus();
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onClose) {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab') return;

            const nodes = getFocusable();
            if (nodes.length === 0) {
                event.preventDefault();
                root.focus();
                return;
            }

            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (!first || !last) return;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
                return;
            }

            if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocused?.focus?.();
        };
    }, [isOpen, onClose]);

    return containerRef;
}
