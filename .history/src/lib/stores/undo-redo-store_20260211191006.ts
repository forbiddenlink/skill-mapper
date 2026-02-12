import { StateCreator } from 'zustand';
import { SkillsSlice } from './skills-store';

interface HistoryEntry {
    nodes: any[];
    timestamp: number;
    action: string;
}

export interface UndoRedoSlice {
    history: HistoryEntry[];
    historyIndex: number;
    maxHistory: number;
    
    // Actions
    pushHistory: (nodes: any[], action: string) => void;
    undo: () => boolean;
    redo: () => boolean;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clearHistory: () => void;
}

export const createUndoRedoSlice: StateCreator<
    UndoRedoSlice & SkillsSlice,
    [],
    [],
    UndoRedoSlice
> = (set, get) => ({
    history: [],
    historyIndex: -1,
    maxHistory: 50,

    pushHistory: (nodes, action) => {
        const { history, historyIndex, maxHistory } = get();
        
        // Remove any redo history when new action is performed
        const newHistory = history.slice(0, historyIndex + 1);
        
        // Add new entry
        newHistory.push({
            nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
            timestamp: Date.now(),
            action,
        });
        
        // Limit history size
        const trimmedHistory = newHistory.slice(-maxHistory);
        
        set({
            history: trimmedHistory,
            historyIndex: trimmedHistory.length - 1,
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        
        if (historyIndex <= 0) return false;
        
        const prevEntry = history[historyIndex - 1];
        set({
            nodes: prevEntry.nodes,
            historyIndex: historyIndex - 1,
        });
        
        return true;
    },

    redo: () => {
        const { history, historyIndex } = get();
        
        if (historyIndex >= history.length - 1) return false;
        
        const nextEntry = history[historyIndex + 1];
        set({
            nodes: nextEntry.nodes,
            historyIndex: historyIndex + 1,
        });
        
        return true;
    },

    canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
    },

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
