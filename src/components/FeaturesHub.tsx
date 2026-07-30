'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trophy, Flame, Target, X } from 'lucide-react';
import { LearningPaths } from './LearningPaths';
import { BossBattles } from './BossBattles';
import { DailyChallenges } from './DailyChallenges';
import { StreakTracker } from './StreakTracker';
import EmptyStateCoach from './EmptyStateCoach';

import { useGameStore } from '@/lib/store';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import type { FeaturesHubView } from '@/lib/stores/ui-store';

export function FeaturesHub() {
    const activeView = useGameStore((s) => s.featuresHubView);
    const openFeaturesHub = useGameStore((s) => s.openFeaturesHub);
    const closeFeaturesHub = useGameStore((s) => s.closeFeaturesHub);
    const selectSkill = useGameStore((s) => s.selectSkill);

    useEffect(() => {
        if (activeView) selectSkill(null);
    }, [activeView, selectSkill]);

    const handleViewChange = (view: FeaturesHubView) => {
        if (view) openFeaturesHub(view);
        else closeFeaturesHub();
    };

    const dialogRef = useDialogA11y<HTMLDivElement>(Boolean(activeView), closeFeaturesHub);

    const features = [
        { id: 'challenges' as const, icon: Target, label: 'Daily Challenge', tone: 'text-signal' },
        { id: 'streaks' as const, icon: Flame, label: 'Streaks', tone: 'text-reward' },
        { id: 'paths' as const, icon: Map, label: 'Learning Paths', tone: 'text-progress' },
        { id: 'bosses' as const, icon: Trophy, label: 'Boss Battles', tone: 'text-mastery' },
    ];
    const activeLabel = features.find((feature) => feature.id === activeView)?.label ?? 'Features Hub';

    return (
        <>
            <div className="fixed bottom-4 left-3 z-30 sm:bottom-6 sm:left-6 md:bottom-8 md:left-6">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                    {features.map((feature, idx) => (
                        <motion.button
                            key={feature.id}
                            type="button"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => handleViewChange(feature.id)}
                            className="icon-btn group relative grid h-10 w-10 place-items-center overflow-visible sm:h-11 sm:w-11"
                            title={feature.label}
                            aria-label={feature.label}
                        >
                            <feature.icon className={feature.tone} size={20} />
                            <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="panel-base whitespace-nowrap px-3 py-2 text-sm font-medium text-white">
                                    {feature.label}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {activeView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm md:p-6"
                        onClick={closeFeaturesHub}
                    >
                        <motion.div
                            initial={{ scale: 0.96, y: 12 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.96, y: 12 }}
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="features-hub-title"
                            tabIndex={-1}
                            className="relative mx-auto max-w-7xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 id="features-hub-title" className="sr-only">
                                {activeLabel}
                            </h2>
                            <button
                                type="button"
                                onClick={closeFeaturesHub}
                                className="icon-btn absolute -right-2 -top-2 z-10 grid place-items-center"
                                aria-label="Close features hub"
                            >
                                <X className="text-white" size={20} />
                            </button>

                            <div className="modal-shell space-y-4 p-4 md:p-8">
                                {activeView === 'challenges' && (
                                    <>
                                        <EmptyStateCoach compact />
                                        <DailyChallenges />
                                    </>
                                )}
                                {activeView === 'streaks' && <StreakTracker />}
                                {activeView === 'paths' && <LearningPaths />}
                                {activeView === 'bosses' && <BossBattles />}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
