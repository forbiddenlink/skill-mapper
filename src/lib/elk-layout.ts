import type { ElkNode, ElkExtendedEdge, LayoutOptions, ELK } from 'elkjs';
import type { Edge } from 'reactflow';
import type { SkillNode, SkillTier } from './skill-data';
import type { LayoutAlgorithm, LayoutDirection, Position, CollapsedBranches } from '@/types/skill';

// Lazy load ELK to avoid SSR issues
let elkInstance: ELK | null = null;

async function getElk(): Promise<ELK> {
    if (elkInstance) return elkInstance;
    const ELKConstructor = (await import('elkjs/lib/elk.bundled.js')).default;
    elkInstance = new ELKConstructor();
    return elkInstance;
}

/**
 * Node dimensions for layout calculation
 */
export const NODE_WIDTH = 176; // w-44 = 11rem = 176px
export const NODE_HEIGHT = 92; // h-[92px]

/**
 * Map skill tier to ELK layer constraint for consistent vertical positioning.
 * ELK layers are numbered from bottom (0) to top.
 */
export const TIER_TO_LAYER: Record<SkillTier, number> = {
    'foundation': 0,
    'frontend-2': 1,
    'backend-data': 2,
    'ai-engineer': 3,
    'systems': 4,
};

/**
 * Base ELK layout options for hierarchical skill tree visualization.
 */
const BASE_OPTIONS: LayoutOptions = {
    'elk.edgeRouting': 'SPLINES',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.separateConnectedComponents': 'false',
};

/**
 * Layout algorithm configurations
 */
const ALGORITHM_OPTIONS: Record<LayoutAlgorithm, LayoutOptions> = {
    layered: {
        'elk.algorithm': 'layered',
        'elk.layered.spacing.nodeNodeBetweenLayers': '180',
        'elk.layered.spacing.edgeNodeBetweenLayers': '40',
        'elk.spacing.nodeNode': '100',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
    },
    force: {
        'elk.algorithm': 'force',
        'elk.force.iterations': '300',
        'elk.force.repulsion': '5.0',
        'elk.spacing.nodeNode': '150',
    },
    radial: {
        'elk.algorithm': 'radial',
        'elk.radial.radius': '200',
        'elk.spacing.nodeNode': '80',
    },
    tree: {
        'elk.algorithm': 'mrtree',
        'elk.spacing.nodeNode': '100',
        'elk.mrtree.weighting': 'CONSTRAINT',
    },
};

/**
 * Layout presets for different visualization preferences.
 */
export const LAYOUT_PRESETS = {
    hierarchical: {
        algorithm: 'layered' as LayoutAlgorithm,
        direction: 'UP' as LayoutDirection,
        spacing: { nodeNode: 100, layerSpacing: 180 },
    },
    compact: {
        algorithm: 'layered' as LayoutAlgorithm,
        direction: 'UP' as LayoutDirection,
        spacing: { nodeNode: 60, layerSpacing: 120 },
    },
    spread: {
        algorithm: 'layered' as LayoutAlgorithm,
        direction: 'UP' as LayoutDirection,
        spacing: { nodeNode: 160, layerSpacing: 240 },
    },
    force: {
        algorithm: 'force' as LayoutAlgorithm,
        direction: 'UP' as LayoutDirection,
        spacing: { nodeNode: 150, layerSpacing: 180 },
    },
    radial: {
        algorithm: 'radial' as LayoutAlgorithm,
        direction: 'UP' as LayoutDirection,
        spacing: { nodeNode: 80, layerSpacing: 200 },
    },
} as const;

export type LayoutPreset = keyof typeof LAYOUT_PRESETS;

/**
 * Layout configuration options
 */
export interface LayoutConfig {
    algorithm: LayoutAlgorithm;
    direction: LayoutDirection;
    spacing?: {
        nodeNode?: number;
        layerSpacing?: number;
    };
    animated?: boolean;
}

/**
 * Build ELK options from layout configuration
 */
function buildElkOptions(config: LayoutConfig): LayoutOptions {
    const algorithmOptions = ALGORITHM_OPTIONS[config.algorithm];

    const options: LayoutOptions = {
        ...BASE_OPTIONS,
        ...algorithmOptions,
        'elk.direction': config.direction,
    };

    if (config.spacing?.nodeNode !== undefined) {
        options['elk.spacing.nodeNode'] = String(config.spacing.nodeNode);
    }

    if (config.spacing?.layerSpacing !== undefined && config.algorithm === 'layered') {
        options['elk.layered.spacing.nodeNodeBetweenLayers'] = String(config.spacing.layerSpacing);
    }

    return options;
}

