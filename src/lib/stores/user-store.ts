import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { getInitialSkills, type SkillStatus } from '../skill-data';
import {
    calculateSkillXp,
    calculateLevel,
    getLevelInfo,
    updateStreakWithShield,
    shieldsEarnedForStreak,
    checkAchievements,
    getAchievement,
    type GamificationState,
    type LevelInfo,
} from '../gamification';
import { checkForNewBadges } from './badge-helpers';
import type { SkillsSlice } from './skills-store';
import type { UndoRedoSlice } from './undo-redo-store';

export interface UserSlice {
    userXP: number;
    userLevel: number;
    unlockedBadges: string[];
    latestBadgeId: string | null;
    lastVisit: number;
    streak: number;
    longestStreak: number;
    streakShields: number;
    achievements: string[];
    latestAchievementId: string | null;
    lastActivityDate: string | null;

    getLevelInfo: () => LevelInfo;
    dismissBadge: () => void;
    dismissAchievement: () => void;
    checkStreak: () => void;
    completeSkill: (id: string) => void;
    unlockBatch: (ids: string[]) => void;
    resetProgress: () => void;
}

type UserHost = UserSlice & SkillsSlice & UndoRedoSlice;

export const createUserSlice: StateCreator<UserHost, [], [], UserSlice> = (set, get) => ({
    userXP: 0,
    userLevel: 1,
    unlockedBadges: [],
    latestBadgeId: null,
    lastVisit: 0,
    streak: 0,
    longestStreak: 0,
    streakShields: 0,
    achievements: [],
    latestAchievementId: null,
    lastActivityDate: null,

    getLevelInfo: () => getLevelInfo(get().userXP),

    dismissBadge: () => set({ latestBadgeId: null }),

    dismissAchievement: () => set({ latestAchievementId: null }),

    checkStreak: () => {
        const { streak, longestStreak, lastActivityDate, streakShields } = get();
        const result = updateStreakWithShield(
            streak,
            longestStreak,
            lastActivityDate,
            streakShields
        );

        let nextShields = result.streakShields;
        if (result.streak > streak && shieldsEarnedForStreak(result.streak) > 0) {
            nextShields = Math.min(3, nextShields + shieldsEarnedForStreak(result.streak));
        }

        set({
            streak: result.streak,
            longestStreak: result.longestStreak,
            lastActivityDate: result.lastActivityDate,
            streakShields: nextShields,
            lastVisit: Date.now(),
        });
    },

    completeSkill: (id) => {
        const { nodes, unlockedBadges, streak, userXP, userLevel, pushHistory } = get();
        const targetNode = nodes.find((n) => n.id === id);
        if (!targetNode || targetNode.data.status === 'mastered') return;

        pushHistory({ nodes, userXP, userLevel }, `complete:${id}`);

        const xpGain = calculateSkillXp(targetNode, nodes, streak);

        set((state) => {
            const newXP = state.userXP + xpGain;
            const newLevel = calculateLevel(newXP);
            const oldLevel = state.userLevel;

            const updatedNodes = state.nodes.map((n) =>
                n.id === id
                    ? {
                          ...n,
                          data: {
                              ...n.data,
                              status: 'mastered' as SkillStatus,
                              lastPracticedAt: Date.now(),
                          },
                      }
                    : n
            );

            const nextNodes = updatedNodes.map((node) => {
                if (node.data.status !== 'locked') return node;
                const prereqsMet = node.data.prerequisites.every((reqId) => {
                    const reqNode = updatedNodes.find((n) => n.id === reqId);
                    return reqNode?.data.status === 'mastered';
                });
                if (prereqsMet) {
                    return { ...node, data: { ...node.data, status: 'available' as SkillStatus } };
                }
                return node;
            });

            const newEarnedBadges = checkForNewBadges(nextNodes, unlockedBadges);
            const latestBadge =
                newEarnedBadges.length > 0 ? newEarnedBadges[0] : state.latestBadgeId;

            const gamificationState: GamificationState = {
                xp: newXP,
                level: newLevel,
                streak: state.streak,
                longestStreak: state.longestStreak,
                achievements: state.achievements,
                lastActivityDate: state.lastActivityDate,
            };
            const newAchievements = checkAchievements(gamificationState, nextNodes);

            let achievementXpBonus = 0;
            newAchievements.forEach((achievementId) => {
                const achievement = getAchievement(achievementId);
                if (achievement?.xpBonus) {
                    achievementXpBonus += achievement.xpBonus;
                }
            });
            const finalXP = newXP + achievementXpBonus;
            const finalLevel = calculateLevel(finalXP);

            if (newLevel > oldLevel || newEarnedBadges.length > 0 || newAchievements.length > 0) {
                confetti({
                    particleCount: newLevel > oldLevel ? 200 : 150,
                    spread: 100,
                    origin: { y: 0.6 },
                });
            }

            return {
                userXP: finalXP,
                userLevel: finalLevel,
                nodes: nextNodes,
                unlockedBadges: [...state.unlockedBadges, ...newEarnedBadges],
                latestBadgeId: latestBadge,
                achievements: [...state.achievements, ...newAchievements],
                latestAchievementId:
                    newAchievements.length > 0 ? newAchievements[0] : state.latestAchievementId,
            };
        });
    },

    unlockBatch: (ids) => {
        const state = get();
        const { nodes, unlockedBadges, streak, userXP, userLevel, pushHistory } = state;
        pushHistory({ nodes, userXP, userLevel }, `unlock-batch:${ids.length}`);

        let newXP = state.userXP;
        const updatedNodes = nodes.map((node) => {
            if (ids.includes(node.id)) {
                if (node.data.status !== 'mastered') {
                    newXP += calculateSkillXp(node, nodes, streak);
                }
                return {
                    ...node,
                    data: {
                        ...node.data,
                        status: 'mastered' as SkillStatus,
                        lastPracticedAt: Date.now(),
                    },
                };
            }
            return node;
        });

        const nextNodes = updatedNodes.map((node) => {
            if (node.data.status === 'mastered') return node;
            const prereqsMet = node.data.prerequisites.every((reqId) => {
                const reqNode = updatedNodes.find((n) => n.id === reqId);
                return reqNode?.data.status === 'mastered';
            });
            if (prereqsMet) {
                return { ...node, data: { ...node.data, status: 'available' as SkillStatus } };
            }
            return node;
        });

        const newEarnedBadges = checkForNewBadges(nextNodes, unlockedBadges);

        const newLevel = calculateLevel(newXP);
        const gamificationState: GamificationState = {
            xp: newXP,
            level: newLevel,
            streak: state.streak,
            longestStreak: state.longestStreak,
            achievements: state.achievements,
            lastActivityDate: state.lastActivityDate,
        };
        const newAchievements = checkAchievements(gamificationState, nextNodes);

        let achievementXpBonus = 0;
        newAchievements.forEach((achievementId) => {
            const achievement = getAchievement(achievementId);
            if (achievement?.xpBonus) {
                achievementXpBonus += achievement.xpBonus;
            }
        });
        const finalXP = newXP + achievementXpBonus;
        const finalLevel = calculateLevel(finalXP);

        if (newEarnedBadges.length > 0 || newAchievements.length > 0) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
            });
        }

        set({
            nodes: nextNodes,
            userXP: finalXP,
            userLevel: finalLevel,
            unlockedBadges: [...unlockedBadges, ...newEarnedBadges],
            latestBadgeId: newEarnedBadges.length > 0 ? newEarnedBadges[0] : null,
            achievements: [...state.achievements, ...newAchievements],
            latestAchievementId: newAchievements.length > 0 ? newAchievements[0] : null,
        });
    },

    resetProgress: () => {
        set({
            nodes: getInitialSkills(),
            userXP: 0,
            userLevel: 1,
            unlockedBadges: [],
            latestBadgeId: null,
            lastVisit: Date.now(),
            streak: 1,
            longestStreak: 0,
            streakShields: 0,
            achievements: [],
            latestAchievementId: null,
            lastActivityDate: null,
            history: [],
            historyIndex: -1,
        });
    },
});
