import { memo, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lock, ShieldCheck, Zap, BookOpen, TriangleAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SkillData } from '@/lib/skill-data';

type ConstellationNodeData = SkillData & {
    /** Pushed to the background because another node's path is focused. */
    dimmed?: boolean;
    /** This node is the hovered one, or a direct neighbor of it. */
    focused?: boolean;
};

const CustomNode = ({ data, selected }: NodeProps<ConstellationNodeData>) => {
    const { status, title, tier, dimmed = false, focused = false } = data;
    const ref = useRef<HTMLDivElement>(null);

    const isLocked = status === 'locked';
    const isAvailable = status === 'available';
    const isMastered = status === 'mastered';
    const isDecayed = status === 'decayed';
    const isInProgress = status === 'in-progress';

    // Subtle tilt — presence, not carnival
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 420, damping: 36 });
    const mouseY = useSpring(y, { stiffness: 420, damping: 36 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-6deg", "6deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || isLocked) return;
        const rect = ref.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                opacity: dimmed ? 0.28 : 1,
                scale: focused && !selected ? 1.04 : 1,
                filter: dimmed ? "saturate(0.55)" : "saturate(1)",
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
                rotateX: isLocked ? 0 : rotateX,
                rotateY: isLocked ? 0 : rotateY,
                transformStyle: "preserve-3d",
            }}
            className={clsx(
                "group relative flex h-[92px] w-44 items-center justify-center overflow-visible rounded-[10px] border p-2 transition-colors duration-200",
                isLocked && "border-white/10 bg-surface-1 text-text-muted",
                isAvailable && "cursor-pointer border-signal/50 bg-surface-2 shadow-[0_6px_16px_rgba(0,0,0,0.28)]",
                isInProgress && "cursor-pointer border-progress/55 bg-progress/10 text-foreground",
                isMastered && "border-mastery/55 bg-mastery/10 text-foreground shadow-[0_6px_16px_rgba(0,0,0,0.28)]",
                isDecayed && "border-decay/65 bg-decay/10 text-foreground/80 shadow-[0_6px_16px_rgba(0,0,0,0.28)]",
                focused && !selected && "border-signal/80 shadow-[0_0_22px_-2px_color-mix(in_oklab,var(--signal)_60%,transparent)]",
                selected && "ring-2 ring-signal ring-offset-2 ring-offset-canvas"
            )}
        >
            {/* Constellation halo — a soft pulse marking an unlocked, ready-to-learn skill */}
            {isAvailable && !dimmed && (
                <span
                    aria-hidden
                    className="constellation-halo pointer-events-none absolute inset-0 -z-10 rounded-[10px]"
                />
            )}
            {isDecayed && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 rounded-[10px] opacity-25"
                    style={{
                        background:
                            "repeating-linear-gradient(45deg, color-mix(in oklab, var(--decay) 50%, transparent) 0 8px, transparent 8px 16px)",
                    }}
                />
            )}

            <Handle
                type="target"
                position={Position.Top}
                className={clsx(
                    "!h-2.5 !w-2.5 !border-0",
                    isLocked ? "!bg-text-muted" : "!bg-signal"
                )}
            />

            <div className="z-10 flex translate-z-10 transform-style-3d flex-col items-center gap-1 text-center">
                <div className="mb-0.5">
                    {isLocked && <Lock className="h-5 w-5 opacity-70" />}
                    {isAvailable && <Zap className="h-5 w-5 text-signal" />}
                    {isMastered && <ShieldCheck className="h-6 w-6 text-mastery" />}
                    {isInProgress && <BookOpen className="h-5 w-5 text-progress" />}
                    {isDecayed && <TriangleAlert className="h-5 w-5 text-decay" />}
                </div>

                <h3
                    className={clsx(
                        "font-display line-clamp-2 translate-z-20 px-1 text-xs font-semibold tracking-wide",
                        isLocked ? "text-text-muted" : "text-foreground"
                    )}
                >
                    {title}
                </h3>

                <span
                    className={clsx(
                        "rounded-[6px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                        isLocked ? "bg-surface-3 text-text-muted" : "bg-canvas/40 text-text-muted"
                    )}
                >
                    {tier}
                </span>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={clsx(
                    "!h-2.5 !w-2.5 !border-0",
                    isMastered ? "!bg-mastery" : isLocked ? "!bg-text-muted" : "!bg-signal"
                )}
            />

            {!isLocked && (
                <div className="pointer-events-none absolute -bottom-8 z-30 translate-z-30 whitespace-nowrap rounded-[6px] border border-signal/30 bg-canvas/90 px-2 py-1 font-mono text-[10px] text-signal opacity-0 transition-opacity group-hover:opacity-100">
                    View details
                </div>
            )}
        </motion.div>
    );
};

export default memo(CustomNode, (prevProps, nextProps) => {
    return (
        prevProps.data.status === nextProps.data.status &&
        prevProps.data.title === nextProps.data.title &&
        prevProps.data.tier === nextProps.data.tier &&
        prevProps.data.dimmed === nextProps.data.dimmed &&
        prevProps.data.focused === nextProps.data.focused &&
        prevProps.selected === nextProps.selected
    );
});
