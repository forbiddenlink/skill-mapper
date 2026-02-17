'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ExternalLink, CheckCircle, RotateCcw, Play,
    FileText, Beaker, Video, BookOpen, MonitorPlay, BrainCircuit
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import ChallengeModal from '../ChallengeModal';
import { useState } from 'react';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

// Helper for resource icons
const getResourceIcon = (type: string) => {
    switch (type) {
        case 'video': return <Video className="w-4 h-4" />;
        case 'article': return <BookOpen className="w-4 h-4" />;
        case 'paper': return <FileText className="w-4 h-4" />;
        case 'lab': return <Beaker className="w-4 h-4" />;
        case 'course': return <MonitorPlay className="w-4 h-4" />;
        default: return <ExternalLink className="w-4 h-4" />;
    }
};

export default function SkillDetailsPanel() {
    const selectedSkillId = useGameStore((state) => state.selectedSkillId);
    const nodes = useGameStore((state) => state.nodes);
    const selectSkill = useGameStore((state) => state.selectSkill);
    const unlockSkill = useGameStore((state) => state.unlockSkill);
    const completeSkill = useGameStore((state) => state.completeSkill);
    const refreshSkill = useGameStore((state) => state.refreshSkill);

    // Sounds & State
    const { playUnlock, playMastery, playClick, playHover } = useGameSounds();
    const handleClose = () => {
        playClick();
        selectSkill(null);
    };
    const [isChallengeOpen, setIsChallengeOpen] = useState(false);
    const isPanelOpen = Boolean(selectedSkillId) && !isChallengeOpen;
    const dialogRef = useDialogA11y<HTMLElement>(isPanelOpen, handleClose);

    const skill = nodes.find((n) => n.id === selectedSkillId);

    const handleUnlock = () => {
        playUnlock();
        unlockSkill(skill!.id);
    };

    const handleComplete = () => {
        // Check if quiz exists
        if (skill?.data.quiz && skill.data.quiz.length > 0) {
            playClick();
            setIsChallengeOpen(true);
        } else {
            playMastery();
            completeSkill(skill!.id);
        }
    };

    const handleChallengeSuccess = () => {
        completeSkill(skill!.id);
        // Modal closes itself or we close it here? 
        // Modal calls onSuccess then onClose typically, but let's be safe
        setIsChallengeOpen(false);
    };

    if (!skill) return null;

    const { title, description, tier, status, resources, xpReward, quiz } = skill.data;
    const hasQuiz = quiz && quiz.length > 0;

    return (
        <>
            <AnimatePresence>
                {selectedSkillId && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        ref={dialogRef}
                        className="fixed bottom-0 right-0 top-0 z-40 flex w-full flex-col border-l border-white/20 bg-surface-2/95 p-4 shadow-2xl backdrop-blur-xl sm:w-[420px] sm:p-5"
                        role="dialog"
                        aria-labelledby="skill-title"
                        aria-describedby="skill-description"
                        aria-modal="true"
                        tabIndex={-1}
                    >
                        {/* Header */}
                        <div className="mb-5 flex items-start justify-between border-b divider-soft pb-4">
                            <div>
                                <span className="rounded-[8px] border border-white/20 bg-black/25 px-2 py-1 font-mono text-[10px] uppercase text-text-muted">
                                    Tier: {tier}
                                </span>
                                <h2 id="skill-title" className="mt-2 text-[28px] font-semibold leading-[34px] text-white">
                                    {title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="icon-btn grid place-items-center"
                                aria-label="Close skill details"
                            >
                                <X className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-5 overflow-y-auto">
                            <p id="skill-description" className="border-l-2 border-neon-cyan pl-4 text-[15px] leading-6 text-gray-200">
                                {description}
                            </p>

                            <div className="panel-base flex items-center justify-between p-4">
                                <div>
                                    <div className="mb-1 font-mono text-xs uppercase text-text-muted">Reward</div>
                                    <div className="text-xl font-semibold text-neon-cyan">{xpReward} XP</div>
                                </div>
                                {hasQuiz && (
                                    <div className="text-right">
                                        <div className="mb-1 font-mono text-xs uppercase text-warning-amber">Challenge</div>
                                        <div className="flex items-center justify-end gap-1 text-sm font-semibold text-warning-amber">
                                            <BrainCircuit size={14} /> Active
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resources */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
                                    Learning Uplink
                                </h3>
                                <div className="space-y-2">
                                    {resources.length > 0 ? resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onMouseEnter={() => playHover()}
                                            className="panel-base group flex items-center gap-3 p-3 hover:border-neon-cyan/40"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/15 bg-black/20 text-text-muted transition-colors group-hover:border-neon-cyan/45 group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan">
                                                {getResourceIcon(res.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="line-clamp-1 text-sm font-medium text-gray-200 transition-colors group-hover:text-neon-cyan">{res.label}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-text-muted">{res.type}</div>
                                            </div>
                                        </a>
                                    )) : (
                                        <div className="text-sm italic text-text-muted">No data feed connected.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="divider-soft mt-5 border-t pt-4">
                            {status === 'available' && (
                                <button
                                    type="button"
                                    onClick={handleUnlock}
                                    className="btn-primary flex w-full items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <Play className="w-4 h-4" /> Start Learning
                                </button>
                            )}

                            {status === 'in-progress' && (
                                <button
                                    type="button"
                                    onClick={handleComplete}
                                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border font-bold uppercase tracking-wide transition-colors ${hasQuiz
                                            ? 'border-warning-amber/40 bg-warning-amber text-black hover:brightness-105'
                                            : 'border-electric-green/40 bg-electric-green text-black hover:brightness-105'
                                        }`}
                                >
                                    {hasQuiz ? (
                                        <>
                                            <BrainCircuit className="w-4 h-4" /> Initialize Challenge
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Initialize Mastery
                                        </>
                                    )}
                                </button>
                            )}

                            {status === 'mastered' && (
                                <div className="rounded-[12px] border border-plasma-pink/35 bg-plasma-pink/10 p-4 text-center font-mono text-sm text-plasma-pink">
                                    Skill Optimized
                                </div>
                            )}

                            {status === 'decayed' && (
                                <button
                                    type="button"
                                    onClick={() => refreshSkill(skill.id)}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-alert-red/40 bg-alert-red text-white font-bold uppercase tracking-wide hover:brightness-105"
                                >
                                    <RotateCcw className="w-4 h-4" /> Repair Skill Node
                                </button>
                            )}

                            {status === 'locked' && (
                                <div className="rounded-[12px] border border-white/15 bg-black/25 p-4 text-center font-mono text-xs text-text-muted">
                                    Prerequisites Missing
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Quiz Modal */}
            {isChallengeOpen && skill && (
                <ChallengeModal
                    skillId={skill.id}
                    onClose={() => setIsChallengeOpen(false)}
                    onSuccess={handleChallengeSuccess}
                />
            )}
        </>
    );
}
