/**
 * skill-mapper - XState skill progression state machine
 * Manages skill unlock, progression, and achievement state
 */
import { createMachine, assign } from 'xstate';

export type SkillStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'mastered';

export interface Skill {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  xpRequired: number;
  xpEarned: number;
  status: SkillStatus;
  level: 1 | 2 | 3;
}

export interface SkillTreeContext {
  skills: Record<string, Skill>;
  totalXP: number;
  unlockedCount: number;
  masteredCount: number;
  recentAchievement: string | null;
}

export type SkillTreeEvent =
  | { type: 'START_SKILL'; skillId: string }
  | { type: 'COMPLETE_LESSON'; skillId: string; xpGained: number }
  | { type: 'MASTER_SKILL'; skillId: string }
  | { type: 'RESET_SKILL'; skillId: string }
  | { type: 'CLEAR_ACHIEVEMENT' };

function getUnlockedSkills(skills: Record<string, Skill>, completedIds: string[]): string[] {
  return Object.values(skills)
    .filter(
      (skill) =>
        skill.status === 'locked' &&
        skill.prerequisites.every((prereq) => completedIds.includes(prereq))
    )
    .map((s) => s.id);
}

export const skillTreeMachine = createMachine<SkillTreeContext, SkillTreeEvent>({
  id: 'skillTree',
  initial: 'idle',
  context: {
    skills: {},
    totalXP: 0,
    unlockedCount: 0,
    masteredCount: 0,
    recentAchievement: null,
  },
  states: {
    idle: {
      on: {
        START_SKILL: {
          actions: assign({
            skills: ({ context, event }) => ({
              ...context.skills,
              [event.skillId]: {
                ...context.skills[event.skillId],
                status: 'in-progress' as SkillStatus,
              },
            }),
          }),
        },
        COMPLETE_LESSON: {
          actions: assign({
            totalXP: ({ context, event }) => context.totalXP + event.xpGained,
            skills: ({ context, event }) => {
              const skill = context.skills[event.skillId];
              if (!skill) return context.skills;
              const newXp = skill.xpEarned + event.xpGained;
              const completed = newXp >= skill.xpRequired;
              return {
                ...context.skills,
                [event.skillId]: {
                  ...skill,
                  xpEarned: newXp,
                  status: completed ? ('completed' as SkillStatus) : 'in-progress',
                },
              };
            },
            unlockedCount: ({ context, event }) => {
              const skill = context.skills[event.skillId];
              if (!skill) return context.unlockedCount;
              const newXp = skill.xpEarned + event.xpGained;
              return newXp >= skill.xpRequired ? context.unlockedCount + 1 : context.unlockedCount;
            },
            recentAchievement: ({ context, event }) => {
              const skill = context.skills[event.skillId];
              if (!skill) return null;
              const newXp = skill.xpEarned + event.xpGained;
              return newXp >= skill.xpRequired
                ? `🎉 Completed: ${skill.name}`
                : context.recentAchievement;
            },
          }),
        },
        MASTER_SKILL: {
          actions: assign({
            skills: ({ context, event }) => ({
              ...context.skills,
              [event.skillId]: {
                ...context.skills[event.skillId],
                status: 'mastered' as SkillStatus,
              },
            }),
            masteredCount: ({ context }) => context.masteredCount + 1,
            recentAchievement: ({ context, event }) =>
              `⭐ Mastered: ${context.skills[event.skillId]?.name}`,
          }),
        },
        CLEAR_ACHIEVEMENT: {
          actions: assign({ recentAchievement: null }),
        },
      },
    },
  },
});
