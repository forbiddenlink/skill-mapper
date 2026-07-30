'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Trophy, AlertTriangle, Cpu } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

export default function ChallengeModal({
    skillId,
    onClose,
    onSuccess
}: {
    skillId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const nodes = useGameStore((state) => state.nodes);
    const skill = nodes.find((n) => n.id === skillId);
    const { playClick, playMastery, playError } = useGameSounds();
    const dialogRef = useDialogA11y<HTMLDivElement>(true, onClose);

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [status, setStatus] = useState<'playing' | 'success' | 'failed'>('playing');

    if (!skill || !skill.data.quiz) return null;

    const quiz = skill.data.quiz;
    const currentQ = quiz[currentQuestionIdx];

    if (!currentQ) return null;

    const handleAnswer = (index: number) => {
        if (index === currentQ.correctIndex) {
            playClick();
            if (currentQuestionIdx < quiz.length - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
            } else {
                setStatus('success');
                playMastery();
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            }
        } else {
            setStatus('failed');
            playError();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="challenge-title"
                    aria-describedby="challenge-description"
                    tabIndex={-1}
                    className="modal-shell relative w-full max-w-lg overflow-hidden p-5 md:p-6"
                >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-signal to-transparent" />

                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-signal/35 bg-signal/10 text-signal">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 id="challenge-title" className="font-display font-semibold tracking-wide text-foreground">
                                    Skill challenge
                                </h3>
                                <p id="challenge-description" className="font-mono text-xs uppercase text-signal">
                                    {skill.data.title}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="icon-btn grid place-items-center" title="Close challenge" aria-label="Close challenge">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-8 min-h-52 flex flex-col justify-center">
                        {status === 'playing' && (
                            <motion.div
                                key={currentQuestionIdx}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                            >
                                    <div className="mb-2 font-mono text-xs text-text-muted">
                                        Query {currentQuestionIdx + 1} / {quiz.length}
                                    </div>
                                <h4 className="text-lg text-white font-medium mb-6">
                                    {currentQ.question}
                                </h4>
                                <div className="space-y-3">
                                    {currentQ.options.map((opt, idx) => (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="panel-base group relative w-full overflow-hidden rounded-[12px] border border-white/15 p-4 text-left text-sm font-medium text-gray-200 transition-all hover:border-neon-cyan/55 hover:bg-neon-cyan/10 hover:text-white"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/25 text-xs group-hover:border-neon-cyan group-hover:bg-neon-cyan group-hover:text-black">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {opt}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500 text-green-500"
                                >
                                    <Trophy size={40} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white font-display mb-2">ACCESS GRANTED</h3>
                                <p className="text-gray-400">Skill mastery verified. Uploading XP...</p>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-alert-red bg-alert-red/20 text-alert-red"
                                >
                                    <AlertTriangle size={40} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white font-display mb-2">ACCESS DENIED</h3>
                                <p className="text-gray-400 mb-6">Incorrect response detected.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('playing');
                                        setCurrentQuestionIdx(0);
                                        playClick();
                                    }}
                                    className="btn-primary px-6 uppercase tracking-wide"
                                >
                                    Retry Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
