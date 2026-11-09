import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { config } from './config';
import { createUISlice, type UISlice } from './stores/ui-store';
import { createUndoRedoSlice, type UndoRedoSlice } from './stores/undo-redo-store';
import { createSkillsSlice, type SkillsSlice } from './stores/skills-store';
import { createUserSlice, type UserSlice } from './stores/user-store';
import { idbStateStorage } from './stores/idb-storage';
import { mergeSavedProgress } from './stores/node-merge';
import { getInitialSkills, INITIAL_EDGES } from './skill-data';

export type { RecommendedSkill, RecommendationReason } from './stores/types';

/**
 * Composed game store: UI + undo/redo + skills tree + user progression.
 */
export type GameState = UISlice & UndoRedoSlice & SkillsSlice & UserSlice;

export const useGameStore = create<GameState>()(
    persist(
        (...args) => ({
            ...createUISlice(...args),
            ...createUndoRedoSlice(...args),
            ...createSkillsSlice(...args),
            ...createUserSlice(...args),
        }),
        {
            name: config.storage.key,
            version: 5,
            storage: createJSONStorage(() => idbStateStorage),
            partialize: (state) => ({
                nodes: state.nodes,
                userXP: state.userXP,
                userLevel: state.userLevel,
                unlockedBadges: state.unlockedBadges,
                lastVisit: state.lastVisit,
                streak: state.streak,
                longestStreak: state.longestStreak,
                streakShields: state.streakShields,
                achievements: state.achievements,
                lastActivityDate: state.lastActivityDate,
                activityCalendar: state.activityCalendar,
                completedDailyChallenges: state.completedDailyChallenges,
                bossProgress: state.bossProgress,
                soundEnabled: state.soundEnabled,
                musicEnabled: state.musicEnabled,
                hasOnboarded: state.hasOnboarded,
            }),
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as Partial<GameState>;
                let next = { ...state } as Partial<GameState>;
                if (version < 2) {
                    next = { ...next, streakShields: next.streakShields ?? 0 };
                }
                if (version < 3) {
                    next = {
                        ...next,
                        activityCalendar: next.activityCalendar ?? {},
                        completedDailyChallenges: next.completedDailyChallenges ?? [],
                    };
                }
                if (version < 4) {
                    next = {
                        ...next,
                        bossProgress: next.bossProgress ?? {},
                    };
                }
                if (version < 5) {
                    // Saves from before the flag existed: anyone with progress has onboarded.
                    const nodes = Array.isArray(next.nodes) ? next.nodes : [];
                    const hasProgress =
                        (next.userXP ?? 0) > 0 ||
                        nodes.some((n) => n?.data?.status === 'mastered');
                    next = { ...next, hasOnboarded: next.hasOnboarded ?? hasProgress };
                }
                return next as GameState;
            },
            // Progress comes from the save; skill content and edges come from the catalog.
            merge: (persistedState, currentState) => {
                const saved = (persistedState ?? {}) as Partial<GameState> & { edges?: unknown };
                const { edges: _staleEdges, ...rest } = saved;
                void _staleEdges;
                return {
                    ...currentState,
                    ...rest,
                    nodes: mergeSavedProgress(saved.nodes, getInitialSkills()),
                    edges: INITIAL_EDGES,
                };
            },
        }
    )
);
