'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trophy, Flame, Target, X } from 'lucide-react';
import { LearningPaths } from './LearningPaths';
import { BossBattles } from './BossBattles';
import { DailyChallenges } from './DailyChallenges';
import { StreakTracker } from './StreakTracker';

import { useGameStore } from '@/lib/store';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

type View = 'challenges' | 'streaks' | 'paths' | 'bosses' | null;

export function FeaturesHub() {
    const [activeView, setActiveView] = useState<View>(null);
    const selectSkill = useGameStore(state => state.selectSkill);

    const handleViewChange = (view: View) => {
        setActiveView(view);
        if (view) selectSkill(null); // Close sidebar when opening modal
    };
    const closeHub = () => handleViewChange(null);
    const dialogRef = useDialogA11y<HTMLDivElement>(Boolean(activeView), closeHub);

    const features = [
        { id: 'challenges' as View, icon: Target, label: 'Daily Challenge', tone: 'text-signal' },
        { id: 'streaks' as View, icon: Flame, label: 'Streaks', tone: 'text-reward' },
        { id: 'paths' as View, icon: Map, label: 'Learning Paths', tone: 'text-progress' },
        { id: 'bosses' as View, icon: Trophy, label: 'Boss Battles', tone: 'text-mastery' },
    ];
    const activeLabel = features.find((feature) => feature.id === activeView)?.label ?? 'Features Hub';

    return (
        <>
            {/* Features Button - Bottom Left */}
            <div className="fixed bottom-6 left-6 z-30 md:bottom-8 md:left-6">
                <div className="flex flex-col gap-2">
                    {features.map((feature, idx) => (
                        <motion.button
                            key={feature.id}
                            type="button"
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => handleViewChange(feature.id)}
                            className="icon-btn group relative grid place-items-center overflow-visible"
                            title={feature.label}
                            aria-label={feature.label}
                        >
                            <feature.icon className={feature.tone} size={20} />
                            
                            {/* Hover tooltip */}
                            <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="panel-base whitespace-nowrap px-3 py-2 text-sm font-medium text-white">
                                    {feature.label}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {activeView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 md:p-6"
                        onClick={() => handleViewChange(null)}
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
                            className="max-w-7xl mx-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 id="features-hub-title" className="sr-only">
                                {activeLabel}
                            </h2>
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={() => handleViewChange(null)}
                                className="icon-btn absolute -right-2 -top-2 z-10 grid place-items-center"
                                aria-label="Close features hub"
                            >
                                <X className="text-white" size={20} />
                            </button>

                            {/* Content */}
                            <div className="modal-shell p-4 md:p-8">
                                {activeView === 'challenges' && <DailyChallenges />}
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
