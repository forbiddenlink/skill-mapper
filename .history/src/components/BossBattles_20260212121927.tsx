'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Crown, CheckCircle2, XCircle, Shield, Swords } from 'lucide-react';
import { BossBattle } from '@/types';
import { useGameStore } from '@/lib/store';

const BOSS_BATTLES: Omit<BossBattle, 'completed' | 'attempts' | 'bestScore'>[] = [
    {
        id: 'boss-foundation',
        tier: 'foundation',
        title: 'Foundation Master Challenge',
        description: 'Prove your mastery of web fundamentals and programming basics',
        requiredSkills: ['web-standards', 'git-ops', 'es-next', 'python-core', 'http-fundamentals'],
        questions: [
            {
                question: "What is the correct order of the HTTP request-response cycle?",
                options: ["Response → Request → Processing", "Request → Processing → Response", "Processing → Request → Response", "Request → Response → Processing"],
                correctIndex: 1
            },
            {
                question: "In Git, what does 'origin' typically represent?",
                options: ["The initial commit", "The remote repository", "The current branch", "The local repository"],
                correctIndex: 1
            },
            {
                question: "Which JavaScript feature allows for non-blocking operations?",
                options: ["Promises and async/await", "Loops", "Variables", "Functions"],
                correctIndex: 0
            }
        ],
        xpReward: 500,
        unlocksBadge: 'foundation-boss'
    },
    {
        id: 'boss-frontend-2',
        tier: 'frontend-2',
        title: 'Frontend Engineering Battle',
        description: 'Master React, TypeScript, and modern frontend architecture',
        requiredSkills: ['react-core', 'tailwind', 'typescript', 'testing-quality', 'async-state', 'zustand', 'framer-motion', 'web-vitals'],
        questions: [
            {
                question: "What is the main benefit of React Server Components?",
                options: ["Faster client-side rendering", "Reduced bundle size and server-side data fetching", "Better animations", "Easier testing"],
                correctIndex: 1
            },
            {
                question: "In TypeScript, what does the 'unknown' type provide over 'any'?",
                options: ["Better performance", "Type safety - requires type checking before use", "Smaller bundle size", "No difference"],
                correctIndex: 1
            },
            {
                question: "What Core Web Vital measures visual stability?",
                options: ["LCP", "FID", "CLS", "TTFB"],
                correctIndex: 2
            }
        ],
        xpReward: 1000,
        unlocksBadge: 'frontend-boss'
    },
    {
        id: 'boss-backend-data',
        tier: 'backend-data',
        title: 'Backend & Data Boss Fight',
        description: 'Conquer server-side development, databases, and data pipelines',
        requiredSkills: ['node-runtime', 'postgresql', 'data-pipelines', 'vector-db', 'rest-api', 'authentication', 'graphql', 'docker'],
        questions: [
            {
                question: "What is the primary advantage of JWT over session-based auth?",
                options: ["More secure", "Stateless and scalable", "Faster", "Easier to implement"],
                correctIndex: 1
            },
            {
                question: "In vector databases, what metric measures similarity?",
                options: ["Euclidean distance", "Cosine similarity", "Both A and B", "Neither"],
                correctIndex: 2
            },
            {
                question: "What is a key benefit of containerization with Docker?",
                options: ["Faster code execution", "Consistent environments across development and production", "Smaller application size", "No need for testing"],
                correctIndex: 1
            }
        ],
        xpReward: 1500,
        unlocksBadge: 'backend-boss'
    },
    {
        id: 'boss-ai-engineer',
        tier: 'ai-engineer',
        title: 'AI Engineering Ultimate Challenge',
        description: 'Master LLMs, RAG, and autonomous AI systems',
        requiredSkills: ['prompt-eng', 'llm-integration', 'embeddings', 'rag-arch', 'evals', 'fine-tuning-peft', 'mlops'],
        questions: [
            {
                question: "In RAG architecture, what is the purpose of the retrieval step?",
                options: ["To train the model", "To provide relevant context from external knowledge", "To reduce latency", "To compress the prompt"],
                correctIndex: 1
            },
            {
                question: "What does LoRA optimize in fine-tuning?",
                options: ["Inference speed", "Number of trainable parameters", "Data quality", "Model size"],
                correctIndex: 1
            },
            {
                question: "What is a key metric for evaluating RAG systems?",
                options: ["BLEU score", "Faithfulness and relevance", "F1 score", "Accuracy"],
                correctIndex: 1
            }
        ],
        xpReward: 2000,
        unlocksBadge: 'ai-boss'
    },
    {
        id: 'boss-systems',
        tier: 'systems',
        title: 'Systems & Architecture Final Boss',
        description: 'The ultimate test of full-stack mastery and system design',
        requiredSkills: ['nextjs-app', 'ai-agents', 'model-serving', 'ai-safety', 'observability', 'kubernetes', 'cicd', 'cloud-platforms', 'security', 'react-native', 'microservices'],
        questions: [
            {
                question: "What is a key principle of microservices architecture?",
                options: ["Single database for all services", "Services are independently deployable", "All services must use the same language", "Services share code directly"],
                correctIndex: 1
            },
            {
                question: "In Kubernetes, what manages desired vs actual cluster state?",
                options: ["Pods", "Control Plane", "Nodes", "Services"],
                correctIndex: 1
            },
            {
                question: "What is the purpose of guardrails in AI systems?",
                options: ["Speed up inference", "Prevent unsafe or off-topic responses", "Reduce costs", "Improve accuracy"],
                correctIndex: 1
            }
        ],
        xpReward: 3000,
        unlocksBadge: 'master-boss'
    }
];

