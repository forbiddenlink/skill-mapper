'use client';

import { useGameStore } from '@/lib/store';
import { getAchievement } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Star, Rocket, Medal, Award, Layers, Bot, Shield, Timer, Eye, Zap, Crown, GraduationCap, Footprints } from 'lucide-react';

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
    Footprints: <Footprints size={48} />,
    Star: <Star size={48} />,
    Trophy: <Trophy size={48} />,
    GraduationCap: <GraduationCap size={48} />,
    Flame: <Flame size={48} />,
    Zap: <Zap size={48} />,
    Crown: <Crown size={48} />,
    Rocket: <Rocket size={48} />,
    Medal: <Medal size={48} />,
    Award: <Award size={48} />,
    Layers: <Layers size={48} />,
    Bot: <Bot size={48} />,
    Shield: <Shield size={48} />,
    Timer: <Timer size={48} />,
    Eye: <Eye size={48} />,
};

const CATEGORY_COLORS: Record<string, string> = {
    mastery: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
    streak: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    xp: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    exploration: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    special: 'text-plasma-pink border-plasma-pink/30 bg-plasma-pink/10',
};

export default function AchievementNotification() {
    const latestAchievementId = useGameStore((state) => state.latestAchievementId);
    const dismissAchievement = useGameStore((state) => state.dismissAchievement);

    const achievement = latestAchievementId ? getAchievement(latestAchievementId) : null;

    if (!achievement) return null;

    const colorClass = CATEGORY_COLORS[achievement.category] || CATEGORY_COLORS.special;
    const icon = ACHIEVEMENT_ICONS[achievement.icon] || <Trophy size={48} />;

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    className="fixed left-1/2 top-20 z-[70] flex max-w-sm -translate-x-1/2 flex-col items-center rounded-[16px] border border-neon-cyan/30 bg-[#111]/95 p-6 shadow-2xl shadow-neon-cyan/10 backdrop-blur-md"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-neon-cyan/5 animate-pulse" />

                    <button
                        onClick={dismissAchievement}
                        className="absolute right-2 top-2 text-gray-500 transition-colors hover:text-white"
                        aria-label="Dismiss achievement notification"
                    >
                        <X size={16} />
                    </button>

                    <div className={`mb-4 rounded-full border p-4 ${colorClass}`}>
                        {icon}
                    </div>

                    <h3 className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">Achievement Unlocked</h3>
                    <h4 className="mb-2 text-lg font-semibold text-white">{achievement.name}</h4>
                    <p className="mb-4 text-center text-sm leading-relaxed text-gray-400">
                        {achievement.description}
                    </p>

                    {achievement.xpBonus && (
                        <div className="mb-4 rounded-full border border-electric-green/30 bg-electric-green/10 px-3 py-1 font-mono text-sm text-electric-green">
                            +{achievement.xpBonus} XP Bonus
                        </div>
                    )}

                    <button
                        onClick={dismissAchievement}
                        className="rounded-full bg-gradient-to-b from-neon-cyan-strong to-neon-cyan px-6 py-2 text-sm font-semibold text-[#0b0715] shadow-[var(--glow-accent)] transition-all hover:scale-105 hover:brightness-110"
                    >
                        Nice!
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
