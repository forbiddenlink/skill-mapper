import type { SkillCategory } from '../skill-data';

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
    | 'quick-win'; // Easy skill for motivation boost
