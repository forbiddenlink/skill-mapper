'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp, Award } from 'lucide-react';
import { StreakData } from '@/types';
import { useGameStore } from '@/lib/store';

export function StreakTracker() {
    const { userXP } = useGameStore();
    
    // Calculate streak data
    const streakData = useMemo((): StreakData => {
        const today = new Date().toISOString().split('T')[0] ?? '';
        if (!today) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: '',
                activityCalendar: {}
            };
        }
        
        // Get stored streak data from localStorage
        const stored = localStorage.getItem('streakData');
        const data: StreakData = stored ? JSON.parse(stored) : {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: '',
            activityCalendar: {}
        };
        
        // Check if user was active today
        const todayActivity = data.activityCalendar[today] || 0;
        
        // Update streak if active today
        if (todayActivity > 0) {
            // Check if yesterday has activity to continue streak
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
            if (data.lastActivityDate === yesterday) {
                data.currentStreak += 1;
            } else if (data.lastActivityDate !== today) {
                data.currentStreak = 1;
            }
            data.lastActivityDate = today;
            data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
        } else {
            // Check if streak is broken
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
            if (data.lastActivityDate !== today && data.lastActivityDate !== yesterday) {
                data.currentStreak = 0;
            }
        }
        
        return data;
    }, [userXP]);
    
    // Generate last 30 days for calendar
    const calendarDays = useMemo(() => {
        const days: { date: string; xp: number; dayOfWeek: number }[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0] ?? '';
            const xp = streakData.activityCalendar[dateStr] || 0;
            
            days.push({
                date: dateStr,
                xp,
                dayOfWeek: date.getDay()
            });
        }
        
        return days;
    }, [streakData]);

    // Update activity calendar when XP changes
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0] ?? '';
        if (!today) return;
        const stored = localStorage.getItem('streakData');
        const data: StreakData = stored ? JSON.parse(stored) : {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: '',
            activityCalendar: {}
        };
        
        // Add today's XP
        data.activityCalendar[today] = userXP;
        
        localStorage.setItem('streakData', JSON.stringify(data));
    }, [userXP]);

    const getActivityColor = (xp: number) => {
        if (xp === 0) return 'bg-gray-800';
        if (xp < 100) return 'bg-green-900';
        if (xp < 500) return 'bg-green-700';
        if (xp < 1000) return 'bg-green-500';
        return 'bg-green-300';
    };

    const firstCalendarDay = calendarDays[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel-strong p-4 md:p-6"
        >
            {/* Streak Stats */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="grid h-10 w-10 place-items-center rounded-[12px] border border-warning-amber/40 bg-warning-amber/10"
                    >
                        <Flame className="text-warning-amber" size={20} />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-semibold text-white">{streakData.currentStreak} Day Streak</h3>
                        <p className="text-sm text-text-muted">Keep the momentum going.</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-warning-amber">
                        <Award size={20} />
                        <span className="font-semibold">Best: {streakData.longestStreak}</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="panel-base p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-neon-cyan" size={20} />
                    <h4 className="text-lg font-semibold text-white">Last 30 Days</h4>
                </div>
                
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-xs font-medium text-text-muted">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Fill empty cells at start */}
                    {firstCalendarDay && Array.from({ length: firstCalendarDay.dayOfWeek }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square"></div>
                    ))}
                    
                    {calendarDays.map((day, idx) => (
                        <motion.div
                            key={day.date}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className={`aspect-square rounded-[8px] ${getActivityColor(day.xp)} cursor-pointer transition-all hover:ring-2 hover:ring-neon-cyan`}
                            title={`${day.date}: ${day.xp} XP`}
                        />
                    ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-[4px] bg-gray-800"></div>
                        <div className="h-3 w-3 rounded-[4px] bg-green-900"></div>
                        <div className="h-3 w-3 rounded-[4px] bg-green-700"></div>
                        <div className="h-3 w-3 rounded-[4px] bg-green-500"></div>
                        <div className="h-3 w-3 rounded-[4px] bg-green-300"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Motivation */}
            <div className="mt-4 rounded-[12px] border border-warning-amber/35 bg-warning-amber/10 p-3">
                <div className="flex items-center gap-2 text-gray-200">
                    <TrendingUp size={18} className="text-warning-amber" />
                    <p className="text-sm font-medium">
                        {streakData.currentStreak === 0 
                            ? "Start your streak today! Complete any skill to begin." 
                            : streakData.currentStreak < 7
                            ? `Great start! ${7 - streakData.currentStreak} more days to reach a 1-week streak!`
                            : streakData.currentStreak < 30
                            ? `Amazing! You're ${streakData.currentStreak} days strong. Keep pushing!`
                            : "Legendary streak! You're a true master of consistency!"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
