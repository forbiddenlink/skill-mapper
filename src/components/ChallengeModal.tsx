'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Trophy, AlertTriangle, Cpu } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg bg-gray-900 border border-neon-cyan/50 rounded-lg p-6 shadow-2xl shadow-neon-cyan/15 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-pulse" />

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neon-cyan/10 rounded border border-neon-cyan/30 text-neon-cyan">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold font-display tracking-wide">
                                    SKILL CHALLENGE
                                </h3>
                                <p className="text-xs text-neon-cyan font-mono uppercase">
                                    {skill.data.title} :: Protocol v.1
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" title="Close challenge" aria-label="Close challenge">
                            <X size={24} />
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
                                <div className="text-xs text-gray-400 font-mono mb-2">
                                    Query {currentQuestionIdx + 1} / {quiz.length}
                                </div>
                                <h4 className="text-lg text-white font-medium mb-6">
                                    {currentQ.question}
                                </h4>
                                <div className="space-y-3">
                                    {currentQ.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="w-full text-left p-4 rounded border border-gray-700 bg-gray-800/50 hover:bg-neon-cyan/20 hover:border-neon-cyan hover:text-white transition-all text-gray-300 text-sm font-medium group relative overflow-hidden"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                <span className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-xs group-hover:border-neon-cyan group-hover:bg-neon-cyan group-hover:text-black">
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
                                    className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500 text-red-500"
                                >
                                    <AlertTriangle size={40} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white font-display mb-2">ACCESS DENIED</h3>
                                <p className="text-gray-400 mb-6">Incorrect response detected.</p>
                                <button
                                    onClick={() => {
                                        setStatus('playing');
                                        setCurrentQuestionIdx(0);
                                        playClick();
                                    }}
                                    className="px-6 py-2 bg-white text-black font-bold rounded uppercase tracking-wider hover:bg-gray-200"
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
