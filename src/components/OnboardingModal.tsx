'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/lib/store';
import { Sparkles, Code, Server, Layers } from 'lucide-react';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import { useHasHydrated } from '@/hooks/use-has-hydrated';
import { OriginMap, SKILL_COUNT, countMastered } from '@/components/onboarding/OriginMap';

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
        unlocks: ['web-standards', 'git-ops', 'es-next', 'react-core', 'tailwind', 'typescript', 'accessibility', 'testing-quality', 'async-state']
    },
    {
        id: 'backend',
        title: 'Backend Engineer',
        icon: Server,
        description: 'Comfortable with Node.js, Databases, and APIs.',
        unlocks: ['web-standards', 'git-ops', 'es-next', 'http-fundamentals', 'node-runtime', 'postgresql', 'drizzle-orm', 'redis-caching', 'rest-api']
    },
    {
        id: 'fullstack',
        title: 'Full Stack Dev',
        icon: Layers,
        description: 'I do it all. Frontend, Backend, and everything in between.',
        unlocks: [
            'web-standards', 'git-ops', 'es-next', 'http-fundamentals',
            'react-core', 'tailwind', 'typescript', 'accessibility', 'testing-quality', 'async-state', 'state-machines',
            'node-runtime', 'postgresql', 'drizzle-orm', 'redis-caching', 'rest-api'
        ]
    }
];

export default function OnboardingModal() {
    const unlockBatch = useGameStore((s) => s.unlockBatch);
    const hasOnboarded = useGameStore((s) => s.hasOnboarded);
    const completeOnboarding = useGameStore((s) => s.completeOnboarding);
    const hydrated = useHasHydrated();
    const [isOpen, setIsOpen] = useState(false);
    const [previewId, setPreviewId] = useState('frontend');
    // The dialog focuses its first button on open; that must not replace the resting preview.
    const hasInteracted = useRef(false);
    const previewRole = (id: string) => {
        if (hasInteracted.current) setPreviewId(id);
    };
    // Closing by any route (role pick, Escape, close button) counts as onboarded,
    // so the picker does not come back on the next visit.
    const closeModal = useCallback(() => {
        setIsOpen(false);
        completeOnboarding();
    }, [completeOnboarding]);
    const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, closeModal);

    // Wait for the saved state: before hydration every visitor looks brand new.
    useEffect(() => {
        if (!hydrated || hasOnboarded) return;
        const timer = setTimeout(() => setIsOpen(true), 100);
        return () => clearTimeout(timer);
    }, [hydrated, hasOnboarded]);

    const handleSelect = (roleId: string) => {
        const role = ROLES.find(r => r.id === roleId);
        if (role) {
            if (role.unlocks.length > 0) {
                unlockBatch(role.unlocks);
            }
            closeModal();
        }
    };

    const preview = ROLES.find((r) => r.id === previewId) ?? ROLES[0]!;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-canvas/85 p-3 backdrop-blur-sm md:p-6"
                >
                    <motion.div
                        initial={{ y: 12 }}
                        animate={{ y: 0 }}
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="onboarding-title"
                        aria-describedby="onboarding-description"
                        tabIndex={-1}
                        onKeyDown={() => { hasInteracted.current = true; }}
                        className="modal-shell relative my-auto w-full max-w-6xl overflow-hidden p-5 md:p-8"
                    >
                        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 id="onboarding-title" className="font-display text-4xl font-semibold text-foreground md:text-6xl md:leading-[1]">
                                    Skill Mapper
                                </h2>
                                <p id="onboarding-description" className="mt-3 max-w-xl text-base text-text-muted md:text-lg">
                                    Pick a starting role. We’ll unlock matching skills so your first session has a clear next node.
                                </p>
                            </div>
                            <p
                                className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted md:text-right"
                                aria-live="polite"
                            >
                                <span className="block text-foreground">{preview.title}</span>
                                {countMastered(preview.unlocks)} of {SKILL_COUNT} skills start mastered
                            </p>
                        </header>

                        {/* DOM order keeps the first focus on a role button; the map sits above visually. */}
                        <div className="flex flex-col">
                        <div className="order-2 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {ROLES.map((role, i) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleSelect(role.id)}
                                    onMouseEnter={() => { hasInteracted.current = true; setPreviewId(role.id); }}
                                    onFocus={() => previewRole(role.id)}
                                    className={`panel-base group relative flex flex-col gap-2 p-4 text-left hover:border-signal/60 ${
                                        previewId === role.id ? 'border-signal/70' : ''
                                    }`}
                                >
                                    <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                                        <span>{`0${i + 1}`}</span>
                                        <role.icon size={18} className="text-signal" aria-hidden />
                                    </span>
                                    <h3 className="font-display text-xl font-semibold text-foreground">
                                        {role.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-text-muted">
                                        {role.description}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <div className="order-1 mt-6 rounded-[10px] border border-border-muted bg-canvas/60 px-3 pb-3 pt-2 md:px-5">
                            <div
                                role="region"
                                aria-label="Skill graph preview"
                                tabIndex={0}
                                className="overflow-x-auto rounded-[6px]"
                            >
                                <OriginMap unlocks={preview.unlocks} />
                            </div>
                            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                                <span className="inline-flex items-center gap-2"><i aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-mastery" />Mastered</span>
                                <span className="inline-flex items-center gap-2"><i aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border-2 border-signal" />Ready to learn</span>
                                <span className="inline-flex items-center gap-2"><i aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border border-slate-700" />Locked</span>
                            </p>
                        </div>

                        </div>

                        <div className="mt-5 text-center">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-sm text-text-muted hover:text-foreground"
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
