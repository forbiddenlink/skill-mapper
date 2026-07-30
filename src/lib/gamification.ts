/**
 * Gamification Utilities
 * XP calculation, level progression, achievements, and streak tracking
 */

import { SkillNode, SkillCategory, SkillTier } from './skill-data';

// ============================================================================
// Types
// ============================================================================

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  achievements: string[];
  lastActivityDate: string | null; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  category: 'mastery' | 'streak' | 'xp' | 'exploration' | 'special';
  condition: (state: GamificationState, skills: SkillNode[]) => boolean;
  xpBonus?: number;
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  title: string;
}

// ============================================================================
// Level Progression (Exponential Curve)
// ============================================================================

/**
 * Calculate level from XP using exponential curve
 * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, Level 4 = 900 XP, etc.
 * Formula: level = floor(sqrt(xp / 100)) + 1
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculate total XP required to reach a specific level
 * Formula: xp = (level - 1)^2 * 100
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Calculate XP required to go from current level to next level
 */
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1) - xpForLevel(currentLevel);
}

/**
 * Get detailed level information including progress
 */
export function getLevelInfo(xp: number): LevelInfo {
  const level = calculateLevel(xp);
  const xpForCurrent = xpForLevel(level);
  const xpForNext = xpForLevel(level + 1);
  const xpInCurrentLevel = xp - xpForCurrent;
  const xpNeededForNext = xpForNext - xpForCurrent;
  const progressPercent = Math.floor((xpInCurrentLevel / xpNeededForNext) * 100);

  return {
    level,
    currentXp: xp,
    xpForCurrentLevel: xpForCurrent,
    xpForNextLevel: xpForNext,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    title: getLevelTitle(level),
  };
}

/**
 * Get title/rank based on level
 */
export function getLevelTitle(level: number): string {
  if (level <= 2) return 'Novice';
  if (level <= 5) return 'Apprentice';
  if (level <= 10) return 'Developer';
  if (level <= 15) return 'Engineer';
  if (level <= 20) return 'Senior Engineer';
  if (level <= 30) return 'Staff Engineer';
  if (level <= 40) return 'Principal Engineer';
  if (level <= 50) return 'Distinguished Engineer';
  return 'Legendary';
}

// ============================================================================
// XP Calculation
// ============================================================================

/**
 * Calculate XP earned for mastering a skill
 * Bonus XP for completing prerequisites quickly, category diversity, etc.
 */
export function calculateSkillXp(
  skill: SkillNode,
  _allSkills: SkillNode[],
  currentStreak: number
): number {
  let xp = skill.data.xpReward;

  // Streak multiplier: +5% per streak day (max +50%)
  const streakBonus = Math.min(0.5, currentStreak * 0.05);
  xp = Math.floor(xp * (1 + streakBonus));

  // Tier bonus: higher tiers give more XP
  const tierMultipliers: Record<SkillTier, number> = {
    foundation: 1.0,
    'frontend-2': 1.1,
    'backend-data': 1.2,
    'ai-engineer': 1.3,
    systems: 1.4,
  };
  xp = Math.floor(xp * (tierMultipliers[skill.data.tier] || 1.0));

  return xp;
}

/**
 * Calculate total XP from all mastered skills
 */
export function calculateTotalXp(skills: SkillNode[]): number {
  return skills
    .filter((s) => s.data.status === 'mastered')
    .reduce((total, skill) => total + skill.data.xpReward, 0);
}

// ============================================================================
// Streak Tracking
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const now = new Date();
  const isoString = now.toISOString();
  return isoString.substring(0, 10);
}

/**
 * Check if two dates are consecutive days
 */
export function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Check if two date strings represent the same day
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Update streak based on activity
 * Returns new streak state
 */
export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null
): { streak: number; longestStreak: number; lastActivityDate: string } {
  const today = getTodayDate();

  // First activity ever
  if (!lastActivityDate) {
    return {
      streak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActivityDate: today,
    };
  }

  // Same day - no change
  if (isSameDay(lastActivityDate, today)) {
    return {
      streak: currentStreak,
      longestStreak,
      lastActivityDate,
    };
  }

  // Consecutive day - increment streak
  if (isConsecutiveDay(lastActivityDate, today)) {
    const newStreak = currentStreak + 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActivityDate: today,
    };
  }

  // Streak broken - reset to 1
  return {
    streak: 1,
    longestStreak,
    lastActivityDate: today,
  };
}

/**
 * Calculate streak bonus XP
 */
export function getStreakBonus(streak: number): number {
  if (streak <= 1) return 0;
  if (streak <= 3) return 25;
  if (streak <= 7) return 50;
  if (streak <= 14) return 100;
  if (streak <= 30) return 200;
  return 500;
}

/**
 * Apply streak update with optional shield protection.
 * If the streak would break and shields > 0, consume one shield and keep the streak.
 */
