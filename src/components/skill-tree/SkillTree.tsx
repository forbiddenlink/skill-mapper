// This directive ensures it runs only on the client-side as React Flow uses window/document
'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    NodeTypes,
    EdgeTypes,
    Node,
    Edge,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import CustomNode from './CustomNode';
import ParticleEdge from './ParticleEdge';
import type { SkillNode } from '@/lib/skill-data';
import { useShallow } from 'zustand/react/shallow';
import { buildChildrenMap, type CollapsedBranches } from '@/types/skill';

const nodeTypes: NodeTypes = {
    skill: CustomNode,
};

const edgeTypes: EdgeTypes = {
    particle: ParticleEdge,
};

/**
 * Get all descendant node IDs for a given skill
 */
function getDescendants(
    skillId: string,
    childrenMap: Map<string, string[]>,
    visited: Set<string> = new Set()
): Set<string> {
    if (visited.has(skillId)) return visited;

    const children = childrenMap.get(skillId) || [];
    for (const childId of children) {
        visited.add(childId);
        getDescendants(childId, childrenMap, visited);
    }

    return visited;
}

/**
 * Filter nodes and edges based on collapsed state
 */
function filterByCollapsed(
    nodes: SkillNode[],
    edges: Edge[],
    collapsed: CollapsedBranches
): { filteredNodes: SkillNode[]; filteredEdges: Edge[] } {
    // Build children map
    const childrenMap = buildChildrenMap(nodes.map(n => ({
        id: n.id,
        prerequisites: n.data.prerequisites
    })));

    // Find all hidden nodes (descendants of collapsed nodes)
    const hiddenNodes = new Set<string>();
    for (const [skillId, isCollapsed] of Object.entries(collapsed)) {
        if (isCollapsed) {
            const descendants = getDescendants(skillId, childrenMap);
            for (const descendant of descendants) {
                hiddenNodes.add(descendant);
            }
        }
    }

    // Filter out hidden nodes
    const filteredNodes = nodes.filter(node => !hiddenNodes.has(node.id));

    // Filter out edges connected to hidden nodes
    const filteredEdges = edges.filter(edge =>
        !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target)
    );

    return { filteredNodes, filteredEdges };
}

/**
 * Inner component that has access to ReactFlow instance.
 * Applies ELK layout on mount for optimal node positioning.
 */
function SkillTreeInner() {
    const { fitView } = useReactFlow();
    const hasAppliedLayout = useRef(false);
    const [collapsed, setCollapsed] = useState<CollapsedBranches>({});
    const [isAnimating, setIsAnimating] = useState(false);

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
    const applyElkLayout = useGameStore((state) => state.applyElkLayout);
    const { playClick } = useGameSounds();

    // Build children map for collapse functionality
    const childrenMap = useMemo(() =>
        buildChildrenMap(nodes.map(n => ({
            id: n.id,
            prerequisites: n.data.prerequisites
        }))),
        [nodes]
    );

    // Filter nodes and edges based on collapsed state
    const { filteredNodes, filteredEdges } = useMemo(() =>
        filterByCollapsed(nodes, edges, collapsed),
        [nodes, edges, collapsed]
    );

    // Apply ELK layout on mount
    useEffect(() => {
        if (hasAppliedLayout.current) return;
        hasAppliedLayout.current = true;

        applyElkLayout().then(() => {
            // Fit view after layout is applied
            setTimeout(() => fitView({ padding: 0.1 }), 50);
        });
    }, [applyElkLayout, fitView]);

    // Toggle collapse state for a branch
    const toggleCollapse = useCallback((skillId: string) => {
        const children = childrenMap.get(skillId) || [];
        if (children.length === 0) return; // No children to collapse

        setIsAnimating(true);
        setCollapsed(prev => ({
            ...prev,
            [skillId]: !prev[skillId]
        }));

        // Re-fit view after collapse animation
        setTimeout(() => {
            fitView({ padding: 0.1, duration: 300 });
            setIsAnimating(false);
        }, 350);
    }, [childrenMap, fitView]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        playClick();
        selectSkill(node.id);
    }, [selectSkill, playClick]);

    const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
        toggleCollapse(node.id);
    }, [toggleCollapse]);

    // Keyboard Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Provide escape to deselect
            if (e.key === 'Escape') {
                selectSkill(null);
                return;
            }

            // Toggle collapse with Enter or Space
            if ((e.key === 'Enter' || e.key === ' ') && selectedSkillId) {
                e.preventDefault();
                toggleCollapse(selectedSkillId);
                return;
            }

            if (!selectedSkillId) return;

            const currentNode = filteredNodes.find(n => n.id === selectedSkillId);
            if (!currentNode) return;

            let targetNode: Node | null = null;
            let minDistance = Infinity;

            const currentPos = currentNode.position;

            // Simple navigation heuristics
            filteredNodes.forEach(node => {
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
    }, [filteredNodes, selectedSkillId, selectSkill, playClick, toggleCollapse]);

    // Animate nodes with framer-motion wrapper
    const animatedNodes = useMemo(() =>
        filteredNodes.map(node => ({
            ...node,
            // Add collapse indicator data
            data: {
                ...node.data,
                isCollapsed: collapsed[node.id] ?? false,
                hasChildren: (childrenMap.get(node.id) || []).length > 0
            }
        })),
        [filteredNodes, collapsed, childrenMap]
    );

    return (
        <div className="h-full w-full bg-transparent" data-skill-tree>
            <AnimatePresence mode="wait">
                <motion.div
                    key="skill-tree-container"
                    className="h-full w-full"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isAnimating ? 0.8 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <ReactFlow
                        nodes={animatedNodes}
                        edges={filteredEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        className="bg-transparent"
                        // Performance optimization: Only render nodes/edges in viewport
                        onlyRenderVisibleElements
                        proOptions={{ hideAttribution: true }}
                        minZoom={0.1}
                        maxZoom={2}
                        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
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
                </motion.div>
            </AnimatePresence>

            {/* Collapse/Expand hint */}
            {selectedSkillId && (childrenMap.get(selectedSkillId) || []).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-surface-2/90 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm border border-white/10"
                >
                    Double-click or press Enter to {collapsed[selectedSkillId] ? 'expand' : 'collapse'} branch
                </motion.div>
            )}
        </div>
    );
}

/**
 * Main SkillTree component wrapped with ReactFlowProvider.
 * This is the default export used in the app.
 */
export default function SkillTreeCanvas() {
    return (
        <ReactFlowProvider>
            <SkillTreeInner />
        </ReactFlowProvider>
    );
}
