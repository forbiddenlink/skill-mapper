import { StateCreator } from 'zustand';

export type FeaturesHubView = 'challenges' | 'streaks' | 'paths' | 'bosses' | null;

export interface UISlice {
    soundEnabled: boolean;
    musicEnabled: boolean;
    sharePromptOpen: boolean;
    sharePromptReason: string | null;
    featuresHubView: FeaturesHubView;

    toggleSound: () => void;
    toggleMusic: () => void;
    openSharePrompt: (reason?: string) => void;
    closeSharePrompt: () => void;
    openFeaturesHub: (view: Exclude<FeaturesHubView, null>) => void;
    closeFeaturesHub: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
    soundEnabled: true,
    musicEnabled: false,
    sharePromptOpen: false,
    sharePromptReason: null,
    featuresHubView: null,

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
    openSharePrompt: (reason) =>
        set({ sharePromptOpen: true, sharePromptReason: reason ?? null }),
    closeSharePrompt: () => set({ sharePromptOpen: false, sharePromptReason: null }),
    openFeaturesHub: (view) => set({ featuresHubView: view }),
    closeFeaturesHub: () => set({ featuresHubView: null }),
});
