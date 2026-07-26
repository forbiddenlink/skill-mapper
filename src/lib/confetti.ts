/**
 * Confetti celebration for Skill Mapper.
 * Rewards skill unlocks, mastery milestones, and learning streaks.
 */
import confetti from 'canvas-confetti';

// Skill Mapper brand palette (Refined Premium) — keep in sync with globals.css tokens.
const BRAND = {
  violet: '#8b7cff',
  violetStrong: '#a99bff',
  plasma: '#c77dff',
  green: '#4ade80',
  energy: '#34dcff',
  amber: '#f2b544',
};

/** Skill unlock — medium burst in brand violets + tree-energy. */
export function skillUnlocked(): void {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.65 },
    colors: [BRAND.violet, BRAND.plasma, BRAND.energy],
  });
}

/** Mastery achieved — full celebration. */
export function masteryAchieved(): void {
  const end = Date.now() + 2000;
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 50,
      origin: { x: 0 },
      colors: [BRAND.violet, BRAND.violetStrong],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 50,
      origin: { x: 1 },
      colors: [BRAND.energy, BRAND.plasma],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Streak milestone — rising stars in warm gold. */
export function streakMilestone(streak: number): void {
  const count = Math.min(10 + streak * 5, 100);
  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.7 },
    shapes: ['star'],
    colors: [BRAND.amber, '#fbbf24', BRAND.violetStrong],
  });
}
