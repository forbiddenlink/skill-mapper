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
import type { UISlice } from './ui-store';
import { trackSkillEvent } from '../posthog';

function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

export type BossProgressEntry = {
    completed: boolean;
    attempts: number;
    bestScore: number;
};

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
    activityCalendar: Record<string, number>;
    completedDailyChallenges: string[];
    bossProgress: Record<string, BossProgressEntry>;

    getLevelInfo: () => LevelInfo;
    dismissBadge: () => void;
    dismissAchievement: () => void;
    checkStreak: () => void;
    recordActivity: (xpEarned: number) => void;
    completeDailyChallenge: (challengeId: string, xpBonus: number) => boolean;
    recordBossResult: (input: {
        bossId: string;
        score: number;
        questionCount: number;
        xpReward: number;
        badgeId: string;
    }) => boolean;
    completeSkill: (id: string) => void;
    unlockBatch: (ids: string[]) => void;
    resetProgress: () => void;
}

type UserHost = UserSlice & SkillsSlice & UndoRedoSlice & UISlice;

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
    activityCalendar: {},
    completedDailyChallenges: [],
    bossProgress: {},

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

    recordActivity: (xpEarned) => {
        const day = todayUtc();
        set((state) => ({
            activityCalendar: {
                ...state.activityCalendar,
                [day]: (state.activityCalendar[day] ?? 0) + Math.max(0, xpEarned),
            },
        }));
        get().checkStreak();
    },

    completeDailyChallenge: (challengeId, xpBonus) => {
        const { completedDailyChallenges, userXP, openSharePrompt } = get();
        if (completedDailyChallenges.includes(challengeId)) return false;

        const nextXP = userXP + xpBonus;
        const nextLevel = calculateLevel(nextXP);

        set({
            userXP: nextXP,
            userLevel: nextLevel,
            completedDailyChallenges: [...completedDailyChallenges, challengeId],
        });

        get().recordActivity(xpBonus);
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.65 } });
        openSharePrompt('daily-challenge');
        trackSkillEvent.dailyChallengeCompleted(challengeId, xpBonus);
        return true;
    },

    recordBossResult: ({ bossId, score, questionCount, xpReward, badgeId }) => {
        const state = get();
        const prev = state.bossProgress[bossId] ?? { completed: false, attempts: 0, bestScore: 0 };
        const passed = score >= Math.ceil(questionCount * 0.7);
        const firstClear = passed && !prev.completed;

        const nextEntry: BossProgressEntry = {
            completed: prev.completed || passed,
            attempts: prev.attempts + 1,
            bestScore: Math.max(prev.bestScore, score),
        };

        set({
            bossProgress: { ...state.bossProgress, [bossId]: nextEntry },
            ...(firstClear
                ? {
                      userXP: state.userXP + xpReward,
                      userLevel: calculateLevel(state.userXP + xpReward),
                      unlockedBadges: state.unlockedBadges.includes(badgeId)
                          ? state.unlockedBadges
                          : [...state.unlockedBadges, badgeId],
                      latestBadgeId: state.unlockedBadges.includes(badgeId)
                          ? state.latestBadgeId
                          : badgeId,
                  }
                : {}),
        });

        if (firstClear) {
            get().recordActivity(xpReward);
            confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } });
            get().openSharePrompt('boss-battle');
            trackSkillEvent.bossBattleCompleted(bossId, score, true);
        } else {
            trackSkillEvent.bossBattleCompleted(bossId, score, passed);
        }

        return passed;
    },

    completeSkill: (id) => {
        const { nodes, unlockedBadges, streak, userXP, userLevel, pushHistory } = get();
        const targetNode = nodes.find((n) => n.id === id);
        if (!targetNode || targetNode.data.status === 'mastered') return;

        pushHistory({ nodes, userXP, userLevel }, `complete:${id}`);

        const xpGain = calculateSkillXp(targetNode, nodes, streak);
        const xpBefore = userXP;

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

        const day = todayUtc();
        const wasFirstActivityToday = !((get().activityCalendar[day] ?? 0) > 0);
        get().recordActivity(Math.max(0, get().userXP - xpBefore));
        const skill = get().nodes.find((n) => n.id === id);
        if (skill) {
            trackSkillEvent.skillCompleted(id, skill.data.title, get().userXP - xpBefore);
        }
        if (get().userLevel > userLevel) {
            trackSkillEvent.levelUp(get().userLevel, get().userXP);
            get().openSharePrompt('level-up');
        } else if (wasFirstActivityToday) {
            get().openSharePrompt('skill-mastery');
        }
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
        const xpDelta = finalXP - state.userXP;

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

        get().recordActivity(xpDelta);
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
            activityCalendar: {},
            completedDailyChallenges: [],
            bossProgress: {},
            history: [],
            historyIndex: -1,
        });
    },
});