/**
 * Convert ReactFlow nodes to ELK graph format with layer constraints.
 */
function toElkGraph(
    nodes: SkillNode[],
    edges: Edge[],
    options: LayoutOptions
): ElkNode {
    const elkNodes: ElkNode[] = nodes.map((node) => {
        const nodeOptions: LayoutOptions = {};
        // Layer constraint based on tier (only for layered algorithm)
        if (options['elk.algorithm'] === 'layered') {
            nodeOptions['elk.layered.layerConstraint'] = String(TIER_TO_LAYER[node.data.tier]);
        }
        return {
            id: node.id,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            layoutOptions: nodeOptions,
        };
    });

    const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
    }));

    return {
        id: 'root',
        layoutOptions: options,
        children: elkNodes,
        edges: elkEdges,
    };
}

/**
 * Calculate the center point of a set of nodes
 */
function calculateCenter(elkNodes: ElkNode[]): Position {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const elkNode of elkNodes) {
        if (elkNode.x !== undefined && elkNode.y !== undefined) {
            minX = Math.min(minX, elkNode.x);
            maxX = Math.max(maxX, elkNode.x + (elkNode.width || NODE_WIDTH));
            minY = Math.min(minY, elkNode.y);
            maxY = Math.max(maxY, elkNode.y + (elkNode.height || NODE_HEIGHT));
        }
    }

    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
    };
}

/**
 * Apply ELK layout to nodes and return positioned nodes.
 * Centers the layout around (0, 0) for ReactFlow's fitView.
 */
export async function applyElkLayout(
    nodes: SkillNode[],
    edges: Edge[],
    config?: Partial<LayoutConfig>
): Promise<SkillNode[]> {
    const defaultConfig: LayoutConfig = {
        algorithm: 'layered',
        direction: 'UP',
        spacing: { nodeNode: 100, layerSpacing: 180 },
    };

    const finalConfig = { ...defaultConfig, ...config };
    const options = buildElkOptions(finalConfig);

    const elkGraph = toElkGraph(nodes, edges, options);
    const elk = await getElk();
    const layoutedGraph = await elk.layout(elkGraph);

    if (!layoutedGraph.children) {
        return nodes;
    }

    const center = calculateCenter(layoutedGraph.children);

    // Create map for quick lookup
    const positionMap = new Map<string, Position>();
    for (const elkNode of layoutedGraph.children) {
        if (elkNode.x !== undefined && elkNode.y !== undefined) {
            positionMap.set(elkNode.id, {
                x: elkNode.x - center.x,
                y: elkNode.y - center.y,
            });
        }
    }

    // Apply positions to nodes
    return nodes.map((node) => {
        const position = positionMap.get(node.id);
        if (position) {
            return {
                ...node,
                position,
            };
        }
        return node;
    });
}

/**
 * Apply layout with a specific preset
 */
export async function applyPresetLayout(
    nodes: SkillNode[],
    edges: Edge[],
    preset: LayoutPreset
): Promise<SkillNode[]> {
    const presetConfig = LAYOUT_PRESETS[preset];
    return applyElkLayout(nodes, edges, presetConfig);
}

/**
 * Synchronous fallback layout using barycenter heuristic.
 * Used when ELK layout hasn't been applied yet.
 */
