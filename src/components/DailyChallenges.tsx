'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { DailyChallenge } from '@/types';
import { useGameStore } from '@/lib/store';
import { getInitialSkills } from '@/lib/skill-data';

// Pure function to generate daily challenge from a given date string
function generateDailyChallenge(todayStr: string): DailyChallenge | null {
    if (!todayStr) return null;
    const skills = getInitialSkills();

    // Use date as seed for deterministic challenge selection
    const seed = todayStr.split('-').reduce((acc, val) => acc + Number.parseInt(val, 10), 0);
    const availableSkills = skills.filter(s => s.data.quiz && s.data.quiz.length > 0);

    if (availableSkills.length === 0) return null;

    const challengeSkill = availableSkills[seed % availableSkills.length];
    if (!challengeSkill?.data.quiz?.length) return null;
    const quiz = challengeSkill.data.quiz;
    const question = quiz[seed % quiz.length];
    if (!question) return null;

    const expiresAt = new Date(todayStr).setHours(23, 59, 59, 999);

    return {
        id: `daily-${todayStr}`,
        skillId: challengeSkill.id,
        type: 'quiz',
        title: `Daily Challenge: ${challengeSkill.data.title}`,
        description: question.question,
        xpBonus: 50,
        expiresAt,
        completed: false,
    };
}

// Pure function to calculate time remaining from a given timestamp
function calculateTimeRemaining(expiresAt: number, now: number): string {
    const diff = expiresAt - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

export function DailyChallenges() {
    const { nodes, userXP } = useGameStore();
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [challengeCompleted, setChallengeCompleted] = useState(false);

    // Use lazy initializer to capture mount time (runs only once)
    const [mountState] = useState(() => {
        const now = Date.now();
        const todayStr = new Date(now).toISOString().split('T')[0] ?? '';
        const challenge = generateDailyChallenge(todayStr);
        const initialTimeRemaining = challenge ? calculateTimeRemaining(challenge.expiresAt, now) : '';
        return { todayStr, challenge, initialTimeRemaining };
    });

    const { todayStr, challenge: dailyChallenge } = mountState;

    // Time remaining state with lazy initializer
    const [timeRemaining, setTimeRemaining] = useState(mountState.initialTimeRemaining);

    // Ref to track if effect has run (to avoid double-calling setState)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!dailyChallenge) return;

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Update time remaining every minute (setState in interval callback is fine)
        intervalRef.current = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(dailyChallenge.expiresAt, Date.now()));
        }, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [dailyChallenge]);

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !dailyChallenge) return;

        // Find the skill and its quiz
        const skill = nodes.find(n => n.id === dailyChallenge.skillId);
        if (!skill?.data.quiz) return;

        const seed = todayStr.split('-').reduce((acc, val) => acc + Number.parseInt(val, 10), 0);
        const question = skill.data.quiz[seed % skill.data.quiz.length];
        if (!question) return;

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
            <div className="panel-base p-4">
                <p className="text-center text-text-muted">No challenge available today. Check back tomorrow!</p>
            </div>
        );
    }

    const skill = nodes.find(n => n.id === dailyChallenge.skillId);
    if (!skill?.data.quiz) return null;

    const seed = todayStr.split('-').reduce((acc, val) => acc + Number.parseInt(val, 10), 0);
    const question = skill.data.quiz[seed % skill.data.quiz.length];
    if (!question) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-strong p-4 md:p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-warning-amber/35 bg-warning-amber/10">
                        <Trophy className="text-warning-amber" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">{dailyChallenge.title}</h3>
                        <p className="text-sm text-text-muted">Complete for +{dailyChallenge.xpBonus} XP bonus.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1">
                    <Clock className="text-text-muted" size={16} />
                    <span className="text-sm font-semibold text-gray-200">{timeRemaining}</span>
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
                        <div className="panel-base mb-4 p-4">
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
                                        className={`w-full rounded-[12px] border p-3 text-left transition-all ${
                                            selectedAnswer === idx
                                                ? showResult
                                                    ? idx === question.correctIndex
                                                        ? 'border-electric-green/60 bg-electric-green/20'
                                                        : 'border-alert-red/60 bg-alert-red/20'
                                                    : 'border-neon-cyan/55 bg-neon-cyan/15'
                                                : 'border-white/20 bg-black/20 hover:border-neon-cyan/45 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">{option}</span>
                                            {showResult && idx === question.correctIndex && (
                                                <CheckCircle2 className="text-electric-green" size={20} />
                                            )}
                                            {showResult && selectedAnswer === idx && idx !== question.correctIndex && (
                                                <XCircle className="text-alert-red" size={20} />
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
                                className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Zap size={20} />
                                Submit Answer
                            </button>
                        )}

                        {showResult && !challengeCompleted && (
                            <div className="rounded-[12px] border border-alert-red/45 bg-alert-red/10 p-4">
                                <p className="text-alert-red">Incorrect. Try again tomorrow for a new challenge.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="completed"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rounded-[12px] border border-electric-green/45 bg-electric-green/10 p-6 text-center"
                    >
                        <CheckCircle2 className="mx-auto mb-3 text-electric-green" size={48} />
                        <h4 className="mb-2 text-2xl font-semibold text-white">Challenge Complete</h4>
                        <p className="text-gray-100">You earned +{dailyChallenge.xpBonus} bonus XP.</p>
                        <p className="mt-2 text-sm text-text-muted">Come back tomorrow for a new challenge.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
