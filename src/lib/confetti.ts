/**
 * Confetti celebration for Skill Mapper.
 * Rewards skill unlocks, mastery milestones, and learning streaks.
 */
import confetti from 'canvas-confetti';

/** Skill unlock — medium burst with skill-mapper brand colors. */
export function skillUnlocked(): void {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
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
      colors: ['#3b82f6', '#8b5cf6'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 50,
      origin: { x: 1 },
      colors: ['#10b981', '#f59e0b'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Streak milestone — rising stars. */
export function streakMilestone(streak: number): void {
  const count = Math.min(10 + streak * 5, 100);
  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.7 },
    shapes: ['star'],
    colors: ['#f59e0b', '#fbbf24', '#fde68a'],
  });
}
