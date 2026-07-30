'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useGameStore } from '@/lib/store';
import {
    TrendingUp, X, Calendar, Clock, Target, Award,
    PieChart, Activity, Zap
} from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { useShallow } from 'zustand/react/shallow';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

type AnalyticsDashboardProps = {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean;
};

export default function AnalyticsDashboard({
    isOpen: controlledOpen,
    onOpenChange,
    showTrigger = true,
}: AnalyticsDashboardProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const setIsOpen = (open: boolean) => {
        if (!isControlled) setInternalOpen(open);
        onOpenChange?.(open);
    };
    const closeDashboard = () => setIsOpen(false);
    const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, closeDashboard);
    const [activityListRef] = useAutoAnimate<HTMLDivElement>();

    const { nodes, userXP, streak, lastVisit } = useGameStore(
        useShallow((state) => ({
            nodes: state.nodes,
            userXP: state.userXP,
            streak: state.streak,
            lastVisit: state.lastVisit,
        }))
    );

    useKeyboardShortcut('Escape', closeDashboard, { enabled: isOpen });

    // Calculate analytics
    const totalSkills = nodes.length;
    const masteredSkills = nodes.filter(n => n.data.status === 'mastered').length;
    const completionRate = ((masteredSkills / totalSkills) * 100).toFixed(1);

    const totalXPPossible = nodes.reduce((sum, node) => sum + node.data.xpReward, 0);
    const xpProgress = ((userXP / totalXPPossible) * 100).toFixed(1);

    // Calculate learning velocity (skills per day estimate)
    // Use state with lazy initializer to capture time at mount (avoids impure Date.now() in render)
    const [mountTime] = useState(() => Date.now());
    const daysSinceStart = lastVisit > 0 ? Math.max(1, Math.floor((mountTime - lastVisit) / (1000 * 60 * 60 * 24))) : 1;
    const learningVelocity = (masteredSkills / daysSinceStart).toFixed(2);

    // Category breakdown
    const categories = ['frontend', 'backend', 'devops', 'cs', 'ml', 'data'];
    const categoryData = categories.map(cat => {
        const catNodes = nodes.filter(n => n.data.category === cat);
        const catMastered = catNodes.filter(n => n.data.status === 'mastered').length;
        return {
            name: cat.toUpperCase(),
            total: catNodes.length,
            mastered: catMastered,
            percentage: catNodes.length > 0 ? ((catMastered / catNodes.length) * 100).toFixed(0) : '0',
        };
    }).filter(cat => cat.total > 0);

    // Recent activity (last practiced skills)
    const recentActivity = nodes
        .filter(n => n.data.lastPracticedAt)
        .sort((a, b) => (b.data.lastPracticedAt || 0) - (a.data.lastPracticedAt || 0))
        .slice(0, 5);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {showTrigger && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="icon-btn fixed bottom-[10rem] right-6 z-30 grid place-items-center md:bottom-[10.5rem] md:right-6"
                    title="Analytics Dashboard"
                    aria-label="Open analytics dashboard"
                >
                    <Activity size={20} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            ref={dialogRef}
                            className="modal-shell max-h-[90vh] w-full max-w-5xl overflow-y-auto p-4 md:p-6"
                            role="dialog"
                            aria-labelledby="analytics-title"
                            aria-modal="true"
                            tabIndex={-1}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-progress/35 bg-progress/10 text-progress">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2 id="analytics-title" className="font-display text-xl font-semibold text-foreground">
                                        Learning analytics
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeDashboard}
                                    className="icon-btn grid place-items-center"
                                    aria-label="Close analytics"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <MetricCard
                                    icon={<Target />}
                                    label="Completion rate"
                                    value={`${completionRate}%`}
                                    color="text-signal"
                                />
                                <MetricCard
                                    icon={<Zap />}
                                    label="XP progress"
                                    value={`${xpProgress}%`}
                                    subtitle={`${userXP}/${totalXPPossible}`}
                                    color="text-mastery"
                                />
                                <MetricCard
                                    icon={<Calendar />}
                                    label="Streak"
                                    value={`${streak} days`}
                                    color="text-reward"
                                />
                                <MetricCard
                                    icon={<Activity />}
                                    label="Learning velocity"
                                    value={`${learningVelocity} /day`}
                                    color="text-progress"
                                />
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                                    <PieChart size={20} className="text-signal" />
                                    Category progress
                                </h3>
                                <div className="space-y-3">
                                    {categoryData.map(cat => (
                                        <div key={cat.name} className="panel-base p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="font-mono text-sm font-medium text-foreground/85">{cat.name}</span>
                                                <span className="font-mono text-sm text-text-muted">
                                                    {cat.mastered}/{cat.total} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-surface-3">
                                                <div
                                                    className="h-1.5 rounded-full bg-signal transition-all"
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                                    <Clock size={20} className="text-progress" />
                                    Recent activity
                                </h3>
                                <div ref={activityListRef} className="space-y-2">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map(node => (
                                            <div key={node.id} className="panel-base flex items-center justify-between p-3">
                                                <div className="flex items-center gap-3">
                                                    <Award size={16} className="text-mastery" />
                                                    <span className="text-sm text-foreground/90">{node.data.title}</span>
                                                </div>
                                                <span className="font-mono text-xs text-text-muted">
                                                    {node.data.lastPracticedAt && formatDate(node.data.lastPracticedAt)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-text-muted">
                                            No activity yet. Start learning to see your progress.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function MetricCard({ 
    icon, 
    label, 
    value, 
    subtitle, 
    color 
}: Readonly<{ 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    subtitle?: string;
    color: string;
}>) {
    return (
        <div className="metric-card p-4">
            <div className={`${color} mb-2`}>{icon}</div>
            <div className="font-display mb-1 text-2xl font-bold text-foreground">{value}</div>
            <div className="font-mono text-xs text-text-muted">{label}</div>
            {subtitle && <div className="mt-1 font-mono text-xs text-text-muted">{subtitle}</div>}
        </div>
    );
}
