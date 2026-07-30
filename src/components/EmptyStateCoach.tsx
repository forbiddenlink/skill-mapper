'use client';

import { motion } from 'framer-motion';
import { Compass, Flame, Map, Target } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { getMotivationalMessage, calculateSkillStats } from '@/lib/gamification';

/**
 * Empty / early-progress coaching panel for the Features hub and tree HUD.
 */
export default function EmptyStateCoach({ compact = false }: { compact?: boolean }) {
  const { nodes, streak, selectSkill } = useGameStore(
    useShallow((s) => ({
      nodes: s.nodes,
      streak: s.streak,
      selectSkill: s.selectSkill,
    }))
  );

  const stats = calculateSkillStats(nodes);
  const nextAvailable = nodes.find((n) => n.data.status === 'available');
  const message = getMotivationalMessage(stats, streak);

  if (stats.mastered > 3 && !compact) return null;

  const tips = [
    {
      icon: Target,
      title: 'Pick an available node',
      body: nextAvailable
        ? `Start with “${nextAvailable.data.title}” — prerequisites are clear.`
        : 'Unlock a foundation skill to open your first path.',
      action: nextAvailable
        ? () => selectSkill(nextAvailable.id)
        : undefined,
    },
    {
      icon: Flame,
      title: 'Protect your streak',
      body: streak > 0
        ? `You’re on a ${streak}-day streak. Earn shields at 7 / 14 / 30 days.`
        : 'Complete one skill today to light the streak.',
    },
    {
      icon: Map,
      title: 'Follow a learning path',
      body: 'Open Learning Paths from the left rail for a role-shaped roadmap.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={compact ? 'panel-base p-3' : 'panel-strong p-4 md:p-5'}
      aria-label="Learning coach"
    >
      <div className="mb-3 flex items-center gap-2">
        <Compass className="h-5 w-5 text-signal" aria-hidden="true" />
        <h3 className="font-display text-base font-semibold text-foreground">
          {stats.mastered === 0 ? 'Your atlas is ready' : 'Keep mapping'}
        </h3>
      </div>
      <p className="mb-4 text-sm text-text-muted">{message}</p>

      <ul className="space-y-2">
        {tips.map((tip) => (
          <li key={tip.title}>
            {tip.action ? (
              <button
                type="button"
                onClick={tip.action}
                className="flex w-full items-start gap-3 rounded-[10px] border border-white/10 bg-surface-1 p-3 text-left transition-colors hover:border-signal/40"
              >
                <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{tip.title}</span>
                  <span className="block text-xs text-text-muted">{tip.body}</span>
                </span>
              </button>
            ) : (
              <div className="flex items-start gap-3 rounded-[10px] border border-white/10 bg-surface-1 p-3">
                <tip.icon className="mt-0.5 h-4 w-4 shrink-0 text-progress" aria-hidden="true" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{tip.title}</div>
                  <div className="text-xs text-text-muted">{tip.body}</div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
