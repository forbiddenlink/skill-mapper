'use client';

import { useState } from 'react';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import StatsPanel from '@/components/StatsPanel';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import RecommendedSkills from '@/components/RecommendedSkills';
import { FeaturesHub } from '@/components/FeaturesHub';
import EmptyStateCoach from '@/components/EmptyStateCoach';
import { UtilityFabRail } from '@/components/ui/UtilityFabRail';

/**
 * Fixed overlay chrome for the skill tree: utility FABs, mode hubs, coach.
 * Keeps mobile FAB density in one stacked rail instead of scattered anchors.
 */
export default function TreeOverlays() {
  const [statsOpen, setStatsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
      <UtilityFabRail
        onOpenStats={() => setStatsOpen(true)}
        onOpenAnalytics={() => setAnalyticsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
      <StatsPanel
        isOpen={statsOpen}
        onOpenChange={setStatsOpen}
        showTrigger={false}
      />
      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
        showTrigger={false}
      />
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        showTrigger={false}
      />
      <RecommendedSkills />
      <FeaturesHub />
      <div className="pointer-events-none fixed bottom-24 left-3 z-20 hidden w-72 sm:bottom-28 sm:left-6 md:block">
        <div className="pointer-events-auto">
          <EmptyStateCoach compact />
        </div>
      </div>
    </>
  );
}
