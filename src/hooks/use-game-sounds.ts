import { useCallback } from 'react';
import { useGameStore } from '@/lib/store';

// Simple synth tailored for UI sounds
const createOscillator = (
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    duration: number,
    vol: number = 0.1
) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const useGameSounds = () => {
    const soundEnabled = useGameStore((state) => state.soundEnabled);

    const playSound = useCallback((type: 'click' | 'hover' | 'unlock' | 'mastery' | 'error') => {
        if (!soundEnabled || typeof window === 'undefined') return;

        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const ctx = new AudioContextClass();

        switch (type) {
            case 'click':
                // Short high blip
                createOscillator(ctx, 'sine', 800, 0.1, 0.1);
                break;
            case 'hover':
                // Very short, quiet tick
                createOscillator(ctx, 'triangle', 400, 0.05, 0.03);
                break;
            case 'unlock':
                // Power up: sequence of notes
                createOscillator(ctx, 'square', 440, 0.1, 0.1);
                setTimeout(() => createOscillator(ctx, 'square', 554, 0.1, 0.1), 100);
                setTimeout(() => createOscillator(ctx, 'square', 659, 0.2, 0.1), 200);
                break;
            case 'mastery': {
                // Real generated victory jingle instead of the synth chord
                const jingle = new Audio('/music/victory.mp3');
                jingle.volume = 0.5;
                jingle.play().catch(() => {
                    // Ignore autoplay restrictions.
                });
                break;
            }
            case 'error':
                // Low buzz
                createOscillator(ctx, 'sawtooth', 150, 0.3, 0.2);
                break;
        }
        } catch (error) {
            console.warn('Audio playback failed:', error);
            // Silently fail - audio is non-critical
        }
    }, [soundEnabled]);

    return {
        playClick: () => playSound('click'),
        playHover: () => playSound('hover'),
        playUnlock: () => playSound('unlock'),
        playMastery: () => playSound('mastery'),
        playError: () => playSound('error'),
    };
};
