import { StateCreator } from 'zustand';
import {
    SkillNode,
    getInitialSkills,
    getElkLayoutedSkills,
    SkillStatus,
    SkillCategory,
    INITIAL_EDGES,
} from '../skill-data';
import { Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { config } from '../config';
import type { RecommendedSkill, RecommendationReason } from './types';

export interface SkillsSlice {
    nodes: SkillNode[];
    edges: Edge[];
    selectedSkillId: string | null;
    recommendations: RecommendedSkill[];
    lastCalculated: number;

    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    selectSkill: (id: string | null) => void;
    unlockSkill: (id: string) => void;
    refreshSkill: (id: string) => void;
    checkDecay: () => void;
    calculateRecommendations: () => void;
    dismissRecommendation: (skillId: string) => void;
    applyElkLayout: () => Promise<void>;
}

export const createSkillsSlice: StateCreator<SkillsSlice, [], [], SkillsSlice> = (set, get) => ({
    nodes: getInitialSkills(),
    edges: INITIAL_EDGES,
    selectedSkillId: null,
    recommendations: [],
    lastCalculated: 0,

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

        if (skill.data.status === 'available') {
            set((state) => ({
                nodes: state.nodes.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, status: 'in-progress' } } : n
                ),
            }));
            return;
        }

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

    refreshSkill: (id) => {
        set((state) => ({
            nodes: state.nodes.map((n) =>
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

    calculateRecommendations: () => {
        const { nodes, userLevel } = get() as SkillsSlice & { userLevel: number };

        const categoryStats: Record<SkillCategory, { mastered: number; total: number }> = {
            frontend: { mastered: 0, total: 0 },
            backend: { mastered: 0, total: 0 },
            devops: { mastered: 0, total: 0 },
            cs: { mastered: 0, total: 0 },
            ml: { mastered: 0, total: 0 },
            data: { mastered: 0, total: 0 },
        };

        nodes.forEach((skill) => {
            categoryStats[skill.data.category].total++;
            if (skill.data.status === 'mastered') {
                categoryStats[skill.data.category].mastered++;
            }
        });

        const candidates = nodes.filter(
            (skill) =>
                skill.data.status === 'available' ||
                skill.data.status === 'in-progress' ||
                (skill.data.status === 'mastered' &&
                    skill.data.lastPracticedAt &&
                    Date.now() - skill.data.lastPracticedAt > 14 * 24 * 60 * 60 * 1000)
        );

        const scored = candidates.map((skill) => {
            let priority = 50;
            let reason: RecommendationReason = 'next-step';

            if (skill.data.status === 'mastered' && skill.data.lastPracticedAt) {
                const daysSinceLastPractice =
                    (Date.now() - skill.data.lastPracticedAt) / (1000 * 60 * 60 * 24);
                if (daysSinceLastPractice > 14) {
                    priority = 90 + Math.min(10, daysSinceLastPractice - 14);
                    reason = 'decay-prevention';
                    return {
                        skillId: skill.id,
                        priority,
                        reason,
                        category: skill.data.category,
                    };
                }
            }

            if (skill.data.status === 'available') {
                priority = 70;

                const tierScores: Record<string, number> = {
                    foundation: 1,
                    'frontend-2': 2,
                    'backend-data': 3,
                    'ai-engineer': 4,
                    systems: 5,
                };
                const skillTierLevel = tierScores[skill.data.tier] || 3;
                const optimalTierLevel = Math.min(5, Math.floor(userLevel / 3) + 1);

                if (skillTierLevel === optimalTierLevel) {
                    priority += 15;
                    reason = 'optimal-difficulty';
                } else if (Math.abs(skillTierLevel - optimalTierLevel) === 1) {
                    priority += 5;
                }

                const categoryProgress = categoryStats[skill.data.category];
                if (categoryProgress) {
                    const completionRate = categoryProgress.mastered / categoryProgress.total;
                    if (completionRate < 0.3) {
                        priority += 10;
                        reason = 'category-balance';
                    }
                }

                if (skill.data.xpReward <= 150) {
                    priority += 5;
                    if (reason === 'next-step') {
                        reason = 'quick-win';
                    }
                }

                if (skill.data.tier === 'foundation') {
                    priority += 10;
                }
            }

            if (skill.data.status === 'in-progress') {
                priority = 65;
            }

            return {
                skillId: skill.id,
                priority,
                reason,
                category: skill.data.category,
            };
        });

        const topRecommendations = scored.sort((a, b) => b.priority - a.priority).slice(0, 5);

        set({
            recommendations: topRecommendations,
            lastCalculated: Date.now(),
        });
    },

    dismissRecommendation: (skillId) => {
        set((state) => ({
            recommendations: state.recommendations.filter((rec) => rec.skillId !== skillId),
        }));
    },

    applyElkLayout: async () => {
        const layoutedNodes = await getElkLayoutedSkills();
        set({ nodes: layoutedNodes });
    },
});
