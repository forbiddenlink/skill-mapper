'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp, Award, Shield } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

function StreakShieldRow() {
    const streakShields = useGameStore((s) => s.streakShields);
    return (
        <div className="flex items-center justify-end gap-2 text-signal" title="Shields protect one missed day">
            <Shield size={16} />
            <span className="font-semibold">
                {streakShields} shield{streakShields === 1 ? '' : 's'}
            </span>
        </div>
    );
}

function generateCalendarDays(
    now: number,
    activityCalendar: Record<string, number>
): { date: string; xp: number; dayOfWeek: number }[] {
    const days: { date: string; xp: number; dayOfWeek: number }[] = [];
    const today = new Date(now);

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        days.push({
            date: dateStr,
            xp: activityCalendar[dateStr] || 0,
            dayOfWeek: date.getUTCDay(),
        });
    }

    return days;
}

export function StreakTracker() {
    const { streak, longestStreak, activityCalendar } = useGameStore(
        useShallow((s) => ({
            streak: s.streak,
            longestStreak: s.longestStreak,
            activityCalendar: s.activityCalendar,
        }))
    );

    const [mounted, setMounted] = useState(false);
    const [mountTime, setMountTime] = useState(0);

    useEffect(() => {
        setMountTime(Date.now());
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="panel-strong p-4 md:p-6">
                <p className="text-text-muted">Loading streak calendar…</p>
            </div>
        );
    }

    const calendarDays = generateCalendarDays(mountTime, activityCalendar);
    const firstCalendarDay = calendarDays[0];

    const getActivityColor = (xp: number) => {
        if (xp === 0) return 'bg-surface-3';
        if (xp < 100) return 'bg-mastery/25';
        if (xp < 500) return 'bg-mastery/45';
        if (xp < 1000) return 'bg-mastery/70';
        return 'bg-mastery';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-strong p-4 md:p-6"
        >
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-reward/40 bg-reward/10">
                        <Flame className="text-reward" size={20} />
                    </div>
                    <div>
                        <h3 className="font-display text-2xl font-semibold text-foreground">
                            {streak} day streak
                        </h3>
                        <p className="text-sm text-text-muted">Keep the momentum going.</p>
                    </div>
                </div>
                <div className="space-y-1 text-right font-mono text-sm">
                    <div className="flex items-center justify-end gap-2 text-reward">
                        <Award size={18} />
                        <span className="font-semibold">Best {longestStreak}</span>
                    </div>
                    <StreakShieldRow />
                </div>
            </div>

            <div className="panel-base p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Calendar className="text-signal" size={20} />
                    <h4 className="font-display text-lg font-semibold text-foreground">Last 30 days</h4>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center font-mono text-[10px] font-medium text-text-muted">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {firstCalendarDay &&
                        Array.from({ length: firstCalendarDay.dayOfWeek }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="aspect-square" />
                        ))}

                    {calendarDays.map((day, idx) => (
                        <motion.div
                            key={day.date}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className={`aspect-square cursor-pointer rounded-[6px] transition-all hover:ring-2 hover:ring-signal ${getActivityColor(day.xp)}`}
                            title={`${day.date}: ${day.xp} XP`}
                        />
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-[3px] bg-surface-3" />
                        <div className="h-3 w-3 rounded-[3px] bg-mastery/25" />
                        <div className="h-3 w-3 rounded-[3px] bg-mastery/45" />
                        <div className="h-3 w-3 rounded-[3px] bg-mastery/70" />
                        <div className="h-3 w-3 rounded-[3px] bg-mastery" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="mt-4 rounded-[10px] border border-reward/30 bg-reward/10 p-3">
                <div className="flex items-center gap-2 text-foreground/90">
                    <TrendingUp size={18} className="text-reward" />
                    <p className="text-sm font-medium">
                        {streak === 0
                            ? 'Start your streak today — complete any skill to begin.'
                            : streak < 7
                              ? `Great start. ${7 - streak} more days to a one-week streak.`
                              : streak < 30
                                ? `${streak} days strong. Keep going.`
                                : 'Legendary consistency. Protect this streak.'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
