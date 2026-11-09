import type { SkillNode } from '../skill-data';
import { BADGES } from '../badges';

/**
 * Returns badge IDs newly earned given current mastered skills.
 */
export function checkForNewBadges(nodes: SkillNode[], currentBadges: string[]): string[] {
    const masteredIds = new Set(
        nodes.filter((n) => n.data.status === 'mastered').map((n) => n.id)
    );
    const newBadges: string[] = [];

    BADGES.forEach((badge) => {
        // Boss badges have no skill requirements; [].every() would award them on load.
        if (badge.requirements.length > 0 && !currentBadges.includes(badge.id)) {
            const hasAllReqs = badge.requirements.every((reqId) => masteredIds.has(reqId));
            if (hasAllReqs) {
                newBadges.push(badge.id);
            }
        }
    });

    return newBadges;
}
