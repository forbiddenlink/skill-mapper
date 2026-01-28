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
