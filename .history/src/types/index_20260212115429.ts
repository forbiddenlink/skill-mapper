// Core type definitions for the Skill Mapper application

import { Node, Edge } from 'reactflow';
import { LucideIcon } from 'lucide-react';

/**
 * Status of a skill in the learning progression
 */
export type SkillStatus = 'locked' | 'available' | 'in-progress' | 'mastered' | 'decayed';

/**
 * Tier/level of skills in the skill tree
 */
export type SkillTier = 'foundation' | 'frontend-2' | 'backend-data' | 'ai-engineer' | 'systems';

/**
 * Category for grouping related skills
 */
export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'cs' | 'ml' | 'data';

/**
 * Types of learning resources
 */
export type ResourceType = 'video' | 'article' | 'course' | 'paper' | 'lab';

/**
 * A quiz question for skill verification
 */
export interface SkillQuiz {
    question: string;
    options: string[];
    correctIndex: number;
}

/**
 * A learning resource for a skill
 */
export interface LearningResource {
    label: string;
    url: string;
    type: ResourceType;
}

/**
 * Core skill data structure
 */
export interface SkillData {
    id: string;
    title: string;
    description: string;
    tier: SkillTier;
    category: SkillCategory;
    status: SkillStatus;
    prerequisites: string[];
    xpReward: number;
    lastPracticedAt?: number;
    resources: LearningResource[];
    quiz?: SkillQuiz[];
}

/**
 * React Flow node with skill data
 */
export type SkillNode = Node<SkillData>;

/**
 * Badge/Achievement definition
 */
export interface Badge {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    requirements: string[]; // Skill IDs required to unlock
}

/**
 * Game state interface
 */
export interface GameState {
    nodes: SkillNode[];
    edges: Edge[];
    userXP: number;
    userLevel: number;
    selectedSkillId: string | null;
    unlockedBadges: string[];
    latestBadgeId: string | null;
    lastVisit: number;
    streak: number;
    soundEnabled: boolean;
}

/**
 * Save file format for import/export
 */
export interface SaveData {
    version: number;
    timestamp: number;
    state: Partial<GameState>;
}

/**
 * Daily Challenge definition
 */
export interface DailyChallenge {
    id: string;
    skillId: string;
    type: 'quiz' | 'practice' | 'review';
    title: string;
    description: string;
    xpBonus: number;
    expiresAt: number;
    completed: boolean;
}

/**
 * Streak data for tracking consistency
 */
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string; // YYYY-MM-DD format
    activityCalendar: Record<string, number>; // date -> xp earned
}

/**
 * Learning Path definition
 */
export interface LearningPath {
    id: string;
    title: string;
    description: string;
    icon: string;
    skills: string[]; // Ordered list of skill IDs
    targetRole: string;
    estimatedWeeks: number;
    color: string;
}

/**
 * Boss Battle - comprehensive tier challenge
 */
export interface BossBattle {
    id: string;
    tier: SkillTier;
    title: string;
    description: string;
    requiredSkills: string[]; // All skills in tier must be mastered
    questions: SkillQuiz[];
    xpReward: number;
    unlocksBadge: string;
    completed: boolean;
    attempts: number;
    bestScore?: number;
}

/**
 * Achievement milestone
 */
export interface Milestone {
    id: string;
    title: string;
    description: string;
    emoji: string;
    threshold: number; // XP or skill count threshold
    type: 'xp' | 'skills' | 'streak' | 'badges';
    celebrationMessage: string;
}
