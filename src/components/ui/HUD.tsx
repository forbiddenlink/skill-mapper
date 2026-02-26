'use client';

import { useGameStore } from "@/lib/store";
import { Trophy, Flame, Volume2, VolumeX, Save, Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "./Toast";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";

export default function HUD() {
    const { xp, level, unlockedBadges, streak, soundEnabled } = useGameStore(
        useShallow((state) => ({
            xp: state.userXP,
            level: state.userLevel,
            unlockedBadges: state.unlockedBadges,
            streak: state.streak,
            soundEnabled: state.soundEnabled
        }))
    );
    const checkStreak = useGameStore((state) => state.checkStreak);
    const toggleSound = useGameStore((state) => state.toggleSound);
    const { toast } = useToast();

    // Calculate Progress to next level (assuming 1000 XP per level)
    const progress = (xp % 1000) / 10; // 0-100%

    // File Input Ref for Load
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
            // Export current state to JSON
            const state = useGameStore.getState();
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                state: {
                    nodes: state.nodes,
                    edges: state.edges,
                    userXP: state.userXP,
                    userLevel: state.userLevel,
                    unlockedBadges: state.unlockedBadges,
                    streak: state.streak,
                    lastVisit: state.lastVisit
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
        
        // Reset file input
        e.target.value = '';
    };

    return (
        <aside className="pointer-events-none fixed left-4 top-4 z-30 flex flex-col gap-3 md:left-6 md:top-6" aria-label="Game statistics">
            {/* User Card */}
            <section className="panel-strong w-64 p-4 md:w-[17rem]" aria-label="Player information">
                <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border border-neon-cyan/60" aria-hidden="true">
                        <Image
                            src="/avatars/operator.png"
                            alt="Operator Avatar"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-wide text-white">Operator</h2>
                        <div className="font-mono text-xs text-text-muted">Level {level} Architect</div>
                    </div>

                    {/* Controls Row */}
                    <div className="ml-auto flex gap-1 pointer-events-auto">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="icon-btn grid place-items-center"
                            title="Export Save"
                            aria-label="Export progress to file"
                        >
                            <Save size={16} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="icon-btn grid place-items-center"
                            title="Import Save"
                            aria-label="Import progress from file"
                        >
                            <Upload size={16} aria-hidden="true" />
                        </button>
                        {soundEnabled ? (
                            <button
                                type="button"
                                onClick={toggleSound}
                                className="icon-btn grid place-items-center"
                                title="Mute Sounds"
                                aria-label="Mute sound effects"
                                aria-pressed="true"
                            >
                                <Volume2 size={16} aria-hidden="true" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleSound}
                                className="icon-btn grid place-items-center"
                                title="Enable Sounds"
                                aria-label="Enable sound effects"
                                aria-pressed="false"
                            >
                                <VolumeX size={16} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleLoad}
                    title="Import save file"
                    aria-label="Import save file"
                />

                {/* XP Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/15 bg-black/30">
                    <progress 
                        value={progress} 
                        max={100} 
                        aria-label="Experience progress to next level"
                        className="xp-progress-bar"
                    />
                    <div
                        ref={progressBarRef}
                        className="xp-progress-fill h-full bg-neon-cyan transition-all duration-700 ease-out"
                        aria-hidden="true"
                    />
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-mono uppercase text-text-muted">
                    <span>XP: {xp}</span>
                    <span>Next Lvl: {(level) * 1000}</span>
                </div>
            </section>

            {/* Stats / Achievements */}
            <section className="panel-base flex gap-3 p-3 text-xs font-mono text-text-muted" aria-label="Achievements and streaks">
                <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-yellow-500" aria-hidden="true" />
                    <span className="text-white">{unlockedBadges.length} Badges</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flame className="w-3 h-3 text-orange-500" aria-hidden="true" />
                    <span className="text-white">{streak} Day Streak</span>
                </div>
            </section>

            {/* Badges Mini-Display (Optional - just listing icons would be cool) */}
            {unlockedBadges.length > 0 && (
                <div className="flex gap-1">
                    {/* We could map a few small icons here, but count is enough for V1 */}
                </div>
            )}
        </aside>
    );
}
