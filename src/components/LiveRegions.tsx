'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * LiveRegions Component
 * Provides screen reader announcements for important game events
 * Using ARIA live regions for accessibility
 */
export default function LiveRegions() {
    const politeRef = useRef<HTMLDivElement>(null);
    const assertiveRef = useRef<HTMLDivElement>(null);
    const prevXP = useRef(0);
    const prevLevel = useRef(1);
    const prevBadges = useRef<string[]>([]);

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
        if (prevXP.current > 0 && userXP > prevXP.current) {
            const gain = userXP - prevXP.current;
            announce(`Gained ${gain} experience points`, 'polite');
        }
        prevXP.current = userXP;
    }, [userXP, announce]);

    // Announce level ups
    useEffect(() => {
        if (prevLevel.current > 0 && userLevel > prevLevel.current) {
            announce(`Congratulations! You reached level ${userLevel}!`, 'assertive');
        }
        prevLevel.current = userLevel;
    }, [userLevel, announce]);

    // Announce new badges
    useEffect(() => {
        const newBadges = unlockedBadges.filter(badge => !prevBadges.current.includes(badge));
        if (newBadges.length > 0) {
            announce(`Achievement unlocked! You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`, 'assertive');
        }
        prevBadges.current = [...unlockedBadges];
    }, [unlockedBadges, announce]);

    // Announce skill completions
    useEffect(() => {
        const masteredCount = nodes.filter(n => n.data.status === 'mastered').length;
        // Only announce if not initial load
        if (masteredCount > 0) {
            const availableCount = nodes.filter(n => n.data.status === 'available').length;
            if (availableCount > 0) {
                announce(`${availableCount} new skill${availableCount > 1 ? 's' : ''} available to learn`, 'polite');
            }
        }
    }, [nodes, announce]);

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
