'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Sparkles, Code, Server, Layers } from 'lucide-react';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';

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
    const closeModal = () => setIsOpen(false);
    const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, closeModal);

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
            closeModal();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 12 }}
                        animate={{ scale: 1, y: 0 }}
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="onboarding-title"
                        aria-describedby="onboarding-description"
                        tabIndex={-1}
                        className="modal-shell relative w-full max-w-4xl overflow-hidden p-5 md:p-8"
                    >
                        {/* Background Gradient */}
                        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-neon-cyan/85 via-neon-cyan/20 to-plasma-pink/85" />

                        <div className="text-center mb-8">
                            <h2 id="onboarding-title" className="text-3xl font-semibold text-white md:text-[40px] md:leading-[44px]">
                                Welcome to the AI Stack
                            </h2>
                            <p id="onboarding-description" className="mt-2 text-base text-text-muted md:text-lg">
                                Choose your current experience level to jumpstart your skill tree.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleSelect(role.id)}
                                    className="panel-base group relative flex items-start gap-4 p-5 text-left hover:border-neon-cyan/45"
                                >
                                    <div className="grid h-11 w-11 place-items-center rounded-[12px] border border-neon-cyan/25 bg-neon-cyan/10 text-neon-cyan transition-colors group-hover:border-neon-cyan/55">
                                        <role.icon size={22} />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-xl font-semibold text-white">
                                            {role.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-text-muted">
                                            {role.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-sm text-text-muted hover:text-white"
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
