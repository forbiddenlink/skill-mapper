'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ExternalLink, CheckCircle, RotateCcw, Play,
    FileText, Beaker, Video, BookOpen, MonitorPlay, BrainCircuit
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { calculateSkillXp } from '@/lib/gamification';
import ChallengeModal from '../ChallengeModal';
import { useState } from 'react';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

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
    const streak = useGameStore((state) => state.streak);
    const selectSkill = useGameStore((state) => state.selectSkill);
    const unlockSkill = useGameStore((state) => state.unlockSkill);
    const completeSkill = useGameStore((state) => state.completeSkill);
    const refreshSkill = useGameStore((state) => state.refreshSkill);

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
        setIsChallengeOpen(false);
    };

    if (!skill) return null;

    const { title, description, tier, status, resources, xpReward, quiz } = skill.data;
    const hasQuiz = quiz && quiz.length > 0;
    const calculatedXp = calculateSkillXp(skill, nodes, streak);
    const hasBonus = calculatedXp > xpReward;

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
                        className="fixed inset-x-0 bottom-0 top-auto z-40 flex max-h-[88dvh] w-full flex-col rounded-t-[16px] border border-white/10 bg-surface-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:inset-y-0 sm:right-0 sm:top-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-l sm:p-5"
                        role="dialog"
                        aria-labelledby="skill-title"
                        aria-describedby="skill-description"
                        aria-modal="true"
                        tabIndex={-1}
                    >
                        <div className="mb-5 flex items-start justify-between border-b divider-soft pb-4">
                            <div>
                                <span className="rounded-[6px] border border-white/12 bg-surface-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                                    Tier {tier}
                                </span>
                                <h2 id="skill-title" className="font-display mt-2 text-[28px] font-semibold leading-[34px] tracking-tight text-foreground">
                                    {title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="icon-btn grid place-items-center"
                                aria-label="Close skill details"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto">
                            <p id="skill-description" className="border-l-2 border-signal pl-4 text-[15px] leading-6 text-foreground/90">
                                {description}
                            </p>

                            <div className="panel-base flex items-center justify-between p-4">
                                <div>
                                    <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-text-muted">Reward</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-display text-xl font-semibold text-reward">{calculatedXp} XP</span>
                                        {hasBonus && (
                                            <span className="text-xs font-medium text-mastery">
                                                (+{calculatedXp - xpReward} streak)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {hasQuiz && (
                                    <div className="text-right">
                                        <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-reward">Challenge</div>
                                        <div className="flex items-center justify-end gap-1 text-sm font-semibold text-reward">
                                            <BrainCircuit size={14} /> Active
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-foreground">
                                    Learning resources
                                </h3>
                                <div className="space-y-2">
                                    {resources.length > 0 ? resources.map((res, idx) => (
                                        <a
                                            key={`${res.url}-${idx}`}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onMouseEnter={() => playHover()}
                                            className="panel-base group flex items-center gap-3 p-3 hover:border-signal/40"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/10 bg-surface-1 text-text-muted transition-colors group-hover:border-signal/40 group-hover:bg-signal/10 group-hover:text-signal">
                                                {getResourceIcon(res.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="line-clamp-1 text-sm font-medium text-foreground/90 transition-colors group-hover:text-signal">{res.label}</div>
                                                <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{res.type}</div>
                                            </div>
                                        </a>
                                    )) : (
                                        <div className="text-sm text-text-muted">No resources linked yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="divider-soft mt-5 border-t pt-4">
                            {status === 'available' && (
                                <button
                                    type="button"
                                    onClick={handleUnlock}
                                    className="btn-primary flex w-full items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <Play className="w-4 h-4" /> Start learning
                                </button>
                            )}

                            {status === 'in-progress' && (
                                <button
                                    type="button"
                                    onClick={handleComplete}
                                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border font-bold uppercase tracking-wide transition-colors ${hasQuiz
                                            ? 'border-reward/40 bg-reward text-[oklch(0.18_0.04_85)] hover:brightness-105'
                                            : 'border-mastery/40 bg-mastery text-[oklch(0.18_0.04_150)] hover:brightness-105'
                                        }`}
                                >
                                    {hasQuiz ? (
                                        <>
                                            <BrainCircuit className="w-4 h-4" /> Take challenge
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Mark mastered
                                        </>
                                    )}
                                </button>
                            )}

                            {status === 'mastered' && (
                                <div className="rounded-[10px] border border-mastery/35 bg-mastery/10 p-4 text-center font-mono text-sm text-mastery">
                                    Skill mastered
                                </div>
                            )}

                            {status === 'decayed' && (
                                <button
                                    type="button"
                                    onClick={() => refreshSkill(skill.id)}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-decay/40 bg-decay font-bold uppercase tracking-wide text-white hover:brightness-105"
                                >
                                    <RotateCcw className="w-4 h-4" /> Repair skill
                                </button>
                            )}

                            {status === 'locked' && (
                                <div className="rounded-[10px] border border-white/10 bg-surface-1 p-4 text-center font-mono text-xs text-text-muted">
                                    Prerequisites missing
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

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
