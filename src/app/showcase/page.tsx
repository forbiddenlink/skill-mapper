import type { Metadata } from "next";
import Link from "next/link";
import DemoLoop from "@/components/showcase/DemoLoop";

export const metadata: Metadata = {
  title: "Skill Mapper — Case Study",
  description:
    "How a gamified skill-tree learning platform was designed and built: the problem, three explored art directions, and the result. Next.js 16, React 19, an animated node graph, and a full gamification system.",
};

/* --- small server-only presentational helpers --- */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-text-faint">
      {children}
    </span>
  );
}

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="panel-base p-5">
      <div className="font-display text-3xl font-medium tracking-tight text-white tabular-nums md:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
      {sub ? <div className="mt-0.5 text-xs text-text-faint">{sub}</div> : null}
    </div>
  );
}

const DIRECTIONS = [
  {
    tag: "Direction A",
    name: "Cyberpunk Overdrive",
    verdict: "Highest ceiling · most risk",
    body: "Push the game-HUD identity hard: WebGL ambience, scanlines, neon glow. Flexes raw frontend muscle but risks reading “gamer” and fatiguing.",
    tone: "text-tree-energy",
  },
  {
    tag: "Direction B",
    name: "Refined Premium",
    verdict: "Chosen base",
    body: "Linear / Vercel-tier restraint — deep neutrals, one violet accent, editorial serif display, spring motion. Says “senior” fastest and photographs beautifully.",
    tone: "text-neon-cyan-strong",
    chosen: true,
  },
  {
    tag: "Direction C",
    name: "Bold & Playful",
    verdict: "Most memorable",
    body: "Duolingo / Arc energy — chunky outlines, bouncy physics, character. Widest appeal, but risks reading “toy” if the execution slips.",
    tone: "text-warning-amber",
  },
];

const FEATURES = [
  {
    k: "Interactive skill tree",
    d: "A directed graph of ~40 skills with ELK auto-layout, collapsible branches, keyboard navigation, and energy edges that light up along the routes you've mastered.",
  },
  {
    k: "Full gamification loop",
    d: "XP, levels, badges, achievements, streaks, daily challenges, and boss battles — with squash-pop unlocks, confetti, and generated victory jingles.",
  },
  {
    k: "AI recommendations",
    d: "Personalized next-skill suggestions (Quick Win vs Diversify) driven by your progress through the tree, powered by Groq.",
  },
  {
    k: "Built to last",
    d: "Offline-first PWA, IndexedDB persistence, import/export saves, live regions and focus management for accessibility, Sentry + PostHog + rate limiting.",
  },
];

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "@xyflow / React Flow",
  "Framer Motion",
  "Zustand",
  "Drizzle + Neon",
  "Groq",
  "PWA",
  "Vitest + Playwright",
  "Sentry",
];

