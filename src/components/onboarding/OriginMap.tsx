import { getRawSkillNodes, INITIAL_EDGES, type SkillTier } from '@/lib/skill-data';

/**
 * A faithful, static rendering of the real skill graph (src/lib/skill-data.ts).
 * Every dot is one of the app's skills, every line is one of its prerequisite
 * edges. `unlocks` is the exact list a role passes to `unlockBatch`, and the
 * "ready" ring mirrors the store's rule: a skill becomes available once all of
 * its prerequisites are mastered.
 */

const TIERS: { id: SkillTier; label: string }[] = [
    { id: 'foundation', label: 'Foundation' },
    { id: 'frontend-2', label: 'Frontend' },
    { id: 'backend-data', label: 'Backend + data' },
    { id: 'ai-engineer', label: 'AI engineer' },
    { id: 'systems', label: 'Systems' },
];

const W = 1180;
const ROW = 25;
const TOP = 46;
const COL_W = W / TIERS.length;
const NODE_X = 20;
/** Advance width of IBM Plex Mono at 10.5px (0.6em), used for the label knockout. */
const CHAR_W = 6.3;

const SKILLS = getRawSkillNodes();

const POSITIONS = (() => {
    const map = new Map<string, { x: number; y: number }>();
    TIERS.forEach((tier, col) => {
        SKILLS.filter((s) => s.data.tier === tier.id).forEach((s, row) => {
            map.set(s.id, { x: col * COL_W + NODE_X, y: TOP + row * ROW });
        });
    });
    return map;
})();

const ROWS = Math.max(
    ...TIERS.map((t) => SKILLS.filter((s) => s.data.tier === t.id).length),
);
const H = TOP + ROWS * ROW + 4;

export const SKILL_COUNT = SKILLS.length;

/** How many of a role's unlock ids exist in the graph. */
export const countMastered = (unlocks: string[]) =>
    SKILLS.filter((s) => unlocks.includes(s.id)).length;

export function OriginMap({ unlocks }: { unlocks: string[] }) {
    const mastered = new Set(unlocks);
    const ready = new Set(
        SKILLS.filter(
            (s) =>
                !mastered.has(s.id) &&
                s.data.prerequisites.every((p) => mastered.has(p)),
        ).map((s) => s.id),
    );
    const masteredCount = SKILLS.filter((s) => mastered.has(s.id)).length;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full min-w-[900px]"
            role="img"
            aria-label={`Skill graph of ${SKILLS.length} skills in ${TIERS.length} tiers. ${masteredCount} would start mastered.`}
        >
            {TIERS.map((tier, col) => (
                <text
                    key={tier.id}
                    x={col * COL_W + NODE_X - 5}
                    y={18}
                    fill="var(--text-muted)"
                    fontFamily="var(--font-plex-mono), monospace"
                    fontSize="11"
                    letterSpacing="1.4"
                >
                    {`0${col + 1}  ${tier.label.toUpperCase()}`}
                </text>
            ))}
            {TIERS.map((tier, col) => (
                <line
                    key={`rule-${tier.id}`}
                    x1={col * COL_W + NODE_X - 5}
                    x2={col * COL_W + (COL_W - 24)}
                    y1={26}
                    y2={26}
                    stroke="var(--border-muted)"
                />
            ))}

            {INITIAL_EDGES.map((e) => {
                const a = POSITIONS.get(e.source);
                const b = POSITIONS.get(e.target);
                if (!a || !b) return null;
                const lit = mastered.has(e.source) && mastered.has(e.target);
                const mx = (a.x + b.x) / 2;
                return (
                    <path
                        key={e.id}
                        d={`M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`}
                        fill="none"
                        stroke={lit ? 'var(--mastery)' : 'var(--slate-700)'}
                        strokeWidth={lit ? 1.6 : 1}
                        opacity={lit ? 0.95 : 0.4}
                        style={{ transition: 'stroke 200ms, opacity 200ms' }}
                    />
                );
            })}

            {SKILLS.map((s) => {
                const p = POSITIONS.get(s.id);
                if (!p) return null;
                const isMastered = mastered.has(s.id);
                const isReady = ready.has(s.id);
                return (
                    <g key={s.id}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={isMastered ? 6 : 5}
                            fill={isMastered ? 'var(--mastery)' : 'var(--canvas)'}
                            stroke={
                                isMastered
                                    ? 'var(--mastery)'
                                    : isReady
                                      ? 'var(--signal)'
                                      : 'var(--slate-700)'
                            }
                            strokeWidth={isReady ? 2 : 1.5}
                            style={{ transition: 'fill 200ms, stroke 200ms' }}
                        />
                        <rect
                            x={p.x + 8}
                            y={p.y - 8}
                            width={s.data.title.length * CHAR_W + 8}
                            height={16}
                            fill="var(--canvas)"
                        />
                        <text
                            x={p.x + 12}
                            y={p.y + 3.5}
                            fontFamily="var(--font-plex-mono), monospace"
                            fontSize="10.5"
                            stroke="var(--canvas)"
                            strokeWidth="6"
                            strokeLinejoin="round"
                            paintOrder="stroke"
                            fill={
                                isMastered
                                    ? 'var(--foreground)'
                                    : isReady
                                      ? 'var(--signal)'
                                      : 'var(--text-muted)'
                            }
                            style={{ transition: 'fill 200ms' }}
                        >
                            {s.data.title}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
