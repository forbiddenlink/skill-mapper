/**
 * Core skill types for the skill tree visualization.
 * These types are used for ELK layout calculations and tree rendering.
 */

/**
 * Skill mastery level (0-100)
 * - 0: Not started
 * - 1-49: Learning
 * - 50-99: Practicing
 * - 100: Mastered
 */
export type MasteryLevel = number;

/**
 * Skill status in the learning progression
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
 * Core skill interface for ELK layout and tree visualization.
 * This is the simplified interface requested for skill tree operations.
 */
export interface Skill {
    /** Unique identifier for the skill */
    id: string;
    /** Display name of the skill */
    name: string;
    /** Tier level (0-4, maps to tree depth) */
    level: number;
    /** IDs of skills that must be mastered before this one */
    prerequisites: string[];
    /** IDs of skills that depend on this one */
    children: string[];
    /** Mastery percentage (0-100) */
    mastery: number;
    /** Current status in the learning progression */
    status?: SkillStatus;
    /** Skill category for grouping */
    category?: SkillCategory;
    /** Skill tier name */
    tier?: SkillTier;
}

/**
 * Position in 2D space for layout
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Skill with computed position from ELK layout
 */
export interface PositionedSkill extends Skill {
    position: Position;
}

/**
 * Edge connecting two skills in the tree
 */
export interface SkillEdge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
}

/**
 * Collapsed state for branches in the tree
 */
export interface CollapsedBranches {
    [skillId: string]: boolean;
}

/**
 * Tree visibility state for expand/collapse operations
 */
export interface TreeVisibility {
    /** Map of skill ID to collapsed state */
    collapsed: CollapsedBranches;
    /** Set of hidden skill IDs (collapsed children) */
    hiddenNodes: Set<string>;
}

/**
 * Layout algorithm options
 */
export type LayoutAlgorithm = 'layered' | 'force' | 'radial' | 'tree';

/**
 * Layout direction for hierarchical layouts
 */
export type LayoutDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * Animation state for layout transitions
 */
export interface LayoutAnimation {
    /** Whether animation is in progress */
    isAnimating: boolean;
    /** Animation progress (0-1) */
    progress: number;
    /** Starting positions */
    fromPositions: Map<string, Position>;
    /** Target positions */
    toPositions: Map<string, Position>;
}

/**
 * Tier to level mapping
 */
export const TIER_TO_LEVEL: Record<SkillTier, number> = {
    'foundation': 0,
    'frontend-2': 1,
    'backend-data': 2,
    'ai-engineer': 3,
    'systems': 4,
};

/**
 * Status to mastery mapping
 */
export const STATUS_TO_MASTERY: Record<SkillStatus, number> = {
    'locked': 0,
    'available': 0,
    'in-progress': 25,
    'mastered': 100,
    'decayed': 75,
};

/**
 * Build a map of skill children from prerequisites
 */
export function buildChildrenMap(skills: Array<{ id: string; prerequisites: string[] }>): Map<string, string[]> {
    const childrenMap = new Map<string, string[]>();

    // Initialize all skills with empty children arrays
    for (const skill of skills) {
        childrenMap.set(skill.id, []);
    }

    // Build children relationships from prerequisites
    for (const skill of skills) {
        for (const prereqId of skill.prerequisites) {
            const children = childrenMap.get(prereqId) || [];
            children.push(skill.id);
            childrenMap.set(prereqId, children);
        }
    }

    return childrenMap;
}
