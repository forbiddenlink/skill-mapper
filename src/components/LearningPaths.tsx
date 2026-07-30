'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Layout, Layers, Brain, Rocket, Smartphone, Shield } from 'lucide-react';
import { type LearningPath } from '@/types';
import { useGameStore } from '@/lib/store';

const LEARNING_PATHS: LearningPath[] = [
    {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        description: 'Master modern web development with React, TypeScript, and Next.js',
        icon: Layout,
        skills: ['web-standards', 'es-next', 'react-core', 'tailwind', 'typescript', 'testing-quality', 'zustand', 'framer-motion', 'web-vitals', 'nextjs-app'],
        targetRole: 'Frontend Engineer',
        estimatedWeeks: 16,
        color: 'border-signal/50'
    },
    {
        id: 'fullstack-dev',
        title: 'Full-Stack Developer',
        description: 'Build complete web applications from frontend to backend',
        icon: Layers,
        skills: ['web-standards', 'es-next', 'react-core', 'typescript', 'node-runtime', 'postgresql', 'rest-api', 'authentication', 'docker', 'nextjs-app', 'cloud-platforms'],
        targetRole: 'Full-Stack Engineer',
        estimatedWeeks: 24,
        color: 'border-mastery/50'
    },
    {
        id: 'ai-engineer',
        title: 'AI Engineer',
        description: 'Build intelligent systems with LLMs, RAG, and autonomous agents',
        icon: Brain,
        skills: ['python-core', 'postgresql', 'vector-db', 'llm-integration', 'prompt-eng', 'embeddings', 'rag-arch', 'evals', 'ai-agents', 'mlops'],
        targetRole: 'AI/ML Engineer',
        estimatedWeeks: 20,
        color: 'border-progress/50'
    },
    {
        id: 'devops-sre',
        title: 'DevOps & SRE',
        description: 'Deploy, scale, and monitor production systems',
        icon: Rocket,
        skills: ['git-ops', 'node-runtime', 'docker', 'kubernetes', 'cicd', 'cloud-platforms', 'security', 'observability', 'microservices'],
        targetRole: 'DevOps Engineer / SRE',
        estimatedWeeks: 18,
        color: 'border-reward/50'
    },
    {
        id: 'mobile-dev',
        title: 'Mobile Developer',
        description: 'Create native iOS/Android apps with React Native',
        icon: Smartphone,
        skills: ['es-next', 'react-core', 'typescript', 'testing-quality', 'zustand', 'framer-motion', 'react-native', 'rest-api', 'authentication'],
        targetRole: 'Mobile App Developer',
        estimatedWeeks: 14,
        color: 'border-progress/45'
    },
    {
        id: 'security-specialist',
        title: 'Security Specialist',
        description: 'Protect applications and infrastructure from threats',
        icon: Shield,
        skills: ['http-fundamentals', 'rest-api', 'authentication', 'security', 'docker', 'kubernetes', 'ai-safety', 'observability'],
        targetRole: 'Security Engineer',
        estimatedWeeks: 16,
        color: 'border-decay/50'
    }
];

export function LearningPaths() {
    const { nodes } = useGameStore();
    
    const calculateProgress = (path: LearningPath) => {
        const completedSkills = path.skills.filter(skillId => {
            const node = nodes.find(n => n.id === skillId);
            return node?.data.status === 'mastered';
        });
        return Math.round((completedSkills.length / path.skills.length) * 100);
    };

    return (
        <div className="space-y-6">
            <div className="mb-8 text-center">
                <h2 className="font-display mb-2 text-3xl font-semibold text-foreground">Learning Paths</h2>
                <p className="text-text-muted">Choose a structured roadmap toward your target role.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {LEARNING_PATHS.map((path, idx) => {
                    const progress = calculateProgress(path);
                    const isStarted = progress > 0;
                    const isCompleted = progress === 100;

                    return (
                        <motion.div
                            key={path.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`panel-base cursor-pointer p-5 transition-transform hover:-translate-y-0.5 ${
                                isStarted ? path.color : 'border-white/12'
                            }`}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-white/12 bg-surface-1">
                                        <path.icon className="h-5 w-5 text-foreground" />
                                    </div>

                                    <div>
                                        <h3 className="font-display text-xl font-semibold text-foreground">{path.title}</h3>
                                        <p className="text-sm text-text-muted">{path.targetRole}</p>
                                    </div>
                                </div>
                                {isCompleted && (
                                    <CheckCircle2 className="text-reward" size={28} />
                                )}
                            </div>

                            <p className="mb-4 text-sm text-foreground/85">{path.description}</p>

                            <div className="mb-4 flex items-center justify-between gap-2 font-mono text-xs">
                                <div className="rounded-[8px] border border-white/12 bg-surface-1 px-3 py-1 text-foreground/90">
                                    {path.estimatedWeeks} weeks
                                </div>
                                <div className="rounded-[8px] border border-white/12 bg-surface-1 px-3 py-1 text-foreground/90">
                                    {path.skills.length} skills
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">Progress</span>
                                    <span className="font-mono text-sm font-bold text-foreground">{progress}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full bg-gradient-to-r from-signal to-mastery"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {path.skills.slice(0, 3).map(skillId => {
                                    const node = nodes.find(n => n.id === skillId);
                                    const status = node?.data.status;
                                    const isMastered = status === 'mastered';
                                    const isAvailable = status === 'available' || status === 'in-progress';

                                    return (
                                        <div
                                            key={skillId}
                                            className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-surface-1 px-3 py-2 text-sm text-foreground/90"
                                        >
                                            {isMastered ? (
                                                <CheckCircle2 className="text-mastery" size={16} />
                                            ) : isAvailable ? (
                                                <div className="h-4 w-4 rounded-full border-2 border-signal/70" />
                                            ) : (
                                                <Lock className="text-text-muted" size={16} />
                                            )}
                                            <span className={isMastered ? 'text-text-muted line-through' : ''}>{node?.data.title || skillId}</span>
                                        </div>
                                    );
                                })}
                                {path.skills.length > 3 && (
                                    <p className="text-center font-mono text-xs text-text-muted">+ {path.skills.length - 3} more skills</p>
                                )}
                            </div>

                            <button type="button" className="btn-ghost mt-4 flex w-full items-center justify-center font-semibold">
                                {isCompleted ? 'Completed' : isStarted ? 'Continue path' : 'Start journey'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