export function BossBattles() {
    const { nodes, userXP, unlockedBadges } = useGameStore();
    const [activeBattle, setActiveBattle] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [battleCompleted, setBattleCompleted] = useState(false);

    // Get battle progress data from localStorage
    const getBattleData = (battleId: string) => {
        const stored = localStorage.getItem(`boss-battle-${battleId}`);
        return stored ? JSON.parse(stored) : { completed: false, attempts: 0, bestScore: 0 };
    };

    const saveBattleData = (battleId: string, data: any) => {
        localStorage.setItem(`boss-battle-${battleId}`, JSON.stringify(data));
    };

    const battles = useMemo(() => {
        return BOSS_BATTLES.map(boss => {
            const data = getBattleData(boss.id);
            const requiredMastered = boss.requiredSkills.every(skillId => {
                const node = nodes.find(n => n.id === skillId);
                return node?.data.status === 'mastered';
            });

            return {
                ...boss,
                ...data,
                isUnlocked: requiredMastered
            };
        });
    }, [nodes]);

    const handleStartBattle = (battleId: string) => {
        setActiveBattle(battleId);
        setCurrentQuestion(0);
        setScore(0);
        setBattleCompleted(false);
        setShowResult(false);
        setSelectedAnswer(null);
    };

    const handleAnswer = (battle: BossBattle) => {
        if (selectedAnswer === null || !battle.questions[currentQuestion]) return;

        const correct = selectedAnswer === battle.questions[currentQuestion].correctIndex;
        setShowResult(true);

        if (correct) {
            setScore(score + 1);
        }

        // Move to next question after delay
        setTimeout(() => {
            if (currentQuestion < battle.questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                // Battle complete
                const finalScore = correct ? score + 1 : score;
                const passed = finalScore >= Math.ceil(battle.questions.length * 0.7); // 70% to pass
                
                const battleData = getBattleData(battle.id);
                const newData = {
                    completed: battleData.completed || passed,
                    attempts: battleData.attempts + 1,
                    bestScore: Math.max(battleData.bestScore, finalScore)
                };
                saveBattleData(battle.id, newData);

                if (passed && !battleData.completed) {
                    // Award XP and badge
                    useGameStore.setState({ 
                        userXP: userXP + battle.xpReward,
                        unlockedBadges: [...unlockedBadges, battle.unlocksBadge]
                    });
                }

                setBattleCompleted(true);
            }
        }, 2000);
    };

    if (activeBattle) {
        const battle = battles.find(b => b.id === activeBattle);
        if (!battle) return null;

        const question = battle.questions[currentQuestion];

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="max-w-2xl w-full bg-gradient-to-br from-red-900 to-purple-900 rounded-lg p-8 border-4 border-yellow-500 shadow-2xl"
                >
                    {!battleCompleted ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Skull className="text-red-400" size={32} />
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{battle.title}</h2>
                                        <p className="text-sm text-gray-300">Question {currentQuestion + 1} of {battle.questions.length}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-300">Score</p>
                                    <p className="text-2xl font-bold text-yellow-400">{score}/{battle.questions.length}</p>
                                </div>
                            </div>

                            <div className="bg-black/30 p-6 rounded-lg mb-6">
                                <p className="text-xl text-white mb-6">{question.question}</p>
                                <div className="space-y-3">
                                    {question.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => !showResult && setSelectedAnswer(idx)}
                                            disabled={showResult}
                                            className={`w-full p-4 rounded-lg text-left transition-all ${
                                                selectedAnswer === idx
                                                    ? showResult
                                                        ? idx === question.correctIndex
                                                            ? 'bg-green-600 border-green-400'
                                                            : 'bg-red-600 border-red-400'
                                                        : 'bg-purple-600 border-purple-400'
                                                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                                            } border-2 font-semibold text-white`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {showResult && idx === question.correctIndex && (
                                                    <CheckCircle2 className="text-green-300" size={24} />
                                                )}
                                                {showResult && selectedAnswer === idx && idx !== question.correctIndex && (
                                                    <XCircle className="text-red-300" size={24} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!showResult && (
                                <button
                                    onClick={() => handleAnswer(battle)}
                                    disabled={selectedAnswer === null}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white text-lg flex items-center justify-center gap-2"
                                >
                                    <Swords size={24} />
                                    {currentQuestion === battle.questions.length - 1 ? 'Finish Battle!' : 'Next Question'}
                                </button>
                            )}
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            {score >= Math.ceil(battle.questions.length * 0.7) ? (
                                <>
                                    <Crown className="mx-auto mb-4 text-yellow-400" size={64} />
                                    <h2 className="text-4xl font-bold text-white mb-4">Victory! 🎉</h2>
                                    <p className="text-xl text-gray-200 mb-2">You defeated the {battle.title}!</p>
                                    <p className="text-lg text-yellow-300 mb-6">+{battle.xpReward} XP Earned!</p>
                                    <div className="flex items-center justify-center gap-4 text-2xl font-bold text-white">
                                        <span>Final Score:</span>
                                        <span className="text-yellow-400">{score}/{battle.questions.length}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Shield className="mx-auto mb-4 text-gray-400" size={64} />
                                    <h2 className="text-4xl font-bold text-white mb-4">Defeated</h2>
                                    <p className="text-xl text-gray-200 mb-2">You need {Math.ceil(battle.questions.length * 0.7)} correct answers to win</p>
                                    <p className="text-lg text-red-300 mb-6">Your score: {score}/{battle.questions.length}</p>
                                    <p className="text-gray-300">Review the skills and try again!</p>
                                </>
                            )}
                            <button
                                onClick={() => setActiveBattle(null)}
                                className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-white"
                            >
                                Return to Battles
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Boss Battles</h2>
                <p className="text-gray-300">Master all skills in a tier to unlock the ultimate challenge</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {battles.map((battle, idx) => (
                    <motion.div
                        key={battle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 bg-gradient-to-br from-red-900 to-purple-900 rounded-lg border-2 ${
                            battle.isUnlocked ? 'border-yellow-500' : 'border-gray-600'
                        } shadow-xl ${battle.isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60'} transition-all`}
                        onClick={() => battle.isUnlocked && handleStartBattle(battle.id)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <Skull className={battle.isUnlocked ? 'text-red-400' : 'text-gray-500'} size={32} />
                            {battle.completed && (
                                <Crown className="text-yellow-400" size={28} />
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{battle.title}</h3>
                        <p className="text-sm text-gray-300 mb-4">{battle.description}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Questions:</span>
                                <span className="text-white font-semibold">{battle.questions.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">XP Reward:</span>
                                <span className="text-yellow-400 font-semibold">+{battle.xpReward}</span>
                            </div>
                            {battle.attempts > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Best Score:</span>
                                    <span className="text-green-400 font-semibold">{battle.bestScore}/{battle.questions.length}</span>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!battle.isUnlocked}
                            className={`w-full py-3 rounded-lg font-semibold ${
                                battle.isUnlocked
                                    ? battle.completed
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {battle.isUnlocked 
                                ? battle.completed 
                                    ? '✓ Completed - Retry?' 
                                    : '⚔️ Enter Battle'
                                : '🔒 Master All Skills to Unlock'
                            }
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
