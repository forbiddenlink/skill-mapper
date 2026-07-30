import { StateCreator } from 'zustand';

export interface UISlice {
    soundEnabled: boolean;
    musicEnabled: boolean;
    sharePromptOpen: boolean;
    sharePromptReason: string | null;

    toggleSound: () => void;
    toggleMusic: () => void;
    openSharePrompt: (reason?: string) => void;
    closeSharePrompt: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
    soundEnabled: true,
    musicEnabled: false,
    sharePromptOpen: false,
    sharePromptReason: null,

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
    openSharePrompt: (reason) =>
        set({ sharePromptOpen: true, sharePromptReason: reason ?? null }),
    closeSharePrompt: () => set({ sharePromptOpen: false, sharePromptReason: null }),
});
