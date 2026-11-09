import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/lib/store';
import { getInitialSkills } from '@/lib/skill-data';
import { mergeSavedProgress, applyPositions } from '@/lib/stores/node-merge';
import { crossedMilestone } from '@/components/MilestoneCelebrations';

function must<T>(value: T | undefined): T {
    if (value === undefined) throw new Error('expected a value');
    return value;
}

describe('progress survives layout and reload', () => {
    beforeEach(() => {
        useGameStore.getState().resetProgress();
    });

    it('applyElkLayout keeps mastered status (regression: layout reset all progress)', async () => {
        const first = useGameStore.getState().nodes.find((n) => n.data.status === 'available');
        expect(first).toBeDefined();
        useGameStore.getState().completeSkill(first!.id);
        expect(useGameStore.getState().nodes.find((n) => n.id === first!.id)?.data.status).toBe('mastered');

        await useGameStore.getState().applyElkLayout();

        expect(useGameStore.getState().nodes.find((n) => n.id === first!.id)?.data.status).toBe('mastered');
    });

    it('applyPositions moves nodes without touching data', () => {
        const [head, ...tail] = getInitialSkills();
        const mastered = must(head);
        const nodes = [{ ...mastered, data: { ...mastered.data, status: 'mastered' as const } }, ...tail];
        const layouted = getInitialSkills().map((n) => ({ ...n, position: { x: 7, y: 9 } }));
        const result = must(applyPositions(nodes, layouted)[0]);
        expect(result.position).toEqual({ x: 7, y: 9 });
        expect(result.data.status).toBe('mastered');
    });

    it('mergeSavedProgress takes progress from the save and content from the catalog', () => {
        const catalog = getInitialSkills();
        const target = must(catalog[0]);
        const saved = [
            {
                id: target.id,
                position: { x: 1, y: 2 },
                data: { ...target.data, title: 'Stale title', status: 'mastered', lastPracticedAt: 123 },
            },
            { id: 'skill-removed-from-catalog', position: { x: 0, y: 0 }, data: { status: 'mastered' } },
        ];

        const merged = mergeSavedProgress(saved, catalog);

        expect(merged).toHaveLength(catalog.length);
        const restored = merged.find((n) => n.id === target.id)!;
        expect(restored.data.status).toBe('mastered');
        expect(restored.data.lastPracticedAt).toBe(123);
        expect(restored.position).toEqual({ x: 1, y: 2 });
        expect(restored.data.title).toBe(target.data.title);
        expect(merged.some((n) => n.id === 'skill-removed-from-catalog')).toBe(false);
    });

    it('mergeSavedProgress ignores malformed saves', () => {
        const catalog = getInitialSkills();
        expect(mergeSavedProgress('x', catalog)).toBe(catalog);
        const original = must(catalog[0]);
        const merged = must(mergeSavedProgress([{ id: original.id, data: { status: 'bogus' }, position: 'nope' }], catalog)[0]);
        expect(merged.data.status).toBe(original.data.status);
        expect(merged.position).toEqual(original.position);
    });

    it('unlockBatch does not demote in-progress skills', () => {
        const available = useGameStore.getState().nodes.filter((n) => n.data.status === 'available');
        expect(available.length).toBeGreaterThan(1);
        const started = must(available[0]);
        const other = must(available[1]);
        useGameStore.getState().unlockSkill(started.id);
        expect(useGameStore.getState().nodes.find((n) => n.id === started.id)?.data.status).toBe('in-progress');

        useGameStore.getState().unlockBatch([other.id]);

        expect(useGameStore.getState().nodes.find((n) => n.id === started.id)?.data.status).toBe('in-progress');
    });

    it('closing onboarding is remembered', () => {
        expect(useGameStore.getState().hasOnboarded).toBe(false);
        useGameStore.getState().completeOnboarding();
        expect(useGameStore.getState().hasOnboarded).toBe(true);
    });
});

describe('crossedMilestone', () => {
    const everyFifth = (l: number) => l > 1 && l % 5 === 0;
    it('does not fire on the first (hydrated) value', () => {
        expect(crossedMilestone(null, 10, everyFifth)).toBe(false);
    });
    it('fires on a real increase into a milestone', () => {
        expect(crossedMilestone(9, 10, everyFifth)).toBe(true);
    });
    it('does not fire on a decrease such as undo', () => {
        expect(crossedMilestone(11, 10, everyFifth)).toBe(false);
    });
});

describe('boss badges', () => {
    beforeEach(() => {
        useGameStore.getState().resetProgress();
    });

    it('every boss badge id has a catalog entry', async () => {
        const { BADGES } = await import('@/lib/badges');
        const ids = new Set(BADGES.map((b) => b.id));
        for (const id of ['foundation-boss', 'frontend-boss', 'backend-boss', 'ai-boss', 'master-boss']) {
            expect(ids.has(id)).toBe(true);
        }
    });

    it('mastery checks never award a boss badge', async () => {
        const { checkForNewBadges } = await import('@/lib/stores/badge-helpers');
        const earned = checkForNewBadges(useGameStore.getState().nodes, []);
        expect(earned.some((id) => id.endsWith('-boss'))).toBe(false);
    });

    it('a repeat clear grants no XP', () => {
        const input = { bossId: 'boss-x', score: 5, questionCount: 5, xpReward: 500, badgeId: 'foundation-boss' };
        expect(useGameStore.getState().recordBossResult(input)).toBe(true);
        const afterFirst = useGameStore.getState().userXP;
        expect(useGameStore.getState().recordBossResult(input)).toBe(true);
        expect(useGameStore.getState().userXP).toBe(afterFirst);
    });
});
