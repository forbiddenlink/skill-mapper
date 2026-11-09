'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { fireConfetti } from '@/lib/confetti';

const MASTERY_MILESTONES = [5, 10, 25, 50, 75, 100];

/**
 * True when `current` is a real increase over `previous` that reaches a milestone.
 * The first hydrated value only seeds `previous`, so reloading never re-celebrates.
 */
export function crossedMilestone(
    previous: number | null,
    current: number,
    isMilestone: (value: number) => boolean
): boolean {
    if (previous === null || current <= previous) return false;
    return isMilestone(current);
}

/**
 * Milestone Celebrations Component
 * Triggers special visual effects for major achievements
 */
export default function MilestoneCelebrations() {
    const hydrated = useHasHydrated();
    const { userLevel, masteredSkills, unlockedBadges } = useGameStore(
        useShallow((state) => ({
            userLevel: state.userLevel,
            masteredSkills: state.nodes.filter(n => n.data.status === 'mastered').length,
            unlockedBadges: state.unlockedBadges.length,
        }))
    );

    const prevLevel = useRef<number | null>(null);
    const prevMastered = useRef<number | null>(null);
    const prevBadges = useRef<number | null>(null);

    // Level milestone celebration (every 5 levels)
    useEffect(() => {
        if (!hydrated) return;
        const previous = prevLevel.current;
        prevLevel.current = userLevel;
        if (!crossedMilestone(previous, userLevel, (l) => l > 1 && l % 5 === 0)) return;

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }
            fireConfetti({
                particleCount: 50 * (timeLeft / duration),
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: {
                    x: randomInRange(0.1, 0.9),
                    y: Math.random() - 0.2,
                },
                colors: ['#b093f0', '#dcc0f2', '#eadcf6'],
            });
        }, 250);

        return () => clearInterval(interval);
    }, [hydrated, userLevel]);

    // Skills mastered milestone
    useEffect(() => {
        if (!hydrated) return;
        const previous = prevMastered.current;
        prevMastered.current = masteredSkills;
        if (!crossedMilestone(previous, masteredSkills, (m) => MASTERY_MILESTONES.includes(m))) return;

        const duration = 2000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
            if (animationEnd - Date.now() <= 0) {
                clearInterval(interval);
                return;
            }
            fireConfetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#b093f0', '#dcc0f2'],
            });
            fireConfetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#eadcf6', '#b093f0'],
            });
        }, 30);

        return () => clearInterval(interval);
    }, [hydrated, masteredSkills]);

    // Badge collection milestone (every 3 badges)
    useEffect(() => {
        if (!hydrated) return;
        const previous = prevBadges.current;
        prevBadges.current = unlockedBadges;
        if (!crossedMilestone(previous, unlockedBadges, (b) => b > 0 && b % 3 === 0)) return;

        const defaults = {
            spread: 360,
            ticks: 50,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            colors: ['#eadcf6', '#b093f0', '#dcc0f2'],
        };
        const shoot = () => {
            fireConfetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
            fireConfetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
        };

        const timers = [0, 100, 200].map((delay) => setTimeout(shoot, delay));
        return () => timers.forEach(clearTimeout);
    }, [hydrated, unlockedBadges]);

    return null; // This component only handles side effects
}
