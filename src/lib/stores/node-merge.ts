import type { SkillNode, SkillStatus } from '../skill-data';

/**
 * Restore saved progress onto the current skill catalog.
 *
 * Saved state holds whole node objects, but titles, prerequisites, quizzes and XP
 * belong to the shipped catalog. Taking only progress fields from the save means a
 * release that adds or edits skills reaches existing users, and a skill removed from
 * the catalog drops out of their tree.
 */
export function mergeSavedProgress(saved: unknown, catalog: SkillNode[]): SkillNode[] {
    if (!Array.isArray(saved)) return catalog;

    const savedById = new Map<string, SkillNode>();
    for (const node of saved) {
        if (node && typeof node === 'object' && typeof (node as SkillNode).id === 'string') {
            savedById.set((node as SkillNode).id, node as SkillNode);
        }
    }

    return catalog.map((node) => {
        const previous = savedById.get(node.id);
        if (!previous) return node;
        const savedStatus = previous.data?.status;
        const status = isSkillStatus(savedStatus) ? savedStatus : node.data.status;
        const savedPracticed = previous.data?.lastPracticedAt;
        const lastPracticedAt = Number.isFinite(savedPracticed) ? savedPracticed : undefined;
        const position = isPosition(previous.position) ? previous.position : node.position;
        return {
            ...node,
            position,
            data: {
                ...node.data,
                status,
                ...(lastPracticedAt !== undefined ? { lastPracticedAt } : {}),
            },
        };
    });
}

/**
 * Apply computed layout positions without touching progress. The layout is built
 * from the raw catalog, so copying its nodes wholesale would reset every status.
 */
export function applyPositions(nodes: SkillNode[], layouted: SkillNode[]): SkillNode[] {
    const positions = new Map(layouted.map((n) => [n.id, n.position]));
    return nodes.map((node) => {
        const position = positions.get(node.id);
        return position ? { ...node, position } : node;
    });
}

const SKILL_STATUSES: readonly SkillStatus[] = ['locked', 'available', 'in-progress', 'mastered', 'decayed'];

function isSkillStatus(value: unknown): value is SkillStatus {
    return SKILL_STATUSES.includes(value as SkillStatus);
}

function isPosition(value: unknown): value is { x: number; y: number } {
    return (
        !!value &&
        typeof value === 'object' &&
        Number.isFinite((value as { x: unknown }).x) &&
        Number.isFinite((value as { y: unknown }).y)
    );
}
