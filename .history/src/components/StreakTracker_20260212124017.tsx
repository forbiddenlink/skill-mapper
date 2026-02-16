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
        const today = new Date().toISOString().split('T')[0] as string;
        
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
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
            if (data.lastActivityDate === yesterday) {
                data.currentStreak += 1;
            } else if (data.lastActivityDate !== today) {
                data.currentStreak = 1;
            }
            data.lastActivityDate = today;
            data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
        } else {
            // Check if streak is broken
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
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
            const dateStr = date.toISOString().split('T')[0] as string;
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
        const today = new Date().toISOString().split('T')[0] as string;
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-br from-orange-900 to-red-900 rounded-lg border-2 border-orange-500 shadow-2xl"
        >
            {/* Streak Stats */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Flame className="text-orange-400" size={32} />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{streakData.currentStreak} Day Streak!</h3>
                        <p className="text-sm text-orange-200">Keep the momentum going</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Award size={20} />
                        <span className="font-semibold">Best: {streakData.longestStreak}</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-black/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-orange-300" size={20} />
                    <h4 className="text-lg font-semibold text-white">Last 30 Days</h4>
                </div>
                
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-xs text-gray-400 font-medium">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Fill empty cells at start */}
                    {calendarDays.length > 0 && calendarDays[0] && Array.from({ length: calendarDays[0].dayOfWeek }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="aspect-square"></div>
                    ))}
                    
                    {calendarDays.map((day, idx) => (
                        <motion.div
                            key={day.date}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className={`aspect-square rounded ${getActivityColor(day.xp)} cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all`}
                            title={`${day.date}: ${day.xp} XP`}
                        />
                    ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded bg-gray-800"></div>
                        <div className="w-3 h-3 rounded bg-green-900"></div>
                        <div className="w-3 h-3 rounded bg-green-700"></div>
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <div className="w-3 h-3 rounded bg-green-300"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Motivation */}
            <div className="mt-4 p-3 bg-orange-800/50 rounded-lg border border-orange-600">
                <div className="flex items-center gap-2 text-orange-100">
                    <TrendingUp size={18} />
                    <p className="text-sm font-medium">
                        {streakData.currentStreak === 0 
                            ? "Start your streak today! Complete any skill to begin." 
                            : streakData.currentStreak < 7
                            ? `Great start! ${7 - streakData.currentStreak} more days to reach a 1-week streak!`
                            : streakData.currentStreak < 30
                            ? `Amazing! You're ${streakData.currentStreak} days strong. Keep pushing!`
                            : "Legendary streak! You're a true master of consistency! 🏆"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
