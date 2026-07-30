import { StateCreator } from 'zustand';

export interface UISlice {
    soundEnabled: boolean;
    musicEnabled: boolean;

    toggleSound: () => void;
    toggleMusic: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
    soundEnabled: true,
    musicEnabled: false,

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
});
