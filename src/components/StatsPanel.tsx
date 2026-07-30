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
                                    <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-mastery/35 bg-mastery/10 text-mastery">
                                        <BarChart3 size={24} />
                                    </div>
                                    <h2 id="stats-title" className="font-display text-xl font-semibold text-foreground">
                                        Learning statistics
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

                            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="metric-card p-4">
                                    <div className="mb-2 flex items-center gap-2 text-signal">
                                        <Target size={18} />
                                        <span className="font-mono text-xs uppercase">Completion</span>
                                    </div>
                                    <div className="font-display text-2xl font-bold text-foreground">{completionRate}%</div>
                                    <div className="text-xs text-text-muted">{masteredSkills} / {totalSkills} skills</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="mb-2 flex items-center gap-2 text-progress">
                                        <TrendingUp size={18} />
                                        <span className="font-mono text-xs uppercase">Level</span>
                                    </div>
                                    <div className="font-display text-2xl font-bold text-foreground">{userLevel}</div>
                                    <div className="text-xs text-text-muted">{userXP} XP</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="mb-2 flex items-center gap-2 text-reward">
                                        <Award size={18} />
                                        <span className="font-mono text-xs uppercase">Badges</span>
                                    </div>
                                    <div className="font-display text-2xl font-bold text-foreground">{unlockedBadges.length}</div>
                                    <div className="text-xs text-text-muted">Achievements</div>
                                </div>

                                <div className="metric-card p-4">
                                    <div className="mb-2 flex items-center gap-2 text-reward">
                                        <Zap size={18} />
                                        <span className="font-mono text-xs uppercase">Streak</span>
                                    </div>
                                    <div className="font-display text-2xl font-bold text-foreground">{streak}</div>
                                    <div className="text-xs text-text-muted">Days</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground">Skill status</h3>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    <div className="panel-base rounded-[10px] p-3">
                                        <div className="font-mono text-sm text-mastery">Mastered</div>
                                        <div className="font-display text-2xl font-bold text-foreground">{masteredSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[10px] p-3">
                                        <div className="font-mono text-sm text-progress">In progress</div>
                                        <div className="font-display text-2xl font-bold text-foreground">{inProgressSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[10px] p-3">
                                        <div className="font-mono text-sm text-signal">Available</div>
                                        <div className="font-display text-2xl font-bold text-foreground">{availableSkills}</div>
                                    </div>
                                    <div className="panel-base rounded-[10px] p-3">
                                        <div className="font-mono text-sm text-text-muted">Locked</div>
                                        <div className="font-display text-2xl font-bold text-foreground">{lockedSkills}</div>
                                    </div>
                                    {decayedSkills > 0 && (
                                        <div className="rounded-[10px] border border-decay/50 bg-decay/10 p-3">
                                            <div className="font-mono text-sm text-decay">Decayed</div>
                                            <div className="font-display text-2xl font-bold text-foreground">{decayedSkills}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground">Progress by tier</h3>
                                <div className="space-y-3">
                                    {tierStats.map((tier) => (
                                        <div key={tier.name} className="panel-base rounded-[10px] p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm text-foreground/85">{tier.name}</span>
                                                <span className="font-mono text-xs text-text-muted">
                                                    {tier.mastered} / {tier.total}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                                                <div
                                                    className="h-full bg-gradient-to-r from-signal to-mastery transition-all duration-500"
                                                    style={{ width: `${tier.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground">Progress by category</h3>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {categoryStats.map((cat) => (
                                        <div key={cat.name} className="panel-base rounded-[10px] p-3">
                                            <div className="mb-1 font-mono text-sm text-foreground/85">{cat.name}</div>
                                            <div className="font-display mb-2 text-xl font-bold text-foreground">{cat.percentage}%</div>
                                            <div className="text-xs text-text-muted">{cat.mastered} / {cat.total}</div>
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
