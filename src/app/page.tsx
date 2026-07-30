import SkillTreeCanvas from "@/components/skill-tree/SkillTree";
import HUD from "@/components/ui/HUD";
import SkillDetailsPanel from "@/components/skill-tree/SkillDetailsPanel";
import OnboardingModal from "@/components/OnboardingModal";
import BadgeNotification from "@/components/ui/BadgeNotification";
import AchievementNotification from "@/components/ui/AchievementNotification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import LiveRegions from "@/components/LiveRegions";
import MilestoneCelebrations from "@/components/MilestoneCelebrations";
import TreeOverlays from "@/components/TreeOverlays";
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
          <TreeOverlays />
          <OnboardingModal />
          <BadgeNotification />
          <AchievementNotification />
          <HUD />
          <MusicManager />
          <SkillDetailsPanel />
        </div>
      </main>
    </ErrorBoundary>
  );
}
