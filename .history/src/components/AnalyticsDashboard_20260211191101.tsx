'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { 
    TrendingUp, X, Calendar, Clock, Target, Award, 
    PieChart, Activity, Zap 
} from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';
import { useShallow } from 'zustand/react/shallow';

export default function AnalyticsDashboard() {
    const [isOpen, setIsOpen] = useState(false);
    
    const { nodes, userXP, userLevel, unlockedBadges, streak, lastVisit } = useGameStore(
        useShallow((state) => ({
            nodes: state.nodes,
            userXP: state.userXP,
            userLevel: state.userLevel,
            unlockedBadges: state.unlockedBadges,
            streak: state.streak,
            lastVisit: state.lastVisit,
        }))
    );

    useKeyboardShortcut('Escape', () => setIsOpen(false), { enabled: isOpen });

    // Calculate analytics
    const totalSkills = nodes.length;
    const masteredSkills = nodes.filter(n => n.data.status === 'mastered').length;
    const inProgressSkills = nodes.filter(n => n.data.status === 'in-progress').length;
    const completionRate = ((masteredSkills / totalSkills) * 100).toFixed(1);
    
    const totalXPPossible = nodes.reduce((sum, node) => sum + node.data.xpReward, 0);
    const xpProgress = ((userXP / totalXPPossible) * 100).toFixed(1);

    // Calculate learning velocity (skills per day estimate)
    const daysSinceStart = lastVisit > 0 ? Math.max(1, Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24))) : 1;
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
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-36 right-4 z-40 p-3 bg-gray-900 border border-gray-700 rounded-full hover:border-electric-green hover:text-electric-green transition-colors text-gray-400 shadow-lg"
                title="Analytics Dashboard"
                aria-label="Open analytics dashboard"
            >
                <Activity size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                            role="dialog"
                            aria-labelledby="analytics-title"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-electric-green/10 rounded border border-electric-green/30 text-electric-green">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2 id="analytics-title" className="text-xl font-bold text-white font-display">
                                        Learning Analytics
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                    aria-label="Close analytics"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <MetricCard
                                    icon={<Target />}
                                    label="Completion Rate"
                                    value={`${completionRate}%`}
                                    color="text-neon-cyan"
                                />
                                <MetricCard
                                    icon={<Zap />}
                                    label="XP Progress"
                                    value={`${xpProgress}%`}
                                    subtitle={`${userXP}/${totalXPPossible}`}
                                    color="text-electric-green"
                                />
                                <MetricCard
                                    icon={<Calendar />}
                                    label="Streak"
                                    value={`${streak} days`}
                                    color="text-plasma-pink"
                                />
                                <MetricCard
                                    icon={<Activity />}
                                    label="Learning Velocity"
                                    value={`${learningVelocity} /day`}
                                    color="text-alert-red"
                                />
                            </div>

                            {/* Category Breakdown */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <PieChart size={20} className="text-neon-cyan" />
                                    Category Progress
                                </h3>
                                <div className="space-y-3">
                                    {categoryData.map(cat => (
                                        <div key={cat.name} className="bg-gray-800/50 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-300">{cat.name}</span>
                                                <span className="text-sm text-gray-400">
                                                    {cat.mastered}/{cat.total} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-neon-cyan h-2 rounded-full transition-all"
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Clock size={20} className="text-electric-green" />
                                    Recent Activity
                                </h3>
                                <div className="space-y-2">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map(node => (
                                            <div key={node.id} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <Award size={16} className="text-plasma-pink" />
                                                    <span className="text-sm text-gray-300">{node.data.title}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {node.data.lastPracticedAt && formatDate(node.data.lastPracticedAt)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            No activity yet. Start learning to see your progress!
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
}: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    subtitle?: string;
    color: string;
}) {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className={`${color} mb-2`}>{icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
    );
}
