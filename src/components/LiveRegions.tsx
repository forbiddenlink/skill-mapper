'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useHasHydrated } from '@/hooks/use-has-hydrated';

/**
 * LiveRegions Component
 * Provides screen reader announcements for important game events
 * Using ARIA live regions for accessibility
 */
export default function LiveRegions() {
    const politeRef = useRef<HTMLDivElement>(null);
    const assertiveRef = useRef<HTMLDivElement>(null);
    const hydrated = useHasHydrated();
    // null = not seeded yet. The first hydrated values seed these silently, so a
    // reload does not announce the saved level, badges or XP as if they were new.
    const prevXP = useRef<number | null>(null);
    const prevLevel = useRef<number | null>(null);
    const prevBadges = useRef<string[] | null>(null);
    const prevAvailable = useRef<number | null>(null);

    const { userXP, userLevel, unlockedBadges, nodes } = useGameStore(
        useShallow((state) => ({
            userXP: state.userXP,
            userLevel: state.userLevel,
            unlockedBadges: state.unlockedBadges,
            nodes: state.nodes,
        }))
    );

    // Declare announce before effects that use it
    const announce = useCallback((message: string, priority: 'polite' | 'assertive') => {
        const ref = priority === 'assertive' ? assertiveRef : politeRef;
        if (ref.current) {
            ref.current.textContent = message;
            // Clear after a delay to allow re-announcement of the same message
            setTimeout(() => {
                if (ref.current) ref.current.textContent = '';
            }, 1000);
        }
    }, []);

    // Announce XP gains
    useEffect(() => {
        if (!hydrated) return;
        if (prevXP.current !== null && userXP > prevXP.current) {
            const gain = userXP - prevXP.current;
            announce(`Gained ${gain} experience points`, 'polite');
        }
        prevXP.current = userXP;
    }, [hydrated, userXP, announce]);

    // Announce level ups
    useEffect(() => {
        if (!hydrated) return;
        if (prevLevel.current !== null && userLevel > prevLevel.current) {
            announce(`You reached level ${userLevel}.`, 'assertive');
        }
        prevLevel.current = userLevel;
    }, [hydrated, userLevel, announce]);

    // Announce new badges
    useEffect(() => {
        if (!hydrated) return;
        const previous = prevBadges.current;
        prevBadges.current = [...unlockedBadges];
        if (previous === null) return;
        const newBadges = unlockedBadges.filter(badge => !previous.includes(badge));
        if (newBadges.length > 0) {
            announce(`You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}.`, 'assertive');
        }
    }, [hydrated, unlockedBadges, announce]);

    // Announce newly available skills. `nodes` also changes on drag and layout,
    // so only an increase in the available count is worth announcing.
    useEffect(() => {
        if (!hydrated) return;
        const availableCount = nodes.filter(n => n.data.status === 'available').length;
        const previous = prevAvailable.current;
        prevAvailable.current = availableCount;
        if (previous !== null && availableCount > previous) {
            const gained = availableCount - previous;
            announce(`${gained} new skill${gained > 1 ? 's' : ''} available to learn`, 'polite');
        }
    }, [hydrated, nodes, announce]);

    return (
        <>
            {/* Polite announcements - won't interrupt user */}
            <div
                ref={politeRef}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />

            {/* Assertive announcements - will interrupt user for important events */}
            <div
                ref={assertiveRef}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            />
        </>
    );
}
