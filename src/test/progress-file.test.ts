import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/lib/store';
import { buildProgressFile, applyProgressFile } from '@/lib/progress-file';

function masterFirstAvailable(): string {
    const first = useGameStore.getState().nodes.find((n) => n.data.status === 'available');
    if (!first) throw new Error('expected an available skill');
    useGameStore.getState().completeSkill(first.id);
    return first.id;
}

describe('progress file export and import', () => {
    beforeEach(() => {
        useGameStore.getState().resetProgress();
    });

    it('round trips mastered skills and XP after progress is wiped', () => {
        const id = masterFirstAvailable();
        const xp = useGameStore.getState().userXP;
        expect(xp).toBeGreaterThan(0);
        const file = buildProgressFile();

        useGameStore.getState().resetProgress();
        expect(useGameStore.getState().userXP).toBe(0);

        applyProgressFile(file);

        const state = useGameStore.getState();
        expect(state.userXP).toBe(xp);
        expect(state.nodes.find((n) => n.id === id)?.data.status).toBe('mastered');
    });

    it('export is plain JSON that names the app and holds no functions', () => {
        masterFirstAvailable();
        const parsed = JSON.parse(buildProgressFile());
        expect(parsed.app).toBe('skill-mapper');
        expect(typeof parsed.version).toBe('number');
        expect(Array.isArray(parsed.state.nodes)).toBe(true);
    });

    it('rejects text that is not a progress file and leaves progress alone', () => {
        const id = masterFirstAvailable();
        const xp = useGameStore.getState().userXP;
        expect(() => applyProgressFile('not json')).toThrow(/not a valid/i);
        expect(() => applyProgressFile(JSON.stringify({ hello: 'world' }))).toThrow(/not a skill mapper/i);
        expect(() =>
            applyProgressFile(JSON.stringify({ app: 'skill-mapper', version: 6, state: { nodes: 'x' } })),
        ).toThrow(/not a skill mapper/i);
        expect(useGameStore.getState().userXP).toBe(xp);
        expect(useGameStore.getState().nodes.find((n) => n.id === id)?.data.status).toBe('mastered');
    });

    it('rejects a file saved by a newer version of the app', () => {
        const parsed = JSON.parse(buildProgressFile());
        parsed.version += 1;
        expect(() => applyProgressFile(JSON.stringify(parsed))).toThrow(/newer/i);
    });

    it('drops skills that no longer exist in the catalog', () => {
        const parsed = JSON.parse(buildProgressFile());
        parsed.state.nodes.push({ id: 'removed-skill', position: { x: 0, y: 0 }, data: { status: 'mastered' } });
        const catalogSize = useGameStore.getState().nodes.length;
        applyProgressFile(JSON.stringify(parsed));
        expect(useGameStore.getState().nodes).toHaveLength(catalogSize);
    });
});
