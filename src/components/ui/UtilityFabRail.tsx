'use client';

import { BarChart3, Activity, Keyboard } from 'lucide-react';

type UtilityFabRailProps = {
  onOpenStats: () => void;
  onOpenAnalytics: () => void;
  onOpenShortcuts: () => void;
};

/**
 * Right-side utility FABs with mobile-safe spacing.
 * Keeps controls reachable without overlapping the skill tree minimap.
 */
export function UtilityFabRail({
  onOpenStats,
  onOpenAnalytics,
  onOpenShortcuts,
}: UtilityFabRailProps) {
  return (
    <div
      className="fixed bottom-4 right-3 z-30 flex flex-col gap-2 sm:bottom-6 sm:right-6 md:bottom-8 md:right-6"
      role="toolbar"
      aria-label="Utility tools"
    >
      <button
        type="button"
        onClick={onOpenAnalytics}
        className="icon-btn grid h-10 w-10 place-items-center sm:h-10 sm:w-10"
        title="Analytics Dashboard"
        aria-label="Open analytics dashboard"
      >
        <Activity size={18} />
      </button>
      <button
        type="button"
        onClick={onOpenStats}
        className="icon-btn grid h-10 w-10 place-items-center"
        title="View Stats"
        aria-label="View statistics"
      >
        <BarChart3 size={18} />
      </button>
      <button
        type="button"
        onClick={onOpenShortcuts}
        className="icon-btn grid h-10 w-10 place-items-center"
        title="Keyboard Shortcuts (Shift + ?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={18} />
      </button>
    </div>
  );
}
