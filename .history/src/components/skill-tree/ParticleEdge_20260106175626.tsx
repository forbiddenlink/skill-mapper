import React, { memo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

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
    data
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Only show particles if the edge is "active" (optional param via data)
    // or purely decorative for all edges. 
    // We'll use a gradient and a moving circle.

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {/* Moving Particle */}
            <circle r="3" fill="#00f3ff">
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </circle>

            {/* Optional: Second slower particle for trail effect */}
            <circle r="2" fill="#00f3ff" opacity="0.5">
                <animateMotion dur="2s" begin="0.1s" repeatCount="indefinite" path={edgePath} />
            </circle>
        </>
    );
}

export default memo(ParticleEdge);
