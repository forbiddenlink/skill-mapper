import { StateCreator } from 'zustand';
import { SkillNode, getInitialSkills, SkillStatus, INITIAL_EDGES } from '../skill-data';
import { Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

export interface SkillsSlice {
    nodes: SkillNode[];
    edges: Edge[];
    selectedSkillId: string | null;
    
    // Actions
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    selectSkill: (id: string | null) => void;
    unlockSkill: (id: string) => void;
    refreshSkill: (id: string) => void;
    unlockBatch: (ids: string[]) => void;
    resetSkills: () => void;
}

export const createSkillsSlice: StateCreator<SkillsSlice> = (set, get) => ({
    nodes: getInitialSkills(),
    edges: INITIAL_EDGES,
    selectedSkillId: null,

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as SkillNode[],
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    selectSkill: (id) => set({ selectedSkillId: id }),

    unlockSkill: (id) => {
        const { nodes } = get();
        const skill = nodes.find((n) => n.id === id);
        if (!skill) return;

        const canUnlock = skill.data.prerequisites.every((reqId) => {
            const reqNode = nodes.find((n) => n.id === reqId);
            return reqNode?.data.status === 'mastered';
        });

        if (canUnlock && skill.data.status === 'locked') {
            set({
                nodes: nodes.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, status: 'in-progress' } } : n
                ),
            });
        }
    },

    refreshSkill: (id) => {
        set({
            nodes: get().nodes.map((n) =>
                n.id === id
                    ? { ...n, data: { ...n.data, status: 'mastered' as SkillStatus, lastPracticedAt: Date.now() } }
                    : n
            ),
        });
    },

    unlockBatch: (ids) => {
        const { nodes } = get();
        
        // Helper function to check if prerequisites are met
        const checkPrereqsMet = (node: SkillNode, nodeList: SkillNode[]): boolean => {
            return node.data.prerequisites.every((reqId) => {
                const reqNode = nodeList.find((n) => n.id === reqId);
                return reqNode?.data.status === 'mastered';
            });
        };

        const updatedNodes = nodes.map((node) => {
            if (ids.includes(node.id)) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        status: 'mastered' as SkillStatus,
                        lastPracticedAt: Date.now(),
                    },
                };
            }
            return node;
        });

        const nextNodes = updatedNodes.map((node) => {
            if (node.data.status === 'mastered') return node;
            
            const prereqsMet = checkPrereqsMet(node, updatedNodes);
            if (prereqsMet) {
                return { ...node, data: { ...node.data, status: 'available' as SkillStatus } };
            }
            return node;
        });

        set({ nodes: nextNodes });
    },

    resetSkills: () => {
        set({
            nodes: getInitialSkills(),
            edges: INITIAL_EDGES,
            selectedSkillId: null,
        });
    },
});
