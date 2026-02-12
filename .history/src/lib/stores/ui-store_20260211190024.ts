import { StateCreator } from 'zustand';

export interface UISlice {
    soundEnabled: boolean;
    
    // Actions
    toggleSound: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
    soundEnabled: true,
    
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
});