export default function ShowcasePage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-background text-foreground">
      {/* ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.9]"
        style={{
          background:
            "radial-gradient(900px 520px at 82% -6%, rgba(139,124,255,0.16), transparent 60%), radial-gradient(700px 500px at -6% 8%, rgba(52,220,255,0.08), transparent 55%)",
        }}
      />

      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-border-muted bg-background/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-medium tracking-tight">Skill&nbsp;Mapper</span>
          <div className="flex items-center gap-2">
            <a href="#case-study" className="btn-ghost hidden items-center px-3 text-sm sm:inline-flex">
              Case study
            </a>
            <Link href="/" className="btn-primary inline-flex items-center text-sm">
              Launch the app
            </Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28">
        <Eyebrow>Gamified learning · interactive skill tree</Eyebrow>
        <h1 className="mt-5 max-w-[16ch] font-display text-5xl font-medium leading-[1.02] tracking-tight text-balance md:text-7xl">
          Turn learning into a <span className="text-neon-cyan-strong">skill tree</span> you actually finish.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-text-muted md:text-xl">
          Map any domain as a branching tree of skills, then progress through it like a game — XP,
          unlocks, streaks, and an AI that tells you what to learn next. Built as a study in design
          and frontend craft.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center text-sm">
            Explore the tree →
          </Link>
          <a href="#demo" className="btn-ghost inline-flex items-center px-4 text-sm">
            ▸ Watch the 30s demo
          </a>
        </div>

        {/* hero visual — stylized node cluster */}
        <div className="panel-strong relative mt-14 aspect-[16/9] w-full overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 78% 6%, rgba(139,124,255,0.16), transparent 55%), radial-gradient(90% 80% at 8% 96%, rgba(52,220,255,0.12), transparent 55%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <span id="demo" className="absolute left-4 top-3 z-10 font-mono text-[10px] uppercase tracking-[0.24em] text-text-faint">
            Live demo
          </span>
          <DemoLoop />
        </div>
      </section>

      {/* metrics */}
      <section className="mx-auto max-w-5xl px-6 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat value="~40" label="Skills mapped" sub="4 tiers, auto-laid-out" />
          <Stat value="100" label="Best-practices & SEO" sub="Lighthouse, desktop" />
          <Stat value="95" label="Accessibility" sub="Lighthouse + keyboard/SR" />
          <Stat value="0" label="Layout shift (CLS)" sub="FCP under 1s" />
        </div>
      </section>

      {/* problem */}
      <section id="case-study" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-4 max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
          Learning roadmaps are flat lists. Nobody finishes a flat list.
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <p className="text-text-muted">
            Most “learning paths” are a checklist in a doc. There's no sense of place, no
            momentum, no reward for progress, and no signal about what's worth doing next. Motivation
            leaks out between step 3 and step 4.
          </p>
          <p className="text-text-muted">
            Skill Mapper reframes the roadmap as a{" "}
            <span className="text-foreground">spatial, gamified skill tree</span>: prerequisites become
            branches, progress becomes lit routes, and every unlock is a small celebration. The goal is a
            roadmap that pulls you forward instead of guilt-tripping you.
          </p>
        </div>
      </section>

      {/* directions */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Eyebrow>The approach · design decision log</Eyebrow>
        <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
          Three art directions, explored on the real UI before committing.
        </h2>
        <p className="mt-5 max-w-2xl text-text-muted">
          Rather than settle on the first idea, each direction was mocked up on the actual product and
          judged side by side. The base shipped is Refined Premium — with the best moments of the other
          two grafted in.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {DIRECTIONS.map((d) => (
            <div
              key={d.name}
              className={`panel-base relative flex flex-col p-6 ${
                d.chosen ? "ring-1 ring-neon-cyan/50" : ""
              }`}
            >
              {d.chosen && (
                <span className="absolute right-4 top-4 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-neon-cyan-strong">
                  Shipped
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint">
                {d.tag}
              </span>
              <h3 className={`mt-2 font-display text-xl font-medium ${d.tone}`}>{d.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{d.body}</p>
              <div className="mt-4 border-t border-border-muted pt-3 font-mono text-[11px] uppercase tracking-wide text-text-faint">
                {d.verdict}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-text-faint">
          Result: Refined Premium base + Direction A's animated energy-edges on the tree + Direction C's
          confetti &amp; squash-pop on unlocks.
        </p>
      </section>

      {/* features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Eyebrow>What's inside</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight md:text-5xl">
          A real product, not a demo.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.k} className="panel-base p-6">
              <h3 className="text-lg font-semibold tracking-tight text-white">{f.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* stack */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Eyebrow>Built with</Eyebrow>
        <div className="mt-5 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border-muted bg-surface-1/70 px-3 py-1.5 font-mono text-xs text-text-muted"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-28 pt-8">
        <div className="panel-strong relative overflow-hidden p-10 text-center md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[40rem] -translate-x-1/2 rounded-full bg-neon-cyan/12 blur-3xl"
          />
          <h2 className="font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
            See the tree light up.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-text-muted">
            Pick your starting level and watch prerequisites unlock, edges fire, and XP roll in.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-flex items-center text-sm">
            Launch Skill Mapper →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border-muted">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 font-mono text-xs text-text-faint sm:flex-row">
          <span>Skill Mapper — a design &amp; frontend case study</span>
          <Link href="/" className="hover:text-foreground">
            skill-mapper.app
          </Link>
        </div>
      </footer>
    </div>
  );
}
