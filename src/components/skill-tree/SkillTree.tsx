// This directive ensures it runs only on the client-side as React Flow uses window/document
'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    Node
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import CustomNode from './CustomNode';
import ParticleEdge from './ParticleEdge';
import { SkillNode } from '@/lib/skill-data';
import { useShallow } from 'zustand/react/shallow';

const nodeTypes: NodeTypes = {
    skill: CustomNode,
};

const edgeTypes: EdgeTypes = {
    particle: ParticleEdge,
};

export default function SkillTreeCanvas() {
    // Optimized selectors with useShallow for stable references
    const { nodes, edges, selectedSkillId } = useGameStore(
        useShallow((state) => ({
            nodes: state.nodes as SkillNode[],
            edges: state.edges,
            selectedSkillId: state.selectedSkillId
        }))
    );
    const onNodesChange = useGameStore((state) => state.onNodesChange);
    const onEdgesChange = useGameStore((state) => state.onEdgesChange);
    const selectSkill = useGameStore((state) => state.selectSkill);
    const { playClick } = useGameSounds();

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        playClick();
        selectSkill(node.id);
    }, [selectSkill, playClick]);

    // Keyboard Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Provide escape to deselect
            if (e.key === 'Escape') {
                selectSkill(null);
                return;
            }

            if (!selectedSkillId) return;

            const currentNode = nodes.find(n => n.id === selectedSkillId);
            if (!currentNode) return;

            let targetNode: Node | null = null;
            let minDistance = Infinity;

            const currentPos = currentNode.position;

            // Simple navigation heuristics
            nodes.forEach(node => {
                if (node.id === selectedSkillId) return;

                const dx = node.position.x - currentPos.x;
                const dy = node.position.y - currentPos.y;
                let isCandidate = false;

                switch (e.key) {
                    case 'ArrowRight':
                        // Look for nodes to the right (dx > 0) and roughly same Y level
                        if (dx > 0 && Math.abs(dy) < 150) isCandidate = true;
                        break;
                    case 'ArrowLeft':
                        if (dx < 0 && Math.abs(dy) < 150) isCandidate = true;
                        break;
                    case 'ArrowUp':
                        // Look for nodes above (dy < 0 since Y grows down... wait, Y grows UP in our layout? 
                        // In ReactFlow Y positive is down. In our layout `y: 600 + (level * -180)`, so higher tiers have smaller/negative Y.
                        // So UP key means SMALLER Y (dx roughly 0).
                        if (dy < 0 && Math.abs(dx) < 200) isCandidate = true;
                        break;
                    case 'ArrowDown':
                        // Look for nodes below (dy > 0)
                        if (dy > 0 && Math.abs(dx) < 200) isCandidate = true;
                        break;
                }

                if (isCandidate) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDistance) {
                        minDistance = dist;
                        targetNode = node;
                    }
                }
            });

            if (targetNode) {
                playClick();
                selectSkill((targetNode as Node).id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, selectedSkillId, selectSkill, playClick]);

    return (
        <div className="h-full w-full bg-transparent" data-skill-tree>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-transparent"

                proOptions={{ hideAttribution: true }}
            >
                <Background gap={24} color="rgba(148,163,184,0.25)" className="opacity-20" />
                <Controls
                    className="!bg-surface-2 !border !border-white/20 !rounded-[12px] !fill-slate-200"
                    aria-label="Skill tree navigation controls"
                    showZoom={true}
                    showFitView={true}
                    showInteractive={true}
                />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.data.status) {
                            case 'mastered': return '#ff00ff';
                            case 'available': return '#00f3ff';
                            default: return '#333';
                        }
                    }}
                    maskColor="rgba(0,0,0, 0.7)"
                    className="!border !border-white/20 !rounded-[12px] !bg-surface-1"
                    ariaLabel="Skill tree minimap overview"
                />
            </ReactFlow>
        </div>
    );
}
