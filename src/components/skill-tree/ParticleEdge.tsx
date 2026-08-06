import { memo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { useReducedMotion } from 'framer-motion';

export interface ConstellationEdgeData {
    /** Link is "live": a mastered prerequisite feeding an unlocked skill. */
    active?: boolean;
    /** Link sits on the currently hovered/focused path. */
    highlighted?: boolean;
    /** Link is pushed to the background (something else is focused). */
    dimmed?: boolean;
    /** Stroke colour resolved from endpoint status. */
    color?: string;
}

/**
 * Constellation link between two skills.
 *
 * Reads like a star chart: each link is tinted by the flow it carries,
 * carries a soft outer glow, and only "live" links (a mastered prerequisite
 * feeding an unlocked skill) stream a light particle along the path. The
 * particle is SMIL (`animateMotion`) which CSS reduced-motion rules cannot
 * stop, so it is gated here in JS via `useReducedMotion`.
 */
function ParticleEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps<ConstellationEdgeData>) {
    const prefersReducedMotion = useReducedMotion();

    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const color = data?.color ?? 'var(--signal)';
    const highlighted = data?.highlighted ?? false;
    const dimmed = data?.dimmed ?? false;
    const active = data?.active ?? false;

    const baseWidth = highlighted ? 2.4 : 1.6;
    const opacity = dimmed ? 0.12 : highlighted ? 1 : active ? 0.85 : 0.5;
    const showParticles = active && !prefersReducedMotion && !dimmed;

    const mergedStyle: React.CSSProperties = {
        ...style,
        stroke: color,
        strokeWidth: baseWidth,
        opacity,
        transition: 'opacity 200ms ease, stroke-width 200ms ease',
    };

    return (
        <>
            {/* Soft outer glow — only when the link is live or focused */}
            {(highlighted || active) && !dimmed && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={highlighted ? 7 : 5}
                    strokeLinecap="round"
                    opacity={highlighted ? 0.28 : 0.16}
                    style={{ filter: 'blur(3px)' }}
                />
            )}

            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={mergedStyle} />

            {showParticles && (
                <>
                    <circle r={highlighted ? 3.2 : 2.6} fill={color} opacity={0.95}>
                        <animateMotion dur="2.4s" repeatCount="indefinite" path={edgePath} />
                    </circle>
                    <circle r={1.8} fill={color} opacity={0.45}>
                        <animateMotion dur="2.4s" begin="0.25s" repeatCount="indefinite" path={edgePath} />
                    </circle>
                </>
            )}
        </>
    );
}

export default memo(ParticleEdge);
