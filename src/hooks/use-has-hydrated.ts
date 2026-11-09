'use client';

import { useSyncExternalStore } from 'react';
import { useGameStore } from '@/lib/store';

function subscribe(onChange: () => void): () => void {
    return useGameStore.persist.onFinishHydration(onChange);
}

function getSnapshot(): boolean {
    return useGameStore.persist.hasHydrated();
}

function getServerSnapshot(): boolean {
    return false;
}

/**
 * True once the persisted game state has been read from IndexedDB.
 * Effects that compare "before" and "after" values (celebrations, announcements,
 * first-run checks) must wait for this, or they react to the hydration swap itself.
 */
export function useHasHydrated(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
