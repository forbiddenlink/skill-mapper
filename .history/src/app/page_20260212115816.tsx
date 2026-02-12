import SkillTreeCanvas from "@/components/skill-tree/SkillTree";
import HUD from "@/components/ui/HUD";
import SkillDetailsPanel from "@/components/skill-tree/SkillDetailsPanel";
import OnboardingModal from "@/components/OnboardingModal";
import BadgeNotification from "@/components/ui/BadgeNotification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import StatsPanel from "@/components/StatsPanel";
import LiveRegions from "@/components/LiveRegions";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import MilestoneCelebrations from "@/components/MilestoneCelebrations";
import RecommendedSkills from "@/components/RecommendedSkills";
import { FeaturesHub } from "@/components/FeaturesHub";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="w-full h-screen relative bg-deep-void overflow-hidden">
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
        <HUD />
        <SkillDetailsPanel />
        <SkillTreeCanvas />

        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-80" />
      </main>
    </ErrorBoundary>
  );
}
