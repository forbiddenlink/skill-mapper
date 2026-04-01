'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        autocapture: {
          dom_event_allowlist: ['click', 'submit'],
          element_allowlist: ['button', 'a'],
        },
      })
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <NuqsAdapter>{children}</NuqsAdapter>
  }

  return (
    <NuqsAdapter>
      <PHProvider client={posthog}>{children}</PHProvider>
    </NuqsAdapter>
  )
}

// Skill tree learning analytics events
export const trackSkillEvent = {
  skillUnlocked: (skillId: string, skillName: string, category: string) => {
    posthog.capture('skill_unlocked', {
      skill_id: skillId,
      skill_name: skillName,
      category,
    });
  },

  skillCompleted: (skillId: string, skillName: string, xpEarned: number) => {
    posthog.capture('skill_completed', {
      skill_id: skillId,
      skill_name: skillName,
      xp_earned: xpEarned,
    });
  },

  challengeAttempted: (skillId: string, success: boolean, timeSpent: number) => {
    posthog.capture('challenge_attempted', {
      skill_id: skillId,
      success,
      time_spent_seconds: timeSpent,
    });
  },

  pathStarted: (pathId: string, pathName: string) => {
    posthog.capture('learning_path_started', {
      path_id: pathId,
      path_name: pathName,
    });
  },

  pathCompleted: (pathId: string, pathName: string, totalXp: number) => {
    posthog.capture('learning_path_completed', {
      path_id: pathId,
      path_name: pathName,
      total_xp: totalXp,
    });
  },

  achievementEarned: (achievementId: string, achievementName: string) => {
    posthog.capture('achievement_earned', {
      achievement_id: achievementId,
      achievement_name: achievementName,
    });
  },

  levelUp: (newLevel: number, totalXp: number) => {
    posthog.capture('level_up', {
      new_level: newLevel,
      total_xp: totalXp,
    });
  },

  struggleDetected: (skillId: string, skillName: string, failCount: number) => {
    posthog.capture('struggle_detected', {
      skill_id: skillId,
      skill_name: skillName,
      fail_count: failCount,
    });
  },

  skillTreeViewed: (category: string) => {
    posthog.capture('skill_tree_viewed', {
      category,
    });
  },
};

export { posthog }
