import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    description: string;
    action: (e: KeyboardEvent) => void;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Handles key combinations and provides a centralized way to manage shortcuts
 * 
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcut[],
    enabled = true
) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled) return;

            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();
                const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : !e.ctrlKey;
                const metaMatch = shortcut.metaKey ? e.metaKey : !e.metaKey;
                const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
                const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

                if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
                    e.preventDefault();
                    shortcut.action(e);
                    break;
                }
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
        return undefined;
    }, [handleKeyDown, enabled]);
}

/**
 * Hook for a single keyboard shortcut
 */
export function useKeyboardShortcut(
    key: string,
    action: (e: KeyboardEvent) => void,
    options?: {
        ctrlKey?: boolean;
        metaKey?: boolean;
        shiftKey?: boolean;
        altKey?: boolean;
        enabled?: boolean;
    }
) {
    const shortcuts: KeyboardShortcut[] = [
        {
            key,
            ...options,
            description: '',
            action,
        },
    ];

    useKeyboardShortcuts(shortcuts, options?.enabled ?? true);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    // Use Cmd for Mac, Ctrl for others
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push(isMac ? 'Cmd' : 'Meta');
    if (shortcut.altKey) parts.push(isMac ? 'Opt' : 'Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
}

/**
 * Default keyboard shortcuts for the app
 */
export const DEFAULT_SHORTCUTS: Record<string, KeyboardShortcut> = {
    CLOSE_MODAL: {
        key: 'Escape',
        description: 'Close modal or panel',
        action: () => {},
    },
    SAVE: {
        key: 's',
        ctrlKey: true,
        description: 'Save progress',
        action: () => {},
    },
    SEARCH: {
        key: 'k',
        ctrlKey: true,
        description: 'Open search',
        action: () => {},
    },
    HELP: {
        key: '?',
        shiftKey: true,
        description: 'Show keyboard shortcuts',
        action: () => {},
    },
};
