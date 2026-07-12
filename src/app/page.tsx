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
import MusicManager from "@/components/MusicManager";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="app-shell relative h-screen w-full overflow-hidden bg-deep-void">
        <h1 className="sr-only">Skill Mapper - Interactive Gamified Learning Platform</h1>
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_12%_8%,rgba(46,211,255,0.12),transparent_35%),radial-gradient(circle_at_86%_84%,rgba(200,92,255,0.12),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

        <div className="relative z-10 h-full w-full">
          <SkillTreeCanvas />
          <LiveRegions />
          <MilestoneCelebrations />
          <ToastContainer />
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
        </div>
      </main>
    </ErrorBoundary>
  );
}
