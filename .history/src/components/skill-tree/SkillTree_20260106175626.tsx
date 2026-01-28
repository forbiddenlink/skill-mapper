// This directive ensures it runs only on the client-side as React Flow uses window/document
'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    useNodesState,
    useEdgesState,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import CustomNode from './CustomNode';
import ParticleEdge from './ParticleEdge';
import { shallow } from 'zustand/shallow';

const nodeTypes: NodeTypes = {
    skill: CustomNode,
};

const edgeTypes: EdgeTypes = {
    particle: ParticleEdge,
};

export default function SkillTreeCanvas() {
    // Optimized selectors - split into separate calls to prevent unnecessary re-renders
    const nodes = useGameStore((state) => state.nodes, shallow);
    const edges = useGameStore((state) => state.edges, shallow);
    const onNodesChange = useGameStore((state) => state.onNodesChange);
    const onEdgesChange = useGameStore((state) => state.onEdgesChange);
    const selectedSkillId = useGameStore((state) => state.selectedSkillId);
    const selectSkill = useGameStore((state) => state.selectSkill);
    const { playClick } = useGameSounds();

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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
        <div className="w-full h-full bg-deep-void">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-deep-void"
            >
                <Background gap={20} color="#333" className="opacity-20" />
                <Controls className="bg-gray-800 border-gray-700 fill-white" />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.data.status) {
                            case 'mastered': return '#ff00ff';
                            case 'available': return '#00f3ff';
                            default: return '#333';
                        }
                    }}
                    maskColor="rgba(0,0,0, 0.7)"
                    className="border-2 border-gray-800 rounded bg-black"
                />
            </ReactFlow>
        </div>
    );
}