export function applyFallbackLayout(nodes: SkillNode[]): SkillNode[] {
    const Y_SPACING = 180;
    const X_SPACING = 240;

    // Group by tier
    const nodesByTier: Record<number, SkillNode[]> = {};
    const skillMap = new Map<string, SkillNode>();

    for (const node of nodes) {
        skillMap.set(node.id, node);
        const level = TIER_TO_LAYER[node.data.tier];
        if (!nodesByTier[level]) nodesByTier[level] = [];
        nodesByTier[level].push(node);
    }

    const positionedNodes: SkillNode[] = [];
    const tiers = Object.keys(nodesByTier).map(Number).sort((a, b) => a - b);
    const nodeWeights = new Map<string, number>();

    for (const level of tiers) {
        const tierNodes = nodesByTier[level];
        if (!tierNodes) continue;

        // Barycenter heuristic for ordering
        if (level > 0) {
            for (const node of tierNodes) {
                const parents = node.data.prerequisites
                    .map((id) => skillMap.get(id))
                    .filter((n): n is SkillNode => n !== undefined && TIER_TO_LAYER[n.data.tier] < level);

                let weight = 0;
                if (parents.length > 0) {
                    weight = parents.reduce((sum, p) => sum + (p.position.x || 0), 0) / parents.length;
                }
                nodeWeights.set(node.id, weight);
            }

            tierNodes.sort((a, b) => {
                const weightA = nodeWeights.get(a.id) ?? 0;
                const weightB = nodeWeights.get(b.id) ?? 0;
                return weightA - weightB;
            });
        }

        // Position nodes centered
        const count = tierNodes.length;
        const tierWidth = (count - 1) * X_SPACING;
        const startX = -tierWidth / 2;

        tierNodes.forEach((node, index) => {
            node.position = {
                x: startX + index * X_SPACING,
                y: -(level * Y_SPACING), // Negative Y so tree grows up
            };
            positionedNodes.push(node);
        });
    }

    return positionedNodes;
}

/**
 * Interpolate between two positions for smooth animation
 */
export function interpolatePositions(
    from: Position,
    to: Position,
    progress: number
): Position {
    // Use easeInOutCubic for smooth animation
    const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    return {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
    };
}

/**
 * Calculate animated positions for layout transition
 */
export function calculateAnimatedPositions(
    nodes: SkillNode[],
    targetNodes: SkillNode[],
    progress: number
): SkillNode[] {
    const targetMap = new Map<string, Position>();
    for (const node of targetNodes) {
        targetMap.set(node.id, node.position);
    }

    return nodes.map((node) => {
        const targetPosition = targetMap.get(node.id);
        if (targetPosition) {
            return {
                ...node,
                position: interpolatePositions(node.position, targetPosition, progress),
            };
        }
        return node;
    });
}

/**
 * Filter nodes based on collapsed branches
 */
export function filterCollapsedNodes(
    nodes: SkillNode[],
    edges: Edge[],
    collapsed: CollapsedBranches
): { nodes: SkillNode[]; edges: Edge[] } {
    // Build a map of children for each node
    const childrenMap = new Map<string, string[]>();
    for (const node of nodes) {
        childrenMap.set(node.id, []);
    }
    for (const edge of edges) {
        const children = childrenMap.get(edge.source) || [];
        children.push(edge.target);
        childrenMap.set(edge.source, children);
    }

    // Find all hidden nodes (descendants of collapsed nodes)
    const hiddenNodes = new Set<string>();

    function hideDescendants(nodeId: string) {
        const children = childrenMap.get(nodeId) || [];
        for (const childId of children) {
            hiddenNodes.add(childId);
            hideDescendants(childId);
        }
    }

    for (const [nodeId, isCollapsed] of Object.entries(collapsed)) {
        if (isCollapsed) {
            hideDescendants(nodeId);
        }
    }

    // Filter nodes and edges
    const filteredNodes = nodes.filter((node) => !hiddenNodes.has(node.id));
    const filteredEdges = edges.filter(
        (edge) => !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target)
    );

    return { nodes: filteredNodes, edges: filteredEdges };
}

/**
 * Get the descendants count for each node (for collapse indicator)
 */
export function getDescendantCounts(
    nodes: SkillNode[],
    edges: Edge[]
): Map<string, number> {
    const childrenMap = new Map<string, string[]>();
    for (const node of nodes) {
        childrenMap.set(node.id, []);
    }
    for (const edge of edges) {
        const children = childrenMap.get(edge.source) || [];
        children.push(edge.target);
        childrenMap.set(edge.source, children);
    }

    const counts = new Map<string, number>();

    function countDescendants(nodeId: string): number {
        const cached = counts.get(nodeId);
        if (cached !== undefined) return cached;

        const children = childrenMap.get(nodeId) || [];
        let count = children.length;

        for (const childId of children) {
            count += countDescendants(childId);
        }

        counts.set(nodeId, count);
        return count;
    }

    for (const node of nodes) {
        countDescendants(node.id);
    }

    return counts;
}
