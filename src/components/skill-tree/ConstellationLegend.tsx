'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { SkillCategory, SkillStatus } from '@/lib/skill-data';

const STATUS_KEY: { status: SkillStatus; label: string; color: string }[] = [
    { status: 'mastered', label: 'Mastered', color: 'var(--mastery)' },
    { status: 'in-progress', label: 'In progress', color: 'var(--progress)' },
    { status: 'available', label: 'Available', color: 'var(--signal)' },
    { status: 'decayed', label: 'Needs review', color: 'var(--decay)' },
    { status: 'locked', label: 'Locked', color: 'var(--slate-700)' },
];

export const CATEGORY_META: Record<SkillCategory, { label: string; color: string }> = {
    frontend: { label: 'Frontend', color: 'oklch(0.76 0.13 200)' },
    backend: { label: 'Backend', color: 'oklch(0.72 0.14 285)' },
    devops: { label: 'DevOps', color: 'oklch(0.78 0.14 60)' },
    cs: { label: 'CS', color: 'oklch(0.72 0.14 330)' },
    ml: { label: 'ML', color: 'oklch(0.75 0.15 150)' },
    data: { label: 'Data', color: 'oklch(0.77 0.13 100)' },
};

const CATEGORIES = Object.keys(CATEGORY_META) as SkillCategory[];

interface ConstellationLegendProps {
    activeCategories: Set<SkillCategory>;
    onToggleCategory: (category: SkillCategory) => void;
    onClear: () => void;
}

/**
 * Star-chart legend + track filter for the skill constellation.
 * Top section decodes the node colours (status); bottom section filters the
 * map by learning track, dimming everything outside the selected tracks.
 */
function ConstellationLegend({ activeCategories, onToggleCategory, onClear }: ConstellationLegendProps) {
    const hasFilter = activeCategories.size > 0;

    return (
        <motion.aside
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Constellation legend and track filter"
            className="pointer-events-auto absolute right-4 top-4 z-30 hidden w-[220px] flex-col gap-3 rounded-[12px] border border-white/12 bg-surface-1/85 p-3 backdrop-blur-md md:flex md:right-6 md:top-6"
        >
            <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Skill status
                </span>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    {STATUS_KEY.map(({ status, label, color }) => (
                        <li key={status} className="flex items-center gap-1.5 text-[11px] text-foreground/85">
                            <span
                                aria-hidden
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px -1px ${color}` }}
                            />
                            {label}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="h-px w-full bg-white/10" />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                        Filter by track
                    </span>
                    {hasFilter && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="font-mono text-[10px] uppercase tracking-wider text-signal transition-opacity hover:opacity-80"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((category) => {
                        const { label, color } = CATEGORY_META[category];
                        const isActive = activeCategories.has(category);
                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => onToggleCategory(category)}
                                aria-pressed={isActive}
                                className={clsx(
                                    'flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors',
                                    isActive
                                        ? 'border-transparent text-canvas'
                                        : 'border-white/12 bg-surface-2 text-foreground/80 hover:border-white/25'
                                )}
                                style={isActive ? { backgroundColor: color } : undefined}
                            >
                                <span
                                    aria-hidden
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: isActive ? 'var(--canvas)' : color,
                                        boxShadow: isActive ? undefined : `0 0 6px -1px ${color}`,
                                    }}
                                />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.aside>
    );
}

export default memo(ConstellationLegend);
