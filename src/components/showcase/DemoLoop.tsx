'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * In-page hero "demo" for the showcase page.
 *
 * A compact, self-contained skill-tree scene that loops: nodes unlock in
 * sequence, their edges light up (energy-edge language from the app), XP ticks,
 * and a caption narrates each beat. Designed to read muted + looping +
 * captioned — the pattern the redesign research flagged for portfolio heroes.
 *
 * Under prefers-reduced-motion it renders the finished, fully-lit state with no
 * animation.
 */

type NodeDef = { id: string; label: string; x: number; y: number };
type EdgeDef = { from: string; to: string };

const NODES: NodeDef[] = [
  { id: 'html', label: 'Web Standards', x: 14, y: 30 },
  { id: 'js', label: 'ES Next', x: 40, y: 62 },
  { id: 'react', label: 'React Core', x: 66, y: 30 },
  { id: 'ts', label: 'TypeScript', x: 66, y: 74 },
  { id: 'next', label: 'SSR / Next', x: 88, y: 50 },
];

const EDGES: EdgeDef[] = [
  { from: 'html', to: 'js' },
  { from: 'js', to: 'react' },
  { from: 'js', to: 'ts' },
  { from: 'react', to: 'next' },
  { from: 'ts', to: 'next' },
];

// Reveal order + the caption shown when each step lands.
const STEPS: { unlock: string; xp: number; caption: string }[] = [
  { unlock: 'html', xp: 100, caption: 'Pick a starting path' },
  { unlock: 'js', xp: 260, caption: 'Prerequisites unlock' },
  { unlock: 'react', xp: 480, caption: 'Routes light up as you master skills' },
  { unlock: 'ts', xp: 720, caption: 'Earn XP, badges, streaks' },
  { unlock: 'next', xp: 1000, caption: 'Level up' },
];

const pos = (id: string) => {
  const n = NODES.find((x) => x.id === id)!;
  return { x: n.x, y: n.y };
};

export default function DemoLoop() {
  const reduce = useReducedMotion();
  // step = how many STEPS have landed (0..STEPS.length)
  const [step, setStep] = useState(reduce ? STEPS.length : 0);

  useEffect(() => {
    if (reduce) return;
    let n = 0;
    const tick = () => {
      n = n >= STEPS.length ? 0 : n + 1;
      setStep(n);
    };
    const iv = setInterval(tick, 1500);
    return () => clearInterval(iv);
  }, [reduce]);

  const unlocked = new Set(STEPS.slice(0, step).map((s) => s.unlock));
  const cur = step > 0 ? STEPS[step - 1] : undefined;
  const xp = cur?.xp ?? 0;
  const caption = cur?.caption ?? 'Pick a starting path';
  const isActiveEdge = (e: EdgeDef) => unlocked.has(e.from);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* wires */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="demo-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--neon-cyan)" />
            <stop offset="100%" stopColor="var(--tree-energy)" />
          </linearGradient>
        </defs>
        {EDGES.map((e) => {
          const a = pos(e.from);
          const b = pos(e.to);
          const active = isActiveEdge(e);
          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? 'url(#demo-edge)' : 'rgba(148,163,184,0.22)'}
                strokeWidth={active ? 0.7 : 0.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'stroke 0.5s ease' }}
              />
              {active && !reduce && (
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="var(--tree-energy)" strokeWidth={0.7}
                  strokeLinecap="round" strokeDasharray="1.5 4"
                  vectorEffect="non-scaling-stroke" className="sm-edge-flow"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* nodes */}
      {NODES.map((n) => {
        const on = unlocked.has(n.id);
        return (
          <motion.div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            animate={on ? { scale: [0.8, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div
              className={[
                'whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-colors duration-500 md:text-xs',
                on
                  ? 'border-neon-cyan/60 bg-surface-2/90 text-white shadow-[0_0_0_1px_rgba(139,124,255,0.3),0_10px_24px_-12px_rgba(139,124,255,0.6)]'
                  : 'border-white/10 bg-surface-1/70 text-text-faint',
              ].join(' ')}
            >
              {n.label}
            </div>
          </motion.div>
        );
      })}

      {/* caption + XP readout */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border-muted bg-background/70 px-4 py-2 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {caption}
          </span>
          <span className="h-3 w-px bg-border-muted" />
          <span className="font-mono text-[11px] tabular-nums text-neon-cyan-strong">
            {xp.toLocaleString()} XP
          </span>
        </div>
      </div>
    </div>
  );
}
