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
    mastery: 'text-mastery border-mastery/30 bg-mastery/10',
    streak: 'text-reward border-reward/30 bg-reward/10',
    xp: 'text-reward border-reward/30 bg-reward/10',
    exploration: 'text-progress border-progress/30 bg-progress/10',
    special: 'text-signal border-signal/30 bg-signal/10',
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
                    className="fixed left-1/2 top-20 z-[70] flex max-w-sm -translate-x-1/2 flex-col items-center rounded-[14px] border border-signal/25 bg-surface-2 p-6 shadow-2xl"
                >
                    <button
                        onClick={dismissAchievement}
                        className="absolute right-2 top-2 text-text-muted transition-colors hover:text-foreground"
                        aria-label="Dismiss achievement notification"
                    >
                        <X size={16} />
                    </button>

                    <div className={`mb-4 rounded-full border p-4 ${colorClass}`}>
                        {icon}
                    </div>

                    <h3 className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">Achievement unlocked</h3>
                    <h4 className="font-display mb-2 text-lg font-semibold text-foreground">{achievement.name}</h4>
                    <p className="mb-4 text-center text-sm leading-relaxed text-text-muted">
                        {achievement.description}
                    </p>

                    {achievement.xpBonus && (
                        <div className="mb-4 rounded-[8px] border border-mastery/30 bg-mastery/10 px-3 py-1 font-mono text-sm text-mastery">
                            +{achievement.xpBonus} XP bonus
                        </div>
                    )}

                    <button
                        onClick={dismissAchievement}
                        className="btn-primary px-6"
                    >
                        Nice!
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
