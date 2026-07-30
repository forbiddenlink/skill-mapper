import SkillTreeCanvas from "@/components/skill-tree/SkillTree";
import HUD from "@/components/ui/HUD";
import SkillDetailsPanel from "@/components/skill-tree/SkillDetailsPanel";
import OnboardingModal from "@/components/OnboardingModal";
import BadgeNotification from "@/components/ui/BadgeNotification";
import AchievementNotification from "@/components/ui/AchievementNotification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import StatsPanel from "@/components/StatsPanel";
import LiveRegions from "@/components/LiveRegions";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import MilestoneCelebrations from "@/components/MilestoneCelebrations";
import RecommendedSkills from "@/components/RecommendedSkills";
import { FeaturesHub } from "@/components/FeaturesHub";
import EmptyStateCoach from "@/components/EmptyStateCoach";
import UndoRedoShortcuts from "@/components/UndoRedoShortcuts";
import MusicManager from "@/components/MusicManager";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="app-shell relative h-screen w-full overflow-hidden bg-canvas">
        <h1 className="sr-only">Skill Mapper - Interactive Gamified Learning Platform</h1>
        <div className="atlas-atmosphere pointer-events-none absolute inset-0 z-0" />
        <div className="atlas-grid pointer-events-none absolute inset-0 z-0" />

        <div className="relative z-10 h-full w-full">
          <SkillTreeCanvas />
          <LiveRegions />
          <MilestoneCelebrations />
          <ToastContainer />
          <UndoRedoShortcuts />
          <KeyboardShortcutsModal />
          <StatsPanel />
          <AnalyticsDashboard />
          <RecommendedSkills />
          <FeaturesHub />
          <OnboardingModal />
          <BadgeNotification />
          <AchievementNotification />
          <HUD />
          <MusicManager />
          <SkillDetailsPanel />
          <div className="pointer-events-none fixed bottom-28 left-6 z-20 hidden w-72 md:block">
            <div className="pointer-events-auto">
              <EmptyStateCoach compact />
            </div>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
