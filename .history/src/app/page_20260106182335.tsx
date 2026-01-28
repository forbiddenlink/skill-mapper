import SkillTreeCanvas from "@/components/skill-tree/SkillTree";
import HUD from "@/components/ui/HUD";
import SkillDetailsPanel from "@/components/skill-tree/SkillDetailsPanel";
import OnboardingModal from "@/components/OnboardingModal";
import BadgeNotification from "@/components/ui/BadgeNotification";

export default function Home() {
  return (
    <main className="w-full h-screen relative bg-deep-void overflow-hidden">
      <OnboardingModal />
      <BadgeNotification />
      <HUD />
      <SkillDetailsPanel />
      <SkillTreeCanvas />

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-80" />
    </main>
  );
}
