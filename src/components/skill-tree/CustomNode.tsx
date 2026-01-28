import { memo, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Lock, ShieldCheck, Zap, BookOpen, TriangleAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SkillData } from '@/lib/skill-data';

const CustomNode = ({ data, selected }: NodeProps<SkillData>) => {
    const { status, title, tier } = data;
    const ref = useRef<HTMLDivElement>(null);

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
                "relative w-48 h-24 rounded-lg border-2 transition-colors duration-300 backdrop-blur-md flex items-center justify-center p-2 group overflow-visible perspective-1000",
                // Status Styles
                isLocked && "border-gray-800 bg-gray-900/50 text-gray-500",
                isAvailable && "border-neon-cyan bg-deep-void/80 shadow-[0_0_10px_var(--neon-cyan)] cursor-pointer",
                isMastered && "border-plasma-pink bg-plasma-pink/10 shadow-[0_0_15px_var(--plasma-pink)] text-white",
                isDecayed && "border-alert-red bg-alert-red/10 shadow-[0_0_15px_var(--alert-red)] text-gray-300",
                // Selection
                selected && "ring-2 ring-white ring-offset-2 ring-offset-black"
            )}
        >
            {/* Glare Effect */}
            {!isLocked && (
                <motion.div
                    style={{
                        background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                        opacity: useTransform(mouseX, [-0.5, 0.5], [0, 1]) // Fade in when moving
                    }}
                    className="absolute inset-0 rounded-lg pointer-events-none z-20 mix-blend-overlay"
                />
            )}

            {/* Decayed Texture */}
            {isDecayed && (
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[repeating-linear-gradient(45deg,_#ff000040_0px,_#ff000040_10px,_transparent_10px,_transparent_20px)] rounded-lg" />
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
                    {isAvailable && <Zap className="w-6 h-6 text-neon-cyan animate-bounce" />}
                    {isMastered && <ShieldCheck className="w-6 h-6 text-plasma-pink" />}
                    {status === 'in-progress' && <BookOpen className="w-5 h-5 text-electric-green" />}
                    {isDecayed && <TriangleAlert className="w-6 h-6 text-alert-red animate-pulse" />}
                </div>

                <h3 className={clsx(
                    "font-display text-xs uppercase tracking-wider translate-z-20", // Extra pop for text
                    isLocked ? "text-gray-600" : "text-gray-100"
                )}>
                    {title}
                </h3>

                <span className={clsx(
                    "text-[10px] uppercase font-mono px-2 py-0.5 rounded",
                    isLocked ? "bg-gray-800 text-gray-600" : "bg-white/10"
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
                <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-neon-cyan bg-black/80 px-2 py-1 rounded border border-neon-cyan/30 whitespace-nowrap pointer-events-none z-30 transform translate-z-30">
                    Click to View Details
                </div>
            )}
        </motion.div>
    );
};

export default memo(CustomNode);
