import { describe, expect, it } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createUndoRedoSlice, type UndoRedoSlice } from '../lib/stores/undo-redo-store';
import type { SkillNode } from '../lib/skill-data';

type State = UndoRedoSlice & { nodes: SkillNode[]; userXP: number; userLevel: number };
const node = (status: string) => [{ id: 'fixture', data: { status } }] as SkillNode[];
function setup() {
    const store = createStore<State>((...args) => ({
        nodes: node('available'), userXP: 0, userLevel: 1, ...createUndoRedoSlice(...args),
    }));
    const change = (xp: number) => {
        store.getState().pushHistory(store.getState(), `change:${xp}`);
        store.setState({ nodes: node(`state:${xp}`), userXP: xp, userLevel: xp + 1 });
    };
    return { store, change };
}
const snapshot = (s: State) => ({ nodes: s.nodes, userXP: s.userXP, userLevel: s.userLevel });

describe('undo/redo state history', () => {
    it('restores the changed state after undo then redo', () => {
        const { store, change } = setup();
        const before = structuredClone(snapshot(store.getState()));
        change(10);
        const after = structuredClone(snapshot(store.getState()));
        expect(store.getState().undo()).toBe(true);
        expect(snapshot(store.getState())).toEqual(before);
        expect(store.getState().redo()).toBe(true);
        expect(snapshot(store.getState())).toEqual(after);
    });
    it('traverses two changes in both directions and discards abandoned redo', () => {
        const { store, change } = setup();
        change(10); change(20);
        store.getState().undo(); store.getState().undo();
        expect(store.getState().userXP).toBe(0);
        expect(store.getState().undo()).toBe(false);
        store.getState().redo(); expect(store.getState().userXP).toBe(10);
        store.getState().redo(); expect(store.getState().userXP).toBe(20);
        expect(store.getState().redo()).toBe(false);
        store.getState().undo(); change(30);
        expect(store.getState().canRedo()).toBe(false);
        store.getState().undo(); expect(store.getState().userXP).toBe(10);
        store.getState().redo(); expect(store.getState().userXP).toBe(30);
    });
    it('bounds history and isolates saved nodes from live mutations', () => {
        const { store, change } = setup();
        store.setState({ maxHistory: 2 });
        change(10); change(20); change(30);
        expect(store.getState().history).toHaveLength(2);
        store.getState().undo();
        store.getState().nodes[0]!.data.status = 'mastered';
        store.getState().redo();
        expect(store.getState().nodes[0]!.data.status).toBe('state:30');
    });
});
