'use client';

import { useGameStore } from '@/lib/store';
import { BADGES } from '@/lib/badges';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BadgeNotification() {
    const { latestBadgeId, dismissBadge } = useGameStore();

    const badge = latestBadgeId ? BADGES.find(b => b.id === latestBadgeId) : null;

    return (
        <AnimatePresence>
            {badge && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    className="fixed left-1/2 top-6 z-[70] flex max-w-sm -translate-x-1/2 flex-col items-center rounded-[16px] border border-yellow-500/30 bg-[#111]/95 p-6 shadow-2xl shadow-yellow-500/10 backdrop-blur-md"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-yellow-500/5 rounded-2xl animate-pulse" />

                    <button
                        onClick={dismissBadge}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="mb-4 p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <badge.icon size={48} className={badge.color} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">Badge Unlocked!</h3>
                    <h4 className={`text-lg font-semibold ${badge.color} mb-2`}>{badge.label}</h4>
                    <p className="text-gray-400 text-center text-sm leading-relaxed mb-4">
                        {badge.description}
                    </p>

                    <button
                        onClick={dismissBadge}
                        className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 hover:scale-105 transition-all text-sm"
                    >
                        Awesome!
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
