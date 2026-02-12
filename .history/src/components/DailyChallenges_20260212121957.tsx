'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { DailyChallenge } from '@/types';
import { useGameStore } from '@/lib/store';
import { getInitialSkills } from '@/lib/skill-data';

export function DailyChallenges() {
    const { nodes, userXP } = useGameStore();
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [challengeCompleted, setChallengeCompleted] = useState(false);

    // Generate daily challenge based on date
    const dailyChallenge = useMemo((): DailyChallenge | null => {
        const today = new Date().toISOString().split('T')[0];
        const skills = getInitialSkills();
        
        // Use date as seed for deterministic challenge selection
        const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const availableSkills = skills.filter(s => s.data.quiz && s.data.quiz.length > 0);
        
        if (availableSkills.length === 0) return null;
        
        const challengeSkill = availableSkills[seed % availableSkills.length];
        const quiz = challengeSkill.data.quiz!;
        const question = quiz[seed % quiz.length];
        
        const expiresAt = new Date(today).setHours(23, 59, 59, 999);
        
        return {
            id: `daily-${today}`,
            skillId: challengeSkill.id,
            type: 'quiz',
            title: `Daily Challenge: ${challengeSkill.data.title}`,
            description: question.question,
            xpBonus: 50,
            expiresAt,
            completed: false,
        };
    }, []);

    const timeRemaining = useMemo(() => {
        if (!dailyChallenge) return '';
        const now = Date.now();
        const diff = dailyChallenge.expiresAt - now;
        
        if (diff <= 0) return 'Expired';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }, [dailyChallenge]);

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !dailyChallenge) return;
        
        // Find the skill and its quiz
        const skill = nodes.find(n => n.id === dailyChallenge.skillId);
        if (!skill || !skill.data.quiz) return;
        
        const today = new Date().toISOString().split('T')[0];
        const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const question = skill.data.quiz[seed % skill.data.quiz.length];
        
        const isCorrect = selectedAnswer === question.correctIndex;
        setShowResult(true);
        
        if (isCorrect) {
            // Award bonus XP
            useGameStore.setState({ userXP: userXP + dailyChallenge.xpBonus });
            setChallengeCompleted(true);
        }
    };

    if (!dailyChallenge) {
        return (
            <div className="p-4 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg border border-purple-500">
                <p className="text-gray-300 text-center">No challenge available today. Check back tomorrow!</p>
            </div>
        );
    }

    const skill = nodes.find(n => n.id === dailyChallenge.skillId);
    if (!skill || !skill.data.quiz) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const question = skill.data.quiz[seed % skill.data.quiz.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg border-2 border-purple-500 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-400" size={28} />
                    <div>
                        <h3 className="text-xl font-bold text-white">{dailyChallenge.title}</h3>
                        <p className="text-sm text-gray-300">Complete for +{dailyChallenge.xpBonus} XP bonus!</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                    <Clock className="text-orange-400" size={16} />
                    <span className="text-sm font-semibold text-orange-300">{timeRemaining}</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!challengeCompleted ? (
                    <motion.div
                        key="challenge"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-black/30 p-4 rounded-lg mb-4">
                            <p className="text-lg text-white mb-4">{question.question}</p>
                            <div className="space-y-2">
                                {question.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (!showResult) {
                                                setSelectedAnswer(idx);
                                            }
                                        }}
                                        disabled={showResult}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${
                                            selectedAnswer === idx
                                                ? showResult
                                                    ? idx === question.correctIndex
                                                        ? 'bg-green-600 border-green-400'
                                                        : 'bg-red-600 border-red-400'
                                                    : 'bg-purple-600 border-purple-400'
                                                : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                                        } border-2`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">{option}</span>
                                            {showResult && idx === question.correctIndex && (
                                                <CheckCircle2 className="text-green-300" size={20} />
                                            )}
                                            {showResult && selectedAnswer === idx && idx !== question.correctIndex && (
                                                <XCircle className="text-red-300" size={20} />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!showResult && (
                            <button
                                onClick={handleAnswerSubmit}
                                disabled={selectedAnswer === null}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
                            >
                                <Zap size={20} />
                                Submit Answer
                            </button>
                        )}

                        {showResult && !challengeCompleted && (
                            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                                <p className="text-red-200">Incorrect! Try again tomorrow for a new challenge.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="completed"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-center"
                    >
                        <CheckCircle2 className="mx-auto mb-3 text-white" size={48} />
                        <h4 className="text-2xl font-bold text-white mb-2">Challenge Complete! 🎉</h4>
                        <p className="text-green-100">You earned +{dailyChallenge.xpBonus} bonus XP!</p>
                        <p className="text-sm text-green-200 mt-2">Come back tomorrow for a new challenge</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
