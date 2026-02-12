'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trophy, Flame, Target, X } from 'lucide-react';
import { LearningPaths } from './LearningPaths';
import { BossBattles } from './BossBattles';
import { DailyChallenges } from './DailyChallenges';
import { StreakTracker } from './StreakTracker';

type View = 'challenges' | 'streaks' | 'paths' | 'bosses' | null;

export function FeaturesHub() {
    const [activeView, setActiveView] = useState<View>(null);

    const features = [
        { id: 'challenges' as View, icon: Target, label: 'Daily Challenge', color: 'from-purple-600 to-indigo-600' },
        { id: 'streaks' as View, icon: Flame, label: 'Streaks', color: 'from-orange-600 to-red-600' },
        { id: 'paths' as View, icon: Map, label: 'Learning Paths', color: 'from-blue-600 to-cyan-600' },
        { id: 'bosses' as View, icon: Trophy, label: 'Boss Battles', color: 'from-red-600 to-purple-600' },
    ];

    return (
        <>
            {/* Features Button - Bottom Left */}
            <div className="fixed bottom-6 left-6 z-40">
                <div className="flex flex-col gap-3">
                    {features.map((feature, idx) => (
                        <motion.button
                            key={feature.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveView(feature.id)}
                            className={`p-4 bg-gradient-to-r ${feature.color} rounded-lg shadow-xl hover:scale-110 transition-transform group relative overflow-hidden`}
                            title={feature.label}
                        >
                            <feature.icon className="text-white" size={24} />
                            
                            {/* Hover tooltip */}
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border border-gray-700">
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-6"
                        onClick={() => setActiveView(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="max-w-7xl mx-auto relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setActiveView(null)}
                                className="absolute -top-4 -right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-xl transition-colors border-2 border-gray-600 z-10"
                            >
                                <X className="text-white" size={24} />
                            </button>

                            {/* Content */}
                            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
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
