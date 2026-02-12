import { StateCreator } from 'zustand';
import { SkillsSlice } from './skills-store';
import { UserSlice } from './user-store';
import { SkillNode, SkillCategory } from '../skill-data';

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
 * Reasons for recommending a skill
 */
export type RecommendationReason =
    | 'next-step' // Prerequisites met, logical next skill
    | 'decay-prevention' // Needs practice to maintain mastery
    | 'category-balance' // Diversify learning across categories
    | 'optimal-difficulty' // Matches current level/skill
    | 'trending' // Popular/important in current tech landscape
    | 'quick-win'; // Easy skill for motivation boost

export interface RecommendationsSlice {
    recommendations: RecommendedSkill[];
    lastCalculated: number;
    
    // Actions
    calculateRecommendations: () => void;
    dismissRecommendation: (skillId: string) => void;
    refreshRecommendations: () => void;
}

/**
 * Calculate priority score for a skill based on multiple factors
 */
const calculatePriority = (
    skill: SkillNode,
    allSkills: SkillNode[],
    userLevel: number,
    categoryStats: Record<SkillCategory, { mastered: number; total: number }>
): { priority: number; reason: RecommendationReason } => {
    let priority = 50; // Base priority
    let reason: RecommendationReason = 'next-step';
    
    // Factor 1: Decay prevention (highest priority)
    if (skill.data.status === 'mastered' && skill.data.lastPracticedAt) {
        const daysSinceLastPractice = (Date.now() - skill.data.lastPracticedAt) / (1000 * 60 * 60 * 24);
        if (daysSinceLastPractice > 14) { // 2 weeks
            priority = 90 + Math.min(10, daysSinceLastPractice - 14);
            reason = 'decay-prevention';
            return { priority, reason };
        }
    }
    
    // Factor 2: Available skills (prerequisites met)
    if (skill.data.status === 'available') {
        priority = 70;
        
        // Factor 2a: Optimal difficulty (matches current level)
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
        
        // Factor 2b: Category balance
        const categoryProgress = categoryStats[skill.data.category];
        if (categoryProgress) {
            const completionRate = categoryProgress.mastered / categoryProgress.total;
            // Boost categories with low completion
            if (completionRate < 0.3) {
                priority += 10;
                reason = 'category-balance';
            }
        }
        
        // Factor 2c: Quick wins (low XP reward = easier skill)
        if (skill.data.xpReward <= 150) {
            priority += 5;
            if (reason === 'next-step') {
                reason = 'quick-win';
            }
        }
        
        // Factor 2d: Foundation skills boost
        if (skill.data.tier === 'foundation') {
            priority += 10;
        }
    }
    
    // Factor 3: In-progress skills (encourage completion)
    if (skill.data.status === 'in-progress') {
        priority = 65;
    }
    
    return { priority, reason };
};

/**
 * Get category statistics for balancing recommendations
 */
const getCategoryStats = (skills: SkillNode[]): Record<SkillCategory, { mastered: number; total: number }> => {
    const stats: Record<SkillCategory, { mastered: number; total: number }> = {
        frontend: { mastered: 0, total: 0 },
        backend: { mastered: 0, total: 0 },
        devops: { mastered: 0, total: 0 },
        cs: { mastered: 0, total: 0 },
        ml: { mastered: 0, total: 0 },
        data: { mastered: 0, total: 0 },
    };
    
    skills.forEach(skill => {
        stats[skill.data.category].total++;
        if (skill.data.status === 'mastered') {
            stats[skill.data.category].mastered++;
        }
    });
    
    return stats;
};

export const createRecommendationsSlice: StateCreator<
    RecommendationsSlice & SkillsSlice & UserSlice,
    [],
    [],
    RecommendationsSlice
> = (set, get) => ({
    recommendations: [],
    lastCalculated: 0,
    
    calculateRecommendations: () => {
        const { nodes, userLevel } = get();
        const categoryStats = getCategoryStats(nodes);
        
        // Get all relevant skills (available, in-progress, or needing practice)
        const candidates = nodes.filter(skill => 
            skill.data.status === 'available' ||
            skill.data.status === 'in-progress' ||
            (skill.data.status === 'mastered' && skill.data.lastPracticedAt && 
             (Date.now() - skill.data.lastPracticedAt) > (14 * 24 * 60 * 60 * 1000))
        );
        
        // Calculate priorities and reasons
        const scored = candidates.map(skill => {
            const { priority, reason } = calculatePriority(skill, nodes, userLevel, categoryStats);
            return {
                skillId: skill.id,
                priority,
                reason,
                category: skill.data.category,
            };
        });
        
        // Sort by priority (descending) and take top 5
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
    
    refreshRecommendations: () => {
        get().calculateRecommendations();
    },
});
