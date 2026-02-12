import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SkillsSlice } from './skills-store';

export interface UserSlice {
    userXP: number;
    userLevel: number;
    unlockedBadges: string[];
    latestBadgeId: string | null;
    lastVisit: number;
    streak: number;
    
    // Actions
    completeSkill: (id: string, xpReward: number) => void;
    addXP: (amount: number) => void;
    unlockBadge: (badgeId: string) => void;
    dismissBadge: () => void;
    checkStreak: () => void;
    resetProgress: () => void;
}

export const createUserSlice: StateCreator<
    UserSlice & SkillsSlice,
    [],
    [],
    UserSlice
> = (set, get) => ({
    userXP: 0,
    userLevel: 1,
    unlockedBadges: [],
    latestBadgeId: null,
    lastVisit: 0,
    streak: 0,

    completeSkill: (_id, xpReward) => {
        const newXP = get().userXP + xpReward;
        const newLevel = Math.floor(newXP / 1000) + 1;

        set({
            userXP: newXP,
            userLevel: newLevel,
        });

        // Trigger confetti on level up
        if (newLevel > get().userLevel) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
            });
        }
    },

    addXP: (amount) => {
        const newXP = get().userXP + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        
        set({
            userXP: newXP,
            userLevel: newLevel,
        });
    },

    unlockBadge: (badgeId) => {
        const current = get().unlockedBadges;
        if (!current.includes(badgeId)) {
            set({
                unlockedBadges: [...current, badgeId],
                latestBadgeId: badgeId,
            });
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
            });
        }
    },

    dismissBadge: () => set({ latestBadgeId: null }),

    checkStreak: () => {
        const { lastVisit, streak } = get();
        const now = new Date();
        const last = new Date(lastVisit);

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        if (isSameDay(now, last)) return;

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (isSameDay(yesterday, last)) {
            set({ streak: streak + 1, lastVisit: now.getTime() });
        } else {
            set({ streak: 1, lastVisit: now.getTime() });
        }
    },

    resetProgress: () => {
        set({
            userXP: 0,
            userLevel: 1,
            unlockedBadges: [],
            latestBadgeId: null,
            lastVisit: Date.now(),
            streak: 1,
        });
    },
});
