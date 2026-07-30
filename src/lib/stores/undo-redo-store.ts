import { StateCreator } from 'zustand';
import type { SkillNode } from '../skill-data';

interface HistoryEntry {
    nodes: SkillNode[];
    userXP: number;
    userLevel: number;
    timestamp: number;
    action: string;
}

export interface UndoRedoSlice {
    history: HistoryEntry[];
    historyIndex: number;
    maxHistory: number;

    pushHistory: (snapshot: { nodes: SkillNode[]; userXP: number; userLevel: number }, action: string) => void;
    undo: () => boolean;
    redo: () => boolean;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clearHistory: () => void;
}

type UndoRedoHost = UndoRedoSlice & {
    nodes: SkillNode[];
    userXP: number;
    userLevel: number;
};

export const createUndoRedoSlice: StateCreator<
    UndoRedoHost,
    [],
    [],
    UndoRedoSlice
> = (set, get) => ({
    history: [],
    historyIndex: -1,
    maxHistory: 50,

    pushHistory: (snapshot, action) => {
        const { history, historyIndex, maxHistory } = get();
        const newHistory = history.slice(0, historyIndex + 1);

        newHistory.push({
            nodes: structuredClone(snapshot.nodes),
            userXP: snapshot.userXP,
            userLevel: snapshot.userLevel,
            timestamp: Date.now(),
            action,
        });

        const trimmedHistory = newHistory.slice(-maxHistory);

        set({
            history: trimmedHistory,
            historyIndex: trimmedHistory.length - 1,
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < 0) return false;

        const entry = history[historyIndex];
        if (!entry) return false;

        set({
            nodes: structuredClone(entry.nodes),
            userXP: entry.userXP,
            userLevel: entry.userLevel,
            historyIndex: historyIndex - 1,
        });

        return true;
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return false;

        const nextEntry = history[historyIndex + 1];
        if (!nextEntry) return false;

        set({
            nodes: structuredClone(nextEntry.nodes),
            userXP: nextEntry.userXP,
            userLevel: nextEntry.userLevel,
            historyIndex: historyIndex + 1,
        });

        return true;
    },

    canUndo: () => get().historyIndex >= 0,

    canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
    },

    clearHistory: () => {
        set({
            history: [],
            historyIndex: -1,
        });
    },
});
