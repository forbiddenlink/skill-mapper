'use client';

import { useGameStore } from "@/lib/store";
import { Trophy, User, Flame, Volume2, VolumeX, Save, Upload } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HUD() {
    const xp = useGameStore((state) => state.userXP);
    const level = useGameStore((state) => state.userLevel);
    const unlockedBadges = useGameStore((state) => state.unlockedBadges);
    const streak = useGameStore((state) => state.streak);
    const checkStreak = useGameStore((state) => state.checkStreak);
    const soundEnabled = useGameStore((state) => state.soundEnabled);
    const toggleSound = useGameStore((state) => state.toggleSound);

    // Calculate Progress to next level (assuming 1000 XP per level)
    const progress = (xp % 1000) / 10; // 0-100%

    // File Input Ref for Load
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    const handleSave = () => {
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
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.version && json.state) {
                    useGameStore.setState(json.state);
                    alert("Progress Loaded Successfully!"); // Simple feedback for now
                }
            } catch (err) {
                console.error("Failed to load save file", err);
                alert("Invalid Save File");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-4 pointer-events-none" role="complementary" aria-label="Game statistics">
            {/* User Card */}
            <div className="bg-black/80 border border-neon-cyan/50 p-4 rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.2)] w-64" role="region" aria-label="Player information">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan" aria-hidden="true">
                        <User className="text-neon-cyan" />
                    </div>
                    <div>
                        <h2 className="text-white font-display uppercase tracking-widest text-sm">Operator</h2>
                        <div className="text-xs text-gray-400 font-mono">Level {level} Architect</div>
                    </div>

                    {/* Controls Row */}
                    <div className="ml-auto flex gap-1 pointer-events-auto">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                            title="Export Save"
                            aria-label="Export progress to file"
                        >
                            <Save size={16} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                            title="Import Save"
                            aria-label="Import progress from file"
                        >
                            <Upload size={16} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={toggleSound}
                            className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                            title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                            aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
                            aria-pressed={soundEnabled ? "true" : "false"}
                        >
                            {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
                        </button>
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
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-700 relative" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Experience progress to next level">
                    <div
                        className="h-full bg-neon-cyan shadow-[0_0_10px_var(--neon-cyan)] transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] uppercase font-mono text-gray-500 mt-1">
                    <span>XP: {xp}</span>
                    <span>Next Lvl: {(level) * 1000}</span>
                </div>
            </div>

            {/* Stats / Achievements */}
            <div className="bg-black/60 border border-gray-800 p-2 rounded flex gap-4 text-gray-400 text-xs font-mono" role="region" aria-label="Achievements and streaks">
                <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-yellow-500" aria-hidden="true" />
                    <span className="text-white">{unlockedBadges.length} Badges</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flame className="w-3 h-3 text-orange-500" aria-hidden="true" />
                    <span className="text-white">{streak} Day Streak</span>
                </div>
            </div>

            {/* Badges Mini-Display (Optional - just listing icons would be cool) */}
            {unlockedBadges.length > 0 && (
                <div className="flex gap-1">
                    {/* We could map a few small icons here, but count is enough for V1 */}
                </div>
            )}
        </div>
    );
}
