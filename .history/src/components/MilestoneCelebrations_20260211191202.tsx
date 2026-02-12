'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Milestone Celebrations Component
 * Triggers special visual effects for major achievements
 */
export default function MilestoneCelebrations() {
    const { userLevel, masteredSkills, unlockedBadges } = useGameStore(
        useShallow((state) => ({
            userLevel: state.userLevel,
            masteredSkills: state.nodes.filter(n => n.data.status === 'mastered').length,
            unlockedBadges: state.unlockedBadges.length,
        }))
    );

    // Level milestone celebration
    useEffect(() => {
        if (userLevel <= 1 || userLevel % 5 !== 0) return;
        
        // Epic celebration for every 5 levels
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        
        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: {
                    x: randomInRange(0.1, 0.9),
                    y: Math.random() - 0.2,
                },
                colors: ['#00f3ff', '#ff00ff', '#00ff88'],
            });
        }, 250);

        return () => clearInterval(interval);
    }, [userLevel]);

    // Skills mastered milestone
    useEffect(() => {
        const milestones = [5, 10, 25, 50, 75, 100];
        
        if (milestones.includes(masteredSkills)) {
            // Fireworks effect
            const duration = 2000;
            const animationEnd = Date.now() + duration;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#00f3ff', '#ff00ff'],
                });
                
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#00ff88', '#00f3ff'],
                });
            }, 30);

            return () => clearInterval(interval);
        }
    }, [masteredSkills]);

    // Badge collection milestone
    useEffect(() => {
        if (unlockedBadges > 0 && unlockedBadges % 3 === 0) {
            // Star burst effect
            const defaults = {
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 30,
                colors: ['#FFD700', '#FFA500', '#FF69B4'],
            };

            const shoot = () => {
                confetti({
                    ...defaults,
                    particleCount: 40,
                    scalar: 1.2,
                    shapes: ['star'],
                });

                confetti({
                    ...defaults,
                    particleCount: 10,
                    scalar: 0.75,
                    shapes: ['circle'],
                });
            };

            setTimeout(shoot, 0);
            setTimeout(shoot, 100);
            setTimeout(shoot, 200);
        }
    }, [unlockedBadges]);

    return null; // This component only handles side effects
}
