import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    SkillNode,
    getInitialSkills,
    INITIAL_EDGES,
    SkillStatus
} from './skill-data';
import { BADGES } from './badges';
import { config } from './config';
import { Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import confetti from 'canvas-confetti';

/**
 * Main game state interface
 * Manages all skill tree data, user progress, and gamification features
 */
interface GameState {
    // Skill Tree Data
    nodes: SkillNode[];
    edges: Edge[];
    selectedSkillId: string | null;

    // User Progress
    userXP: number;
    userLevel: number;

    // Gamification
    unlockedBadges: string[];
    latestBadgeId: string | null; // Triggers UI popup
    lastVisit: number;
    streak: number;
    soundEnabled: boolean;

    // UI Actions
    toggleSound: () => void;
    selectSkill: (id: string | null) => void;
    dismissBadge: () => void;

    // React Flow Actions
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;

    // Skill Management Actions
    unlockSkill: (id: string) => void;
    completeSkill: (id: string) => void;
    refreshSkill: (id: string) => void;
    unlockBatch: (ids: string[]) => void;

    // System Actions
    checkDecay: () => void;
    checkStreak: () => void;
    resetProgress: () => void;
}

/**
 * Helper function to check if user has earned any new badges
 * Compares mastered skills against badge requirements
 * @param nodes - Current skill tree nodes
 * @param currentBadges - Already unlocked badge IDs
 * @returns Array of newly earned badge IDs
 */
const checkForNewBadges = (nodes: SkillNode[], currentBadges: string[]): string[] => {
    const masteredIds = new Set(nodes.filter(n => n.data.status === 'mastered').map(n => n.id));
    const newBadges: string[] = [];

    BADGES.forEach(badge => {
        if (!currentBadges.includes(badge.id)) {
            const hasAllReqs = badge.requirements.every(reqId => masteredIds.has(reqId));
            if (hasAllReqs) {
                newBadges.push(badge.id);
            }
        }
    });

    return newBadges;
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            nodes: getInitialSkills(), // Note: Positions need to be set properly elsewhere
            edges: INITIAL_EDGES,
            userXP: 0,
            userLevel: 1,
            selectedSkillId: null,
            unlockedBadges: [],
            latestBadgeId: null,
            lastVisit: 0,
            streak: 0,
            soundEnabled: true,

            checkStreak: () => {
                const { lastVisit, streak } = get();
                const now = new Date();
                const last = new Date(lastVisit);

                // Helper to strip time
                const isSameDay = (d1: Date, d2: Date) =>
                    d1.getDate() === d2.getDate() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getFullYear() === d2.getFullYear();

                if (isSameDay(now, last)) return; // Already visited today

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);

                if (isSameDay(yesterday, last)) {
                    // Visited yesterday! Increment
                    set({ streak: streak + 1, lastVisit: now.getTime() });
                } else {
                    // Broken streak or first visit
                    set({ streak: 1, lastVisit: now.getTime() });
                }
            },

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes) as SkillNode[],
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },

            selectSkill: (id) => set({ selectedSkillId: id }),

            unlockSkill: (id) => {
                const { nodes } = get();
                const skill = nodes.find((n) => n.id === id);
                if (!skill) return;

                // Validation: Check prerequisites
                const canUnlock = skill.data.prerequisites.every((reqId) => {
                    const reqNode = nodes.find((n) => n.id === reqId);
                    return reqNode?.data.status === 'mastered';
                });

                if (canUnlock && skill.data.status === 'locked') {
                    set((state) => ({
                        nodes: state.nodes.map((n) =>
                            n.id === id ? { ...n, data: { ...n.data, status: 'in-progress' } } : n
                        ),
                    }));
                }
            },

            completeSkill: (id) => {
                const { nodes, unlockedBadges } = get();
                const targetNode = nodes.find(n => n.id === id);
                if (!targetNode || targetNode.data.status === 'mastered') return;

                const xpGain = targetNode.data.xpReward;

                set((state) => {
                    const newXP = state.userXP + xpGain;
                    const newLevel = Math.floor(newXP / 1000) + 1;

                    // Updates status of Completed Node
                    const updatedNodes = state.nodes.map((n) =>
                        n.id === id ? { ...n, data: { ...n.data, status: 'mastered' as SkillStatus, lastPracticedAt: Date.now() } } : n
                    );

                    // Check for newly unlockable nodes
                    const nextNodes = updatedNodes.map((node) => {
                        if (node.data.status !== 'locked') return node;
                        const prereqsMet = node.data.prerequisites.every(reqId => {
                            const reqNode = updatedNodes.find(n => n.id === reqId);
                            return reqNode?.data.status === 'mastered';
                        });
                        if (prereqsMet) {
                            return { ...node, data: { ...node.data, status: 'available' as SkillStatus } };
                        }
                        return node;
                    });

                    // Check Badges
                    const newEarnedBadges = checkForNewBadges(nextNodes, unlockedBadges);
                    const latestBadge = newEarnedBadges.length > 0 ? newEarnedBadges[0] : state.latestBadgeId;

                    if (newEarnedBadges.length > 0) {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }

                    return {
                        userXP: newXP,
                        userLevel: newLevel,
                        nodes: nextNodes,
                        unlockedBadges: [...state.unlockedBadges, ...newEarnedBadges],
                        latestBadgeId: latestBadge
                    };
                });
            },

            refreshSkill: (id) => {
                set((state) => ({
                    nodes: state.nodes.map((n) =>
                        n.id === id ? { ...n, data: { ...n.data, status: 'mastered' as SkillStatus, lastPracticedAt: Date.now() } } : n
                    ),
                }));
            },

            checkDecay: () => {
                if (!config.features.decay) return;
                
                const THRESHOLD = config.gamification.decayThresholdMs;
                set((state) => ({
                    nodes: state.nodes.map((n) => {
                        if (n.data.status === 'mastered' && n.data.lastPracticedAt) {
                            if (Date.now() - n.data.lastPracticedAt > THRESHOLD) {
                                return { ...n, data: { ...n.data, status: 'decayed' as SkillStatus } };
                            }
                        }
                        return n;
                    }),
                }));
            },

            resetProgress: () => {
                set({
                    nodes: getInitialSkills(),
                    userXP: 0,
                    userLevel: 1,
                    unlockedBadges: [],
                    latestBadgeId: null,
                    lastVisit: Date.now(),
                    streak: 1
                });
            },

            unlockBatch: (ids) => {
                const { nodes, unlockedBadges } = get();

                // 1. Mark target nodes as mastered
                let newXP = get().userXP;
                const updatedNodes = nodes.map(node => {
                    if (ids.includes(node.id)) {
                        if (node.data.status !== 'mastered') {
                            newXP += node.data.xpReward;
                        }
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                status: 'mastered' as SkillStatus,
                                lastPracticedAt: Date.now()
                            }
                        };
                    }
                    return node;
                });

                // 2. Recalculate unlocks for dependent nodes
                const nextNodes = updatedNodes.map((node) => {
                    if (node.data.status === 'mastered') return node;
                    const prereqsMet = node.data.prerequisites.every(reqId => {
                        const reqNode = updatedNodes.find(n => n.id === reqId);
                        return reqNode?.data.status === 'mastered';
                    });
                    if (prereqsMet) {
                        return { ...node, data: { ...node.data, status: 'available' as SkillStatus } };
                    }
                    return node;
                });

                // Check Badges
                const newEarnedBadges = checkForNewBadges(nextNodes, unlockedBadges);
                if (newEarnedBadges.length > 0) {
                    confetti({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 }
                    });
                }

                set({
                    nodes: nextNodes,
                    userXP: newXP,
                    userLevel: Math.floor(newXP / 1000) + 1,
                    unlockedBadges: [...unlockedBadges, ...newEarnedBadges],
                    latestBadgeId: newEarnedBadges.length > 0 ? newEarnedBadges[0] : null
                });
            },

            dismissBadge: () => set({ latestBadgeId: null }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled }))
        }),
        {
            name: config.storage.key,
            version: config.storage.version,
        }
    )
);
