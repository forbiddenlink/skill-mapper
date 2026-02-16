import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    SkillNode,
    getInitialSkills,
    INITIAL_EDGES,
    SkillStatus,
    SkillCategory
} from './skill-data';
import { BADGES } from './badges';
import { config } from './config';
import { Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import confetti from 'canvas-confetti';

/**
 * Recommended skill with reasoning and priority score
 */
export interface RecommendedSkill {
    skillId: string;
    priority: number; // 0-100, higher is better
    reason: RecommendationReason;
    category: SkillCategory;
}

/**
 * Reasons for recomm ending a skill
 */
export type RecommendationReason =
    | 'next-step' // Prerequisites met, logical next skill
    | 'decay-prevention' // Needs practice to maintain mastery
    | 'category-balance' // Diversify learning across categories
    | 'optimal-difficulty' // Matches current level/skill
    | 'quick-win'; // Easy skill for motivation boost

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

    // AI Recommendations
    recommendations: RecommendedSkill[];
    lastCalculated: number;

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

    // AI Recommendations Actions
    calculateRecommendations: () => void;
    dismissRecommendation: (skillId: string) => void;

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
        (set, get)  => ({
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
            recommendations: [],
            lastCalculated: 0,

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

                // Handle 'available' skills - start working on them
                if (skill.data.status === 'available') {
                    set((state) => ({
                        nodes: state.nodes.map((n) =>
                            n.id === id ? { ...n, data: { ...n.data, status: 'in-progress' } } : n
                        ),
                    }));
                    return;
                }

                // Validation: Check prerequisites for locked skills
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

            // AI Recommendations
            calculateRecommendations: () => {
                const { nodes, userLevel } = get();
                
                // Get category statistics for balancing
                const categoryStats: Record<SkillCategory, { mastered: number; total: number }> = {
                    frontend: { mastered: 0, total: 0 },
                    backend: { mastered: 0, total: 0 },
                    devops: { mastered: 0, total: 0 },
                    cs: { mastered: 0, total: 0 },
                    ml: { mastered: 0, total: 0 },
                    data: { mastered: 0, total: 0 },
                };
                
                nodes.forEach(skill => {
                    categoryStats[skill.data.category].total++;
                    if (skill.data.status === 'mastered') {
                        categoryStats[skill.data.category].mastered++;
                    }
                });
                
                // Get candidates (available, in-progress, or needing practice)
                const candidates = nodes.filter(skill => 
                    skill.data.status === 'available' ||
                    skill.data.status === 'in-progress' ||
                    (skill.data.status === 'mastered' && skill.data.lastPracticedAt && 
                     (Date.now() - skill.data.lastPracticedAt) > (14 * 24 * 60 * 60 * 1000))
                );
                
                // Calculate priority for each candidate
                const scored = candidates.map(skill => {
                    let priority = 50;
                    let reason: RecommendationReason = 'next-step';
                    
                    // High priority: Decay prevention
                    if (skill.data.status === 'mastered' && skill.data.lastPracticedAt) {
                        const daysSinceLastPractice = (Date.now() - skill.data.lastPracticedAt) / (1000 * 60 * 60 * 24);
                        if (daysSinceLastPractice > 14) {
                            priority = 90 + Math.min(10, daysSinceLastPractice - 14);
                            reason = 'decay-prevention';
                            return { skillId: skill.id, priority, reason, category: skill.data.category };
                        }
                    }
                    
                    // Available skills
                    if (skill.data.status === 'available') {
                        priority = 70;
                        
                        // Optimal difficulty
                        const tierScores: Record<string, number> = {
                            'foundation': 1,
                            'frontend-2': 2,
                            'backend-data': 3,
                            'ai-engineer': 4,
                            'systems': 5
                        };
                        const skillTierLevel = tierScores[skill.data.tier] || 3;
                        const optimalTierLevel = Math.min(5, Math.floor(userLevel / 3) + 1);
                        
                        if (skillTierLevel === optimalTierLevel) {
                            priority += 15;
                            reason = 'optimal-difficulty';
                        } else if (Math.abs(skillTierLevel - optimalTierLevel) === 1) {
                            priority += 5;
                        }
                        
                        // Category balance
                        const categoryProgress = categoryStats[skill.data.category];
                        if (categoryProgress) {
                            const completionRate = categoryProgress.mastered / categoryProgress.total;
                            if (completionRate < 0.3) {
                                priority += 10;
                                reason = 'category-balance';
                            }
                        }
                        
                        // Quick wins
                        if (skill.data.xpReward <= 150) {
                            priority += 5;
                            if (reason === 'next-step') {
                                reason = 'quick-win';
                            }
                        }
                        
                        // Foundation boost
                        if (skill.data.tier === 'foundation') {
                            priority += 10;
                        }
                    }
                    
                    // In-progress skills
                    if (skill.data.status === 'in-progress') {
                        priority = 65;
                    }
                    
                    return { skillId: skill.id, priority, reason, category: skill.data.category };
                });
                
                // Sort and take top 5
                const topRecommendations = scored
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 5);
                
                set({
                    recommendations: topRecommendations,
                    lastCalculated: Date.now(),
                });
            },
            
            dismissRecommendation: (skillId) => {
                set(state => ({
                    recommendations: state.recommendations.filter(rec => rec.skillId !== skillId),
                }));
            },

            dismissBadge: () => set({ latestBadgeId: null }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled }))
        }),
        {
            name: config.storage.key,
            version: config.storage.version,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Migration from version 0 to 1
                    // For now, we just return the persisted state as is, 
                    // but this structure allows future transformations
                    return persistedState as GameState;
                }
                return persistedState as GameState;
            },
        }
    )
);
