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
        color: 'border-neon-cyan/55'
    },
    {
        id: 'fullstack-dev',
        title: 'Full-Stack Developer',
        description: 'Build complete web applications from frontend to backend',
        icon: Layers,
        skills: ['web-standards', 'es-next', 'react-core', 'typescript', 'node-runtime', 'postgresql', 'rest-api', 'authentication', 'docker', 'nextjs-app', 'cloud-platforms'],
        targetRole: 'Full-Stack Engineer',
        estimatedWeeks: 24,
        color: 'border-plasma-pink/55'
    },
    {
        id: 'ai-engineer',
        title: 'AI Engineer',
        description: 'Build intelligent systems with LLMs, RAG, and autonomous agents',
        icon: Brain,
        skills: ['python-core', 'postgresql', 'vector-db', 'llm-integration', 'prompt-eng', 'embeddings', 'rag-arch', 'evals', 'ai-agents', 'mlops'],
        targetRole: 'AI/ML Engineer',
        estimatedWeeks: 20,
        color: 'border-electric-green/55'
    },
    {
        id: 'devops-sre',
        title: 'DevOps & SRE',
        description: 'Deploy, scale, and monitor production systems',
        icon: Rocket,
        skills: ['git-ops', 'node-runtime', 'docker', 'kubernetes', 'cicd', 'cloud-platforms', 'security', 'observability', 'microservices'],
        targetRole: 'DevOps Engineer / SRE',
        estimatedWeeks: 18,
        color: 'border-warning-amber/55'
    },
    {
        id: 'mobile-dev',
        title: 'Mobile Developer',
        description: 'Create native iOS/Android apps with React Native',
        icon: Smartphone,
        skills: ['es-next', 'react-core', 'typescript', 'testing-quality', 'zustand', 'framer-motion', 'react-native', 'rest-api', 'authentication'],
        targetRole: 'Mobile App Developer',
        estimatedWeeks: 14,
        color: 'border-indigo-400/55'
    },
    {
        id: 'security-specialist',
        title: 'Security Specialist',
        description: 'Protect applications and infrastructure from threats',
        icon: Shield,
        skills: ['http-fundamentals', 'rest-api', 'authentication', 'security', 'docker', 'kubernetes', 'ai-safety', 'observability'],
        targetRole: 'Security Engineer',
        estimatedWeeks: 16,
        color: 'border-alert-red/55'
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
            <div className="text-center mb-8">
                <h2 className="mb-2 text-3xl font-semibold text-white">Learning Paths</h2>
                <p className="text-text-muted">Choose your journey and follow a structured roadmap to your dream role</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LEARNING_PATHS.map((path, idx) => {
                    const progress = calculateProgress(path);
                    const isStarted = progress > 0;
                    const isCompleted = progress === 100;

                    return (
                        <motion.div
                            key={path.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`panel-base cursor-pointer p-5 transition-transform hover:-translate-y-0.5 ${
                                isStarted ? path.color : 'border-white/20'
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/20 bg-black/20">
                                        <path.icon className="h-5 w-5 text-white" />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{path.title}</h3>
                                        <p className="text-sm text-text-muted">{path.targetRole}</p>
                                    </div>
                                </div>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' }}
                                    >
                                        <CheckCircle2 className="text-yellow-300" size={28} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="mb-4 text-sm text-gray-200">{path.description}</p>

                            {/* Stats */}
                            <div className="flex items-center justify-between mb-4 text-sm">
                                <div className="rounded-full border border-white/20 bg-black/20 px-3 py-1">
                                    <span className="text-gray-100">{path.estimatedWeeks} weeks</span>
                                </div>
                                <div className="rounded-full border border-white/20 bg-black/20 px-3 py-1">
                                    <span className="text-gray-100">{path.skills.length} skills</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-white">Progress</span>
                                    <span className="text-sm font-bold text-white">{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-black/35">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-gradient-to-r from-neon-cyan to-plasma-pink"
                                    />
                                </div>
                            </div>

                            {/* Skills Preview */}
                            <div className="space-y-2">
                                {path.skills.slice(0, 3).map(skillId => {
                                    const node = nodes.find(n => n.id === skillId);
                                    const status = node?.data.status;
                                    const isMastered = status === 'mastered';
                                    const isAvailable = status === 'available' || status === 'in-progress';

                                    return (
                                        <div
                                            key={skillId}
                                            className="flex items-center gap-2 rounded-[10px] border border-white/15 bg-black/20 px-3 py-2 text-sm text-gray-100"
                                        >
                                            {isMastered ? (
                                                <CheckCircle2 className="text-electric-green" size={16} />
                                            ) : isAvailable ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-white/60" />
                                            ) : (
                                                <Lock className="text-gray-400" size={16} />
                                            )}
                                            <span className={isMastered ? 'line-through' : ''}>{node?.data.title || skillId}</span>
                                        </div>
                                    );
                                })}
                                {path.skills.length > 3 && (
                                    <p className="text-center text-xs text-text-muted">+ {path.skills.length - 3} more skills</p>
                                )}
                            </div>

                            {/* CTA */}
                            <button className="btn-ghost mt-4 flex w-full items-center justify-center font-semibold">
                                {isCompleted ? 'Completed' : isStarted ? 'Continue Path' : 'Start Journey'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
