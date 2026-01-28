'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Sparkles, Code, Server, Layers } from 'lucide-react';

// type Role = 'beginner' | 'frontend' | 'backend' | 'fullstack'; // Removed unused type

const ROLES = [
    {
        id: 'beginner',
        title: 'Total Beginner',
        icon: Sparkles,
        description: 'Just starting my journey. I want to learn the basics.',
        unlocks: [] // Unlocks nothing (except default start)
    },
    {
        id: 'frontend',
        title: 'Frontend Specialist',
        icon: Code,
        description: 'I know React, CSS, and basic Web Standards.',
        unlocks: ['web-standards', 'git-ops', 'es-next', 'react-core', 'tailwind', 'typescript', 'testing-quality', 'async-state']
    },
    {
        id: 'backend',
        title: 'Backend Engineer',
        icon: Server,
        description: 'Comfortable with Node.js, Databases, and APIs.',
        unlocks: ['web-standards', 'git-ops', 'es-next', 'node-runtime', 'postgresql', 'drizzle-orm', 'vector-db']
    },
    {
        id: 'fullstack',
        title: 'Full Stack Dev',
        icon: Layers,
        description: 'I do it all. Frontend, Backend, and everything in between.',
        unlocks: [
            // Tier 1
            'web-standards', 'git-ops', 'es-next',
            // Tier 2
            'react-core', 'tailwind', 'typescript', 'testing-quality', 'async-state', 'state-machines',
            // Tier 3
            'node-runtime', 'postgresql', 'drizzle-orm', 'vector-db'
        ]
    }
];

export default function OnboardingModal() {
    const { unlockBatch, nodes } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Run only once on mount -> check if we are "new"
        // We defer to the store state. If 0 progress, show modal.
        // We use a timeout to avoid immediate flash or strict mode double-invoke issues
        const timer = setTimeout(() => {
            const masteredCount = nodes.filter(n => n.data.status === 'mastered').length;
            if (masteredCount === 0) {
                setIsOpen(true);
            }
        }, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONCE on mount using empty dependency array

    const handleSelect = (roleId: string) => {
        const role = ROLES.find(r => r.id === roleId);
        if (role) {
            if (role.unlocks.length > 0) {
                unlockBatch(role.unlocks);
            }
            setIsOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Welcome to the AI Stack
                            </h2>
                            <p className="text-gray-400 mt-2 text-lg">
                                Choose your current experience level to jumpstart your skill tree.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleSelect(role.id)}
                                    className="group relative p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left flex gap-4 items-start"
                                >
                                    <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 transition-colors">
                                        <role.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-blue-300 transition-colors">
                                            {role.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {role.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Skip and start from scratch
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
