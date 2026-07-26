import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lock, ShieldCheck, Zap, BookOpen, TriangleAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SkillData } from '@/lib/skill-data';

const CustomNode = ({ data, selected }: NodeProps<SkillData>) => {
    const { status, title, tier } = data;
    const ref = useRef<HTMLDivElement>(null);

    // Squash-and-stretch pop when a node becomes freshly unlocked / mastered.
    const prevStatus = useRef(status);
    const [popping, setPopping] = useState(false);
    useEffect(() => {
        const changed = prevStatus.current !== status;
        prevStatus.current = status;
        if (changed && (status === 'available' || status === 'in-progress' || status === 'mastered')) {
            setPopping(true);
            const t = setTimeout(() => setPopping(false), 480);
            return () => clearTimeout(t);
        }
        return undefined;
    }, [status]);

    const isLocked = status === 'locked';
    const isAvailable = status === 'available';
    const isMastered = status === 'mastered';
    const isDecayed = status === 'decayed';

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    // Glare position (moves opposite)
    const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    // Glare opacity - must be called unconditionally (React hooks rule)
    const glareOpacity = useTransform(mouseX, [-0.5, 0.5], [0, 1]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || isLocked) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className={clsx('relative', popping && 'sm-node-pop')}>
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: isLocked ? 0 : rotateX,
                rotateY: isLocked ? 0 : rotateY,
                transformStyle: "preserve-3d",
            }}
            className={clsx(
                "perspective-1000 group relative flex h-[92px] w-44 items-center justify-center overflow-visible rounded-[12px] border p-2 backdrop-blur-md transition-colors duration-200",
                // Status Styles
                isLocked && "border-white/10 bg-surface-1/70 text-text-faint opacity-70 saturate-50",
                isAvailable && "cursor-pointer border-neon-cyan/60 bg-surface-2/85 shadow-[0_0_0_1px_rgba(139,124,255,0.2),0_10px_28px_-12px_rgba(139,124,255,0.55)]",
                isMastered && "border-neon-cyan/70 bg-gradient-to-b from-neon-cyan/15 to-plasma-pink/10 text-white shadow-[0_0_0_1px_rgba(139,124,255,0.35),0_14px_34px_-14px_rgba(139,124,255,0.7)]",
                isDecayed && "border-alert-red/70 bg-alert-red/10 text-gray-300 shadow-[0_10px_28px_-14px_rgba(244,98,111,0.6)]",
                // Selection
                selected && "ring-2 ring-neon-cyan ring-offset-2 ring-offset-deep-void"
            )}
        >
            {/* Glare Effect */}
            {!isLocked && (
                <motion.div
                    style={{
                        background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                        opacity: glareOpacity
                    }}
                    className="pointer-events-none absolute inset-0 z-20 rounded-[12px] mix-blend-overlay"
                />
            )}

            {/* Decayed Texture */}
            {isDecayed && (
                <div className="pointer-events-none absolute inset-0 z-0 rounded-[12px] bg-[repeating-linear-gradient(45deg,_#ff000040_0px,_#ff000040_10px,_transparent_10px,_transparent_20px)] opacity-30" />
            )}

            {/* Input Handle (Top) */}
            <Handle
                type="target"
                position={Position.Top}
                className={clsx(
                    "!w-3 !h-3 !bg-gray-500",
                    !isLocked && "!bg-neon-cyan"
                )}
            />

            <div className="flex flex-col items-center text-center gap-1 z-10 transform-style-3d translate-z-10">
                <div className="mb-1">
                    {isLocked && <Lock className="w-5 h-5" />}
                    {isAvailable && <Zap className="h-5 w-5 text-neon-cyan" />}
                    {isMastered && <ShieldCheck className="w-6 h-6 text-plasma-pink" />}
                    {status === 'in-progress' && <BookOpen className="w-5 h-5 text-electric-green" />}
                    {isDecayed && <TriangleAlert className="h-5 w-5 text-alert-red" />}
                </div>

                <h3 className={clsx(
                    "line-clamp-2 translate-z-20 px-1 text-xs font-medium tracking-wide",
                    isLocked ? "text-gray-400" : "text-gray-100"
                )}>
                    {title}
                </h3>

                <span className={clsx(
                    "rounded-[8px] px-2 py-0.5 font-mono text-[10px] uppercase",
                    isLocked ? "bg-gray-800 text-gray-400" : "bg-black/20 text-text-muted"
                )}>
                    {tier}
                </span>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className={clsx(
                    "!w-3 !h-3 !bg-gray-500",
                    isMastered && "!bg-plasma-pink"
                )}
            />

            {/* Hover Information */}
            {!isLocked && (
                <div className="pointer-events-none absolute -bottom-8 z-30 whitespace-nowrap rounded-[8px] border border-neon-cyan/35 bg-black/75 px-2 py-1 text-[10px] text-neon-cyan opacity-0 transition-opacity translate-z-30 group-hover:opacity-100">
                    Click to View Details
                </div>
            )}
        </motion.div>
        </div>
    );
};

// Custom comparison to prevent unnecessary re-renders
// Only re-render when status, title, tier, or selection changes
export default memo(CustomNode, (prevProps, nextProps) => {
    return (
        prevProps.data.status === nextProps.data.status &&
        prevProps.data.title === nextProps.data.title &&
        prevProps.data.tier === nextProps.data.tier &&
        prevProps.selected === nextProps.selected
    );
});
