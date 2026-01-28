import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/lib/store';

describe('Game Store', () => {
    beforeEach(() => {
        // Reset store before each test
        useGameStore.getState().resetProgress();
    });

    describe('Initial State', () => {
        it('should have correct initial values', () => {
            const state = useGameStore.getState();
            expect(state.userXP).toBe(0);
            expect(state.userLevel).toBe(1);
            expect(state.unlockedBadges).toEqual([]);
            expect(state.soundEnabled).toBe(true);
        });

        it('should have nodes and edges', () => {
            const state = useGameStore.getState();
            expect(state.nodes.length).toBeGreaterThan(0);
            expect(state.edges.length).toBeGreaterThan(0);
        });
    });

    describe('Skill Unlocking', () => {
        it('should unlock a skill with no prerequisites', () => {
            const state = useGameStore.getState();
            const availableSkill = state.nodes.find(n => n.data.status === 'available');
            
            if (availableSkill) {
                useGameStore.getState().unlockSkill(availableSkill.id);
                const updatedState = useGameStore.getState();
                const unlockedSkill = updatedState.nodes.find(n => n.id === availableSkill.id);
                expect(unlockedSkill?.data.status).toBe('in-progress');
            }
        });

        it('should not unlock a locked skill with unmet prerequisites', () => {
            const state = useGameStore.getState();
            const lockedSkill = state.nodes.find(n => n.data.status === 'locked');
            
            if (lockedSkill) {
                useGameStore.getState().unlockSkill(lockedSkill.id);
                const updatedState = useGameStore.getState();
                const stillLocked = updatedState.nodes.find(n => n.id === lockedSkill.id);
                expect(stillLocked?.data.status).toBe('locked');
            }
        });
    });

    describe('Skill Completion', () => {
        it('should award XP when completing a skill', () => {
            const state = useGameStore.getState();
            const initialXP = state.userXP;
            const availableSkill = state.nodes.find(n => n.data.status === 'available');
            
            if (availableSkill) {
                // Unlock and complete
                useGameStore.getState().unlockSkill(availableSkill.id);
                useGameStore.getState().completeSkill(availableSkill.id);
                
                const updatedState = useGameStore.getState();
                expect(updatedState.userXP).toBeGreaterThan(initialXP);
            }
        });

        it('should update skill status to mastered', () => {
            const state = useGameStore.getState();
            const availableSkill = state.nodes.find(n => n.data.status === 'available');
            
            if (availableSkill) {
                useGameStore.getState().unlockSkill(availableSkill.id);
                useGameStore.getState().completeSkill(availableSkill.id);
                
                const updatedState = useGameStore.getState();
                const masteredSkill = updatedState.nodes.find(n => n.id === availableSkill.id);
                expect(masteredSkill?.data.status).toBe('mastered');
            }
        });
    });

    describe('Sound Toggle', () => {
        it('should toggle sound on and off', () => {
            const initialState = useGameStore.getState();
            const initialSound = initialState.soundEnabled;
            
            useGameStore.getState().toggleSound();
            expect(useGameStore.getState().soundEnabled).toBe(!initialSound);
            
            useGameStore.getState().toggleSound();
            expect(useGameStore.getState().soundEnabled).toBe(initialSound);
        });
    });

    describe('Progress Reset', () => {
        it('should reset all progress', () => {
            // Make some progress
            const availableSkill = useGameStore.getState().nodes.find(n => n.data.status === 'available');
            if (availableSkill) {
                useGameStore.getState().unlockSkill(availableSkill.id);
                useGameStore.getState().completeSkill(availableSkill.id);
            }
            
            // Reset
            useGameStore.getState().resetProgress();
            
            const state = useGameStore.getState();
            expect(state.userXP).toBe(0);
            expect(state.userLevel).toBe(1);
            expect(state.unlockedBadges).toEqual([]);
        });
    });
});
