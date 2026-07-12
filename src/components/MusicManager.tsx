'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';

/**
 * Plays a looping background track that matches the category of the currently
 * selected skill. Renders nothing. Music is off until the user opts in via the
 * HUD toggle (browser autoplay policy) — the first play() runs inside that
 * user-gesture-driven state update.
 */
export default function MusicManager() {
    const musicEnabled = useGameStore((s) => s.musicEnabled);
    const category = useGameStore((s) => {
        const node = s.nodes.find((n) => n.id === s.selectedSkillId);
        return node?.data.category ?? null;
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!audioRef.current) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0.25;
            audioRef.current = audio;
        }
        const audio = audioRef.current;

        if (!musicEnabled) {
            audio.pause();
            return;
        }

        // Default to an ambient track when no skill is selected.
        const track = category ?? 'frontend';
        const src = `/music/${track}.mp3`;
        if (!audio.src.endsWith(src)) {
            audio.src = src;
        }
        audio.play().catch(() => {
            // Autoplay blocked until a user gesture — ignored.
        });
    }, [musicEnabled, category]);

    // Stop playback when unmounted.
    useEffect(() => () => audioRef.current?.pause(), []);

    return null;
}
