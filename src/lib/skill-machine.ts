/**
 * skill-mapper - XState skill progression state machine
 * Manages skill unlock, progression, and achievement state
 */
import { setup } from 'xstate';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const skillTreeMachine = (setup as any)({
  types: {
    context: {} as SkillTreeContext,
    events: {} as SkillTreeEvent,
  },
}).createMachine({
  id: 'skillTree',
  initial: 'idle',
  context: {
    skills: {} as Record<string, Skill>,
    totalXP: 0,
    unlockedCount: 0,
    masteredCount: 0,
    recentAchievement: null as string | null,
  },
  states: {
    idle: {
      on: {
        START_SKILL: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actions: ({ context, event }: any) => {
            context.skills[event.skillId] = {
              ...context.skills[event.skillId],
              status: 'in-progress' as SkillStatus,
            };
          },
        },
        COMPLETE_LESSON: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actions: ({ context, event }: any) => {
            const skill = context.skills[event.skillId];
            if (!skill) return;
            const newXp = skill.xpEarned + event.xpGained;
            const completed = newXp >= skill.xpRequired;
            context.skills[event.skillId] = {
              ...skill,
              xpEarned: newXp,
              status: completed ? ('completed' as SkillStatus) : 'in-progress',
            };
            if (completed) {
              context.totalXP += event.xpGained;
              context.unlockedCount += 1;
              context.recentAchievement = `Completed: ${skill.name}`;
            } else {
              context.totalXP += event.xpGained;
            }
          },
        },
        MASTER_SKILL: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actions: ({ context, event }: any) => {
            context.skills[event.skillId] = {
              ...context.skills[event.skillId],
              status: 'mastered' as SkillStatus,
            };
            context.masteredCount += 1;
            context.recentAchievement = `Mastered: ${context.skills[event.skillId]?.name}`;
          },
        },
        CLEAR_ACHIEVEMENT: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actions: ({ context }: any) => {
            context.recentAchievement = null;
          },
        },
      },
    },
  },
});