export function updateStreakWithShield(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null,
  streakShields: number
): {
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakShields: number;
  shieldUsed: boolean;
} {
  const today = getTodayDate();

  if (!lastActivityDate) {
    return {
      streak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActivityDate: today,
      streakShields,
      shieldUsed: false,
    };
  }

  if (isSameDay(lastActivityDate, today)) {
    return {
      streak: currentStreak,
      longestStreak,
      lastActivityDate,
      streakShields,
      shieldUsed: false,
    };
  }

  if (isConsecutiveDay(lastActivityDate, today)) {
    const newStreak = currentStreak + 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActivityDate: today,
      streakShields,
      shieldUsed: false,
    };
  }

  // Gap detected — try shield before resetting
  if (streakShields > 0 && currentStreak > 0) {
    return {
      streak: currentStreak,
      longestStreak,
      lastActivityDate: today,
      streakShields: streakShields - 1,
      shieldUsed: true,
    };
  }

  return {
    streak: 1,
    longestStreak,
    lastActivityDate: today,
    streakShields,
    shieldUsed: false,
  };
}

/**
 * Earn streak shields from milestones (max 3 held).
 */
export function shieldsEarnedForStreak(streak: number): number {
  if (streak >= 30) return 1;
  if (streak >= 14) return 1;
  if (streak >= 7) return 1;
  return 0;
}


// ============================================================================
// Achievements
// ============================================================================

/**
 * All available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Mastery achievements
  {
    id: 'first_mastery',
    name: 'First Steps',
    description: 'Master your first skill',
    icon: 'Footprints',
    category: 'mastery',
    condition: (_, skills) =>
      skills.filter((s) => s.data.status === 'mastered').length >= 1,
    xpBonus: 50,
  },
  {
    id: 'five_mastered',
    name: 'Getting Serious',
    description: 'Master 5 skills',
    icon: 'Star',
    category: 'mastery',
    condition: (_, skills) =>
      skills.filter((s) => s.data.status === 'mastered').length >= 5,
    xpBonus: 100,
  },
  {
    id: 'ten_mastered',
    name: 'Skill Collector',
    description: 'Master 10 skills',
    icon: 'Trophy',
    category: 'mastery',
    condition: (_, skills) =>
      skills.filter((s) => s.data.status === 'mastered').length >= 10,
    xpBonus: 250,
  },
  {
    id: 'twenty_mastered',
    name: 'Knowledge Seeker',
    description: 'Master 20 skills',
    icon: 'GraduationCap',
    category: 'mastery',
    condition: (_, skills) =>
      skills.filter((s) => s.data.status === 'mastered').length >= 20,
    xpBonus: 500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: 'Flame',
    category: 'streak',
    condition: (state) => state.streak >= 3,
    xpBonus: 75,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Zap',
    category: 'streak',
    condition: (state) => state.streak >= 7,
    xpBonus: 200,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'Crown',
    category: 'streak',
    condition: (state) => state.streak >= 30,
    xpBonus: 1000,
  },

  // XP achievements
  {
    id: 'xp_1000',
    name: 'Rising Star',
    description: 'Earn 1,000 XP',
    icon: 'Rocket',
    category: 'xp',
    condition: (state) => state.xp >= 1000,
    xpBonus: 100,
  },
  {
    id: 'xp_5000',
    name: 'Experienced',
    description: 'Earn 5,000 XP',
    icon: 'Medal',
    category: 'xp',
    condition: (state) => state.xp >= 5000,
    xpBonus: 250,
  },
  {
    id: 'xp_10000',
    name: 'Veteran',
    description: 'Earn 10,000 XP',
    icon: 'Award',
    category: 'xp',
    condition: (state) => state.xp >= 10000,
    xpBonus: 500,
  },

  // Exploration achievements (category diversity)
  {
    id: 'full_stack',
    name: 'Full Stack Explorer',
    description: 'Master at least one skill in frontend, backend, and devops',
    icon: 'Layers',
    category: 'exploration',
    condition: (_, skills) => {
      const masteredCategories = new Set(
        skills
          .filter((s) => s.data.status === 'mastered')
          .map((s) => s.data.category)
      );
      return (
        masteredCategories.has('frontend') &&
        masteredCategories.has('backend') &&
        masteredCategories.has('devops')
      );
    },
    xpBonus: 300,
  },
  {
    id: 'ai_curious',
    name: 'AI Curious',
    description: 'Master your first ML or AI skill',
    icon: 'Bot',
    category: 'exploration',
    condition: (_, skills) =>
      skills.some(
        (s) =>
          s.data.status === 'mastered' &&
          (s.data.category === 'ml' || s.data.tier === 'ai-engineer')
      ),
    xpBonus: 200,
  },

  // Special achievements
  {
    id: 'foundation_complete',
    name: 'Solid Foundation',
    description: 'Master all foundation tier skills',
    icon: 'Shield',
    category: 'special',
    condition: (_, skills) => {
      const foundationSkills = skills.filter(
        (s) => s.data.tier === 'foundation'
      );
      return (
        foundationSkills.length > 0 &&
        foundationSkills.every((s) => s.data.status === 'mastered')
      );
    },
    xpBonus: 500,
  },
  {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Master 3 skills in a single day',
    icon: 'Timer',
    category: 'special',
    condition: (_, skills) => {
      const today = getTodayDate();
      const todayStart = new Date(today).getTime();
      const todayEnd = todayStart + 24 * 60 * 60 * 1000;
      const masteredToday = skills.filter((s) => {
        const practicedAt = s.data.lastPracticedAt;
        return (
          s.data.status === 'mastered' &&
          practicedAt &&
          practicedAt >= todayStart &&
          practicedAt < todayEnd
        );
      });
      return masteredToday.length >= 3;
    },
    xpBonus: 150,
  },
  {
    id: 'no_decay',
    name: 'Ever Vigilant',
    description: 'Have no decayed skills while having 5+ mastered',
    icon: 'Eye',
    category: 'special',
    condition: (_, skills) => {
      const mastered = skills.filter((s) => s.data.status === 'mastered').length;
      const decayed = skills.filter((s) => s.data.status === 'decayed').length;
      return mastered >= 5 && decayed === 0;
    },
    xpBonus: 200,
  },
];

/**
 * Check which achievements have been newly unlocked
 * Returns array of newly unlocked achievement IDs
 */
