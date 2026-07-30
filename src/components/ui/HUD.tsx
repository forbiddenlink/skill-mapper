'use client';

import { useGameStore } from "@/lib/store";
import { Trophy, Flame, Volume2, VolumeX, Music, Save, Upload, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "./Toast";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";

export default function HUD() {
    const { xp, level, unlockedBadges, streak, soundEnabled, achievements } = useGameStore(
        useShallow((state) => ({
            xp: state.userXP,
            level: state.userLevel,
            unlockedBadges: state.unlockedBadges,
            streak: state.streak,
            soundEnabled: state.soundEnabled,
            achievements: state.achievements
        }))
    );
    const checkStreak = useGameStore((state) => state.checkStreak);
    const toggleSound = useGameStore((state) => state.toggleSound);
    const toggleMusic = useGameStore((state) => state.toggleMusic);
    const musicEnabled = useGameStore((state) => state.musicEnabled);
    const getLevelInfo = useGameStore((state) => state.getLevelInfo);
    const { toast } = useToast();

    const levelInfo = getLevelInfo();
    const progress = levelInfo.progressPercent;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    useEffect(() => {
        if (progressBarRef.current) {
            progressBarRef.current.style.setProperty('--xp-progress', `${progress}%`);
        }
    }, [progress]);

    const handleSave = () => {
        try {
            const state = useGameStore.getState();
            const saveData = {
                version: 2,
                timestamp: Date.now(),
                state: {
                    nodes: state.nodes,
                    edges: state.edges,
                    userXP: state.userXP,
                    userLevel: state.userLevel,
                    unlockedBadges: state.unlockedBadges,
                    streak: state.streak,
                    longestStreak: state.longestStreak,
                    lastVisit: state.lastVisit,
                    lastActivityDate: state.lastActivityDate,
                    achievements: state.achievements,
                }
            };

            const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `skill-mapper-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Progress exported successfully!');
        } catch (error) {
            console.error('Failed to export save:', error);
            toast.error('Failed to export progress');
        }
    };

    const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (json.version && json.state) {
                useGameStore.setState(json.state);
                toast.success('Progress loaded successfully!');
            } else {
                toast.error('Invalid save file format');
            }
        } catch (err) {
            console.error("Failed to load save file", err);
            toast.error('Failed to load save file');
        }

        e.target.value = '';
    };

    return (
        <aside className="pointer-events-none fixed left-4 top-4 z-30 flex flex-col gap-3 md:left-6 md:top-6" aria-label="Game statistics">
            <section className="panel-strong pointer-events-auto w-64 p-4 md:w-[17rem]" aria-label="Player information">
                <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-[8px] border border-signal/45" aria-hidden="true">
                        <Image
                            src="/avatars/operator.png"
                            alt="Operator Avatar"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-display text-sm font-semibold tracking-wide text-foreground">Operator</h2>
                        <div className="font-mono text-[11px] text-text-muted">
                            Lvl {level} · {levelInfo.title}
                        </div>
                    </div>

                    <div className="ml-auto flex shrink-0 gap-1">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="icon-btn grid h-8 w-8 place-items-center"
                            title="Export Save"
                            aria-label="Export progress to file"
                        >
                            <Save size={14} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="icon-btn grid h-8 w-8 place-items-center"
                            title="Import Save"
                            aria-label="Import progress from file"
                        >
                            <Upload size={14} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={toggleSound}
                            className="icon-btn grid h-8 w-8 place-items-center"
                            title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                            aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
                            aria-pressed={soundEnabled}
                        >
                            {soundEnabled ? (
                                <Volume2 size={14} aria-hidden="true" />
                            ) : (
                                <VolumeX size={14} aria-hidden="true" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={toggleMusic}
                            className="icon-btn grid h-8 w-8 place-items-center"
                            title={musicEnabled ? "Stop Music" : "Play Music"}
                            aria-label={musicEnabled ? "Stop background music" : "Play background music"}
                            aria-pressed={musicEnabled}
                        >
                            <Music
                                size={14}
                                aria-hidden="true"
                                className={musicEnabled ? "text-signal" : "opacity-50"}
                            />
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleLoad}
                    title="Import save file"
                    aria-label="Import save file"
                />

                <div className="xp-track">
                    <progress
                        value={progress}
                        max={100}
                        aria-label="Experience progress to next level"
                        className="xp-progress-bar"
                    />
                    <div
                        ref={progressBarRef}
                        className="xp-progress-fill"
                        aria-hidden="true"
                    />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>XP {xp.toLocaleString()}</span>
                    <span>Next {levelInfo.xpForNextLevel.toLocaleString()}</span>
                </div>
            </section>

            <section className="panel-base pointer-events-auto flex flex-wrap gap-x-4 gap-y-2 px-3 py-2.5 font-mono text-[11px] text-text-muted" aria-label="Achievements and streaks">
                <div className="flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-reward" aria-hidden="true" />
                    <span className="text-foreground">{unlockedBadges.length}</span>
                    <span>Badges</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Star className="h-3 w-3 text-signal" aria-hidden="true" />
                    <span className="text-foreground">{achievements.length}</span>
                    <span>Achievements</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Flame className="h-3 w-3 text-reward" aria-hidden="true" />
                    <span className="text-foreground">{streak}</span>
                    <span>Day streak</span>
                </div>
            </section>
        </aside>
    );
}
