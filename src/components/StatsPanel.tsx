'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { BarChart3, X, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { calculatePercentage } from '@/lib/utils';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { useShallow } from 'zustand/react/shallow';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

export default function StatsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const closePanel = () => setIsOpen(false);
    const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, closePanel);
    const { nodes, userXP, userLevel, unlockedBadges, streak } = useGameStore(
        useShallow((state) => ({
            nodes: state.nodes,
            userXP: state.userXP,
            userLevel: state.userLevel,
            unlockedBadges: state.unlockedBadges,
            streak: state.streak
        }))
    );

    // Close with Escape
    useKeyboardShortcut('Escape', closePanel, { enabled: isOpen });

    // Calculate stats
    const totalSkills = nodes.length;
    const masteredSkills = nodes.filter(n => n.data.status === 'mastered').length;
    const inProgressSkills = nodes.filter(n => n.data.status === 'in-progress').length;
    const availableSkills = nodes.filter(n => n.data.status === 'available').length;
    const lockedSkills = nodes.filter(n => n.data.status === 'locked').length;
    const decayedSkills = nodes.filter(n => n.data.status === 'decayed').length;

    const completionRate = calculatePercentage(masteredSkills, totalSkills, 1);

    // Calculate tier progress
    const tiers = ['foundation', 'frontend-2', 'backend-data', 'ai-engineer', 'systems'];
    const tierStats = tiers.map(tier => {
        const tierNodes = nodes.filter(n => n.data.tier === tier);
        const tierMastered = tierNodes.filter(n => n.data.status === 'mastered').length;
        return {
            name: tier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            total: tierNodes.length,
            mastered: tierMastered,
            percentage: calculatePercentage(tierMastered, tierNodes.length, 0),
        };
    });

    // Calculate category stats
    const categories = ['frontend', 'backend', 'devops', 'cs', 'ml', 'data'];
    const categoryStats = categories.map(category => {
        const categoryNodes = nodes.filter(n => n.data.category === category);
        const categoryMastered = categoryNodes.filter(n => n.data.status === 'mastered').length;
        return {
            name: category.toUpperCase(),
            total: categoryNodes.length,
            mastered: categoryMastered,
            percentage: calculatePercentage(categoryMastered, categoryNodes.length, 0),
        };
    }).filter(cat => cat.total > 0);

    return (
        <>
            {/* Stats Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="icon-btn fixed bottom-[5.75rem] right-6 z-30 grid place-items-center md:bottom-[6.25rem] md:right-6"
                title="View Stats"
                aria-label="View statistics"
            >
                <BarChart3 size={20} />
            </button>

            {/* Stats Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            ref={dialogRef}
                            className="modal-shell max-h-[90vh] w-full max-w-4xl overflow-y-auto p-4 md:p-6"
                            role="dialog"
                            aria-labelledby="stats-title"
                            aria-modal="true"
                            tabIndex={-1}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-plasma-pink/35 bg-plasma-pink/10 text-plasma-pink">
                                        <BarChart3 size={24} />
                                    </div>
                                    <h2 id="stats-title" className="text-xl font-semibold text-white">
                                        Learning Statistics
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closePanel}
                                    className="icon-btn grid place-items-center"
                                    aria-label="Close statistics"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="metric-card p-4">
                                    <div className="flex items-center gap-2 text-neon-cyan mb-2">
                                        <Target size={18} />
                                        <span className="text-xs uppercase font-mono">Completion</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                                    <div className="text-xs text-gray-400">{masteredSkills} / {totalSkills} skills</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="flex items-center gap-2 text-electric-green mb-2">
                                        <TrendingUp size={18} />
                                        <span className="text-xs uppercase font-mono">Level</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{userLevel}</div>
                                    <div className="text-xs text-gray-400">{userXP} XP</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                                        <Award size={18} />
                                        <span className="text-xs uppercase font-mono">Badges</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{unlockedBadges.length}</div>
                                    <div className="text-xs text-gray-400">Achievements</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                                        <Zap size={18} />
                                        <span className="text-xs uppercase font-mono">Streak</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{streak}</div>
                                    <div className="text-xs text-gray-400">Days</div>
                                </div>
                            </div>

                            {/* Status Breakdown */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Skill Status</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="panel-base rounded-[12px] p-3">
                                        <div className="text-plasma-pink text-sm font-mono">Mastered</div>
                                        <div className="text-2xl font-bold text-white">{masteredSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[12px] p-3">
                                        <div className="text-electric-green text-sm font-mono">In Progress</div>
                                        <div className="text-2xl font-bold text-white">{inProgressSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[12px] p-3">
                                        <div className="text-neon-cyan text-sm font-mono">Available</div>
                                        <div className="text-2xl font-bold text-white">{availableSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[12px] p-3">
                                        <div className="text-gray-400 text-sm font-mono">Locked</div>
                                        <div className="text-2xl font-bold text-white">{lockedSkills}</div>
                                    </div>
                                    {decayedSkills > 0 && (
                                        <div className="rounded-[12px] border border-alert-red/50 bg-alert-red/10 p-3">
                                            <div className="text-alert-red text-sm font-mono">Decayed</div>
                                            <div className="text-2xl font-bold text-white">{decayedSkills}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tier Progress */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Progress by Tier</h3>
                                <div className="space-y-3">
                                    {tierStats.map((tier) => (
                                        <div key={tier.name} className="panel-base rounded-[12px] p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-300">{tier.name}</span>
                                                <span className="text-xs font-mono text-gray-400">
                                                    {tier.mastered} / {tier.total}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/35">
                                                <div
                                                    className="h-full bg-gradient-to-r from-neon-cyan to-plasma-pink transition-all duration-500"
                                                    style={{ width: `${tier.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Progress */}
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Progress by Category</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categoryStats.map((cat) => (
                                        <div key={cat.name} className="panel-base rounded-[12px] p-3">
                                            <div className="text-sm text-gray-300 mb-1">{cat.name}</div>
                                            <div className="text-xl font-bold text-white mb-2">{cat.percentage}%</div>
                                            <div className="text-xs text-gray-400">{cat.mastered} / {cat.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
