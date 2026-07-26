import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

/**
 * Premium "energy" edge for the skill tree.
 *
 * Replaces the old two-bouncing-dots look (which read generic) with the
 * technique from the redesign research:
 *   - a soft bloom (blurred duplicate path behind the crisp stroke)
 *   - a violet -> tree-energy gradient stroke
 *   - a flowing dash animation (calm, not bouncy)
 *   - a single faint travelling spark
 *
 * `data.active` (set when the source skill is mastered/available) lights the
 * edge up; inert edges stay dim so the lit paths read like an allocated route
 * through the tree (Path-of-Exile model). Motion is dropped under
 * prefers-reduced-motion via the global CSS override.
 */
function ParticleEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps<{ active?: boolean }>) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const active = data?.active ?? false;
    const gradId = `edge-grad-${id}`;
    const blurId = `edge-blur-${id}`;

    return (
        <>
            <defs>
                <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                    x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
                    <stop offset="0%" stopColor="var(--neon-cyan)" />
                    <stop offset="100%" stopColor="var(--tree-energy)" />
                </linearGradient>
                <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3.2" />
                </filter>
            </defs>

            {/* Bloom — blurred duplicate behind the crisp stroke */}
            {active && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth={6}
                    strokeLinecap="round"
                    opacity={0.35}
                    filter={`url(#${blurId})`}
                />
            )}

            {/* Base track (always visible, dim when inert) */}
            <path
                d={edgePath}
                fill="none"
                stroke={active ? `url(#${gradId})` : 'rgba(148,163,184,0.28)'}
                strokeWidth={active ? 1.8 : 1.2}
                strokeLinecap="round"
            />

            {/* Flowing dash overlay — the "energy travelling" feel */}
            {active && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke="var(--tree-energy)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeDasharray="4 12"
                    opacity={0.9}
                    className="sm-edge-flow"
                />
            )}

            {/* Single faint travelling spark */}
            {active && (
                <circle r="2.2" fill="var(--tree-energy)" className="sm-edge-spark">
                    <animateMotion dur="2.6s" repeatCount="indefinite" path={edgePath} />
                </circle>
            )}
        </>
    );
}

export default memo(ParticleEdge);
