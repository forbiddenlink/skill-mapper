import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { config } from './config';
import { createUISlice, type UISlice } from './stores/ui-store';
import { createUndoRedoSlice, type UndoRedoSlice } from './stores/undo-redo-store';
import { createSkillsSlice, type SkillsSlice } from './stores/skills-store';
import { createUserSlice, type UserSlice } from './stores/user-store';
import { idbStateStorage } from './stores/idb-storage';

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
            version: 2,
            storage: createJSONStorage(() => idbStateStorage),
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                userXP: state.userXP,
                userLevel: state.userLevel,
                unlockedBadges: state.unlockedBadges,
                lastVisit: state.lastVisit,
                streak: state.streak,
                longestStreak: state.longestStreak,
                streakShields: state.streakShields,
                achievements: state.achievements,
                lastActivityDate: state.lastActivityDate,
                soundEnabled: state.soundEnabled,
                musicEnabled: state.musicEnabled,
            }),
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as Partial<GameState>;
                if (version < 2) {
                    return {
                        ...state,
                        streakShields: state.streakShields ?? 0,
                    } as GameState;
                }
                return state as GameState;
            },
        }
    )
);
