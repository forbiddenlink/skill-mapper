import { afterEach, describe, it, expect, vi } from 'vitest';
import {
    daysBetween,
    shieldsEarnedForStreak,
    toDateKey,
    updateStreakWithShield,
} from '@/lib/gamification';

afterEach(() => vi.useRealTimers());

function at(localIso: string) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(localIso));
}

describe('day keys', () => {
    it('uses the local calendar day, not the UTC one', () => {
        const lateEvening = new Date(2026, 10, 9, 23, 30);
        expect(toDateKey(lateEvening)).toBe('2026-11-09');
    });
    it('counts whole days between keys', () => {
        expect(daysBetween('2026-11-08', '2026-11-09')).toBe(1);
        expect(daysBetween('2026-02-28', '2026-03-02')).toBe(2);
    });
});

describe('streak shields', () => {
    it('are earned only at milestones', () => {
        expect([6, 7, 8, 13, 14, 15, 29, 30, 31, 60].map(shieldsEarnedForStreak)).toEqual([0, 1, 0, 0, 1, 0, 0, 1, 0, 1]);
    });

    it('cover a single missed day', () => {
        at('2026-11-09T12:00:00');
        const r = updateStreakWithShield(10, 10, '2026-11-07', 1);
        expect(r).toMatchObject({ streak: 10, streakShields: 0, shieldUsed: true });
    });

    it('do not cover a longer gap', () => {
        at('2026-11-09T12:00:00');
        const r = updateStreakWithShield(10, 10, '2026-11-01', 3);
        expect(r).toMatchObject({ streak: 1, streakShields: 3, shieldUsed: false });
    });

    it('are not needed for consecutive days', () => {
        at('2026-11-09T12:00:00');
        const r = updateStreakWithShield(4, 4, '2026-11-08', 1);
        expect(r).toMatchObject({ streak: 5, streakShields: 1, shieldUsed: false });
    });
});

describe('local-day consumers', () => {
    it('Speed Learner counts skills mastered late in the local evening', async () => {
        const { getAchievement } = await import('@/lib/gamification');
        at('2026-11-09T23:30:00');
        const late = new Date(2026, 10, 9, 23, 0).getTime();
        const skills = [1, 2, 3].map((i) => ({ id: `s${i}`, data: { status: 'mastered', lastPracticedAt: late } }));
        const achievement = getAchievement('speed_learner');
        expect(achievement?.condition({} as never, skills as never)).toBe(true);
    });
});