export function checkAchievements(
  state: GamificationState,
  skills: SkillNode[]
): string[] {
  const newAchievements: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked
    if (state.achievements.includes(achievement.id)) {
      continue;
    }

    // Check if condition is met
    if (achievement.condition(state, skills)) {
      newAchievements.push(achievement.id);
    }
  }

  return newAchievements;
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Calculate total XP bonus from achievements
 */
export function getAchievementXpBonus(achievementIds: string[]): number {
  return achievementIds.reduce((total, id) => {
    const achievement = getAchievement(id);
    return total + (achievement?.xpBonus || 0);
  }, 0);
}

// ============================================================================
// Stats & Analytics
// ============================================================================

export interface SkillStats {
  totalSkills: number;
  mastered: number;
  inProgress: number;
  available: number;
  locked: number;
  decayed: number;
  masteryPercent: number;
  categoryBreakdown: Record<SkillCategory, { mastered: number; total: number }>;
  tierBreakdown: Record<SkillTier, { mastered: number; total: number }>;
}

/**
 * Calculate comprehensive skill statistics
 */
export function calculateSkillStats(skills: SkillNode[]): SkillStats {
  const stats: SkillStats = {
    totalSkills: skills.length,
    mastered: 0,
    inProgress: 0,
    available: 0,
    locked: 0,
    decayed: 0,
    masteryPercent: 0,
    categoryBreakdown: {
      frontend: { mastered: 0, total: 0 },
      backend: { mastered: 0, total: 0 },
      devops: { mastered: 0, total: 0 },
      cs: { mastered: 0, total: 0 },
      ml: { mastered: 0, total: 0 },
      data: { mastered: 0, total: 0 },
    },
    tierBreakdown: {
      foundation: { mastered: 0, total: 0 },
      'frontend-2': { mastered: 0, total: 0 },
      'backend-data': { mastered: 0, total: 0 },
      'ai-engineer': { mastered: 0, total: 0 },
      systems: { mastered: 0, total: 0 },
    },
  };

  for (const skill of skills) {
    const { status, category, tier } = skill.data;

    // Count by status
    switch (status) {
      case 'mastered':
        stats.mastered++;
        break;
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'available':
        stats.available++;
        break;
      case 'locked':
        stats.locked++;
        break;
      case 'decayed':
        stats.decayed++;
        break;
    }

    // Category breakdown
    stats.categoryBreakdown[category].total++;
    if (status === 'mastered') {
      stats.categoryBreakdown[category].mastered++;
    }

    // Tier breakdown
    stats.tierBreakdown[tier].total++;
    if (status === 'mastered') {
      stats.tierBreakdown[tier].mastered++;
    }
  }

  stats.masteryPercent =
    stats.totalSkills > 0
      ? Math.round((stats.mastered / stats.totalSkills) * 100)
      : 0;

  return stats;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format XP with thousands separator
 */
export function formatXp(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(stats: SkillStats, streak: number): string {
  if (stats.mastered === 0) {
    return 'Start your journey by mastering your first skill!';
  }
  if (streak >= 7) {
    return `Amazing ${streak}-day streak! Keep the momentum going!`;
  }
  if (stats.decayed > 0) {
    return `${stats.decayed} skill${stats.decayed > 1 ? 's need' : ' needs'} review. Practice makes perfect!`;
  }
  if (stats.masteryPercent >= 75) {
    return 'You\'re almost there! Just a few more skills to master.';
  }
  if (stats.available > 0) {
    return `${stats.available} new skill${stats.available > 1 ? 's' : ''} available to learn!`;
  }
  return 'Great progress! Keep learning and growing.';
}
