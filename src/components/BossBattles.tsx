'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Crown, CheckCircle2, XCircle, Shield, Swords, X } from 'lucide-react';
import { BossBattle } from '@/types';
import { useGameStore } from '@/lib/store';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

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
    const nodes = useGameStore((s) => s.nodes);
    const bossProgress = useGameStore((s) => s.bossProgress);
    const recordBossResult = useGameStore((s) => s.recordBossResult);
    const [activeBattle, setActiveBattle] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [battleCompleted, setBattleCompleted] = useState(false);
    const closeBattle = () => setActiveBattle(null);
    const dialogRef = useDialogA11y<HTMLDivElement>(Boolean(activeBattle), closeBattle);

    const battles = useMemo(() => {
        return BOSS_BATTLES.map((boss) => {
            const data = bossProgress[boss.id] ?? { completed: false, attempts: 0, bestScore: 0 };
            const requiredMastered = boss.requiredSkills.every((skillId) => {
                const node = nodes.find((n) => n.id === skillId);
                return node?.data.status === 'mastered';
            });

            return {
                ...boss,
                ...data,
                isUnlocked: requiredMastered,
            };
        });
    }, [nodes, bossProgress]);

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

        setTimeout(() => {
            if (currentQuestion < battle.questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                const finalScore = correct ? score + 1 : score;
                recordBossResult({
                    bossId: battle.id,
                    score: finalScore,
                    questionCount: battle.questions.length,
                    xpReward: battle.xpReward,
                    badgeId: battle.unlocksBadge,
                });
                setBattleCompleted(true);
            }
        }, 2000);
    };

    if (activeBattle) {
        const battle = battles.find(b => b.id === activeBattle);
        if (!battle) return null;

        const question = battle.questions[currentQuestion];
        if (!question) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.96 }}
                    animate={{ scale: 1 }}
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="boss-battle-title"
                    aria-describedby="boss-battle-description"
                    tabIndex={-1}
                    className="modal-shell w-full max-w-2xl border-reward/40 p-5 md:p-8"
                >
                    <h2 id="boss-battle-title" className="sr-only">
                        {battle.title}
                    </h2>
                    <p id="boss-battle-description" className="sr-only">
                        Boss battle challenge dialog.
                    </p>
                    <button
                        type="button"
                        onClick={closeBattle}
                        className="icon-btn ml-auto grid place-items-center"
                        aria-label="Close boss battle"
                    >
                        <X size={20} />
                    </button>
                    {!battleCompleted ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Skull className="text-decay" size={32} />
                                    <div>
                                        <h2 className="font-display text-2xl font-semibold text-foreground">{battle.title}</h2>
                                        <p className="font-mono text-sm text-text-muted">Question {currentQuestion + 1} of {battle.questions.length}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-text-muted">Score</p>
                                    <p className="font-display text-2xl font-bold text-reward">{score}/{battle.questions.length}</p>
                                </div>
                            </div>

                            <div className="panel-base mb-6 p-6">
                                <p className="mb-6 text-xl text-foreground">{question.question}</p>
                                <div className="space-y-3">
                                    {question.options.map((option: string, idx: number) => (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => !showResult && setSelectedAnswer(idx)}
                                            disabled={showResult}
                                            className={`w-full rounded-[10px] border p-4 text-left font-semibold text-foreground transition-all ${
                                                selectedAnswer === idx
                                                    ? showResult
                                                        ? idx === question.correctIndex
                                                            ? 'border-mastery/60 bg-mastery/20'
                                                            : 'border-decay/60 bg-decay/20'
                                                        : 'border-signal/55 bg-signal/15'
                                                    : 'border-white/12 bg-surface-1 hover:border-signal/40 hover:bg-surface-3/40'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {showResult && idx === question.correctIndex && (
                                                    <CheckCircle2 className="text-mastery" size={24} />
                                                )}
                                                {showResult && selectedAnswer === idx && idx !== question.correctIndex && (
                                                    <XCircle className="text-decay" size={24} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!showResult && (
                                <button
                                    type="button"
                                    onClick={() => handleAnswer(battle)}
                                    disabled={selectedAnswer === null}
                                    className="btn-primary flex h-12 w-full items-center justify-center gap-2 text-lg disabled:cursor-not-allowed disabled:opacity-50"
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
                                    <Crown className="mx-auto mb-4 text-reward" size={64} />
                                    <h2 className="font-display mb-4 text-4xl font-semibold text-foreground">Victory</h2>
                                    <p className="mb-2 text-xl text-foreground/90">You defeated the {battle.title}.</p>
                                    <p className="mb-6 text-lg text-reward">+{battle.xpReward} XP earned.</p>
                                    <div className="flex items-center justify-center gap-4 font-display text-2xl font-bold text-foreground">
                                        <span>Final score</span>
                                        <span className="text-reward">{score}/{battle.questions.length}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Shield className="mx-auto mb-4 text-text-muted" size={64} />
                                    <h2 className="font-display mb-4 text-4xl font-bold text-foreground">Defeated</h2>
                                    <p className="mb-2 text-xl text-foreground/90">You need {Math.ceil(battle.questions.length * 0.7)} correct answers to win</p>
                                    <p className="mb-6 text-lg text-decay">Your score: {score}/{battle.questions.length}</p>
                                    <p className="text-text-muted">Review the skills and try again.</p>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={closeBattle}
                                className="btn-ghost mt-6 font-semibold"
                            >
                                Return to battles
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 text-center">
                <h2 className="font-display mb-2 text-3xl font-semibold text-foreground">Boss Battles</h2>
                <p className="text-text-muted">Master all skills in a tier to unlock the ultimate challenge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {battles.map((battle, idx) => (
                    <motion.div
                        key={battle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`panel-base p-6 transition-all ${battle.isUnlocked ? 'cursor-pointer border-reward/50 hover:-translate-y-0.5' : 'opacity-65'}`}
                        onClick={() => battle.isUnlocked && handleStartBattle(battle.id)}
                        onKeyDown={(event) => {
                            if (!battle.isUnlocked) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleStartBattle(battle.id);
                            }
                        }}
                        role="button"
                        tabIndex={battle.isUnlocked ? 0 : -1}
                        aria-disabled={!battle.isUnlocked}
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <Skull className={battle.isUnlocked ? 'text-decay' : 'text-text-muted'} size={32} />
                            {battle.completed && (
                                <Crown className="text-reward" size={28} />
                            )}
                        </div>

                        <h3 className="font-display mb-2 text-xl font-semibold text-foreground">{battle.title}</h3>
                        <p className="mb-4 text-sm text-foreground/85">{battle.description}</p>

                        <div className="mb-4 space-y-2 font-mono text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Questions</span>
                                <span className="font-semibold text-foreground">{battle.questions.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">XP reward</span>
                                <span className="font-semibold text-reward">+{battle.xpReward}</span>
                            </div>
                            {battle.attempts > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-text-muted">Best score</span>
                                    <span className="font-semibold text-mastery">{battle.bestScore}/{battle.questions.length}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!battle.isUnlocked}
                            className={`w-full rounded-[10px] py-3 font-semibold ${
                                battle.isUnlocked
                                    ? battle.completed
                                        ? 'border border-mastery/45 bg-mastery/20 text-foreground'
                                        : 'btn-primary'
                                    : 'cursor-not-allowed border border-white/12 bg-surface-1 text-text-muted'
                            }`}
                        >
                            {battle.isUnlocked 
                                ? battle.completed 
                                    ? 'Completed — retry'
                                    : 'Enter battle'
                                : 'Master all skills to unlock'
                            }
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
