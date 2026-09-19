# Skill Mapper

Gamified skill-tree learning platform: an interactive node graph (React
Flow) where skills unlock based on mastered prerequisites, with XP,
achievements, and progress tracking.

## Stack

- Next.js 16, React 19, TypeScript 6, App Router (Server Components by
  default, `"use client"` only when needed)
- Tailwind CSS 4
- Client-side persistence via IndexedDB (`src/lib/indexeddb.ts`,
  `src/lib/stores/idb-storage.ts`), not a server database. `drizzle-kit`
  is installed and `drizzle.config.ts` exists, but there is no
  `drizzle-orm` dependency and the schema file it points to (src/lib/db.ts)
  does not exist; treat Drizzle as unused scaffolding, not live
  infrastructure (see Gotchas).
- `@t3-oss/env-nextjs` + zod for env var validation (`src/env.ts`)
- React Flow (`@xyflow/react` + `reactflow`) for the skill tree, elkjs for
  layout, Framer Motion for animation, xstate for state machines
- Arcjet for rate limiting/bot protection, Upstash Redis, Sentry, Axiom,
  PostHog, Vercel Analytics/Speed Insights
- Groq SDK (AI), Trigger.dev (background jobs)
- Testing: Vitest + Testing Library (unit), Playwright (e2e, with
  `@axe-core/playwright` for a11y), Storybook (with a11y addon)
- Lint/format: ESLint (`eslint-config-next`) is the `lint` script, but
  Biome and Prettier are also installed with their own scripts; there is
  no single enforced formatter, check which a file actually follows.
- pnpm (pnpm-lock.yaml present; no `packageManager` field pinned)

## Commands

```bash
pnpm dev                # next dev
pnpm build              # next build (postbuild runs next-sitemap)
pnpm start              # next start
pnpm lint               # eslint
pnpm biome:check        # biome check .
pnpm biome:fix          # biome check . --write
pnpm type-check         # tsc --noEmit
pnpm test               # vitest
pnpm test:coverage      # vitest --coverage
pnpm test:e2e           # playwright test
pnpm test:e2e:report    # playwright show-report
pnpm storybook          # storybook dev -p 6006
pnpm build-storybook
pnpm analyze            # ANALYZE=true next build
```

`prepare` runs `npx playwright install` on install.

## Layout

- `src/app/`: App Router routes, including `src/app/api/` and
  `src/app/showcase/`
- `src/components/`: UI components, with `src/components/skill-tree/`,
  `src/components/ui/`, `src/components/showcase/`
- `src/lib/`: `indexeddb.ts` (client persistence), `src/lib/stores/`
  (state, including IndexedDB-backed store adapters)
- `src/hooks/`, `src/types/`, `src/trigger/` (Trigger.dev tasks),
  `src/mocks/` (MSW), `src/test/` (test setup)
- `src/env.ts`: the validated env schema, source of truth for which env
  vars this app actually reads
- `drizzle/`: generated migrations
- `e2e/`: Playwright specs
- `scripts/`: `cleanup.sh`, `generate-icons.sh`

## Conventions

- Design system "Signal Atlas": semantic Tailwind tokens in
  `src/app/globals.css` (`signal` / `mastery` / `progress` / `reward` /
  `decay` naming). Avoid legacy neon/glassmorphism styling. Read
  `DESIGN.md` and `.impeccable.md` before UI work if present.
- Prefer Server Components; add `"use client"` only when needed.

## Env vars

Validated in `src/env.ts` (all currently optional):
- Server: `AXIOM_TOKEN`, `GROQ_API_KEY`, `SENTRY_AUTH_TOKEN`,
  `TRIGGER_PROJECT_REF`
- Client: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_AXIOM_DATASET`,
  `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_KEY`,
  `NEXT_PUBLIC_SENTRY_DSN`
- `SKIP_ENV_VALIDATION` bypasses the schema entirely.

Used in source but not in the `src/env.ts` schema (unvalidated):
`ARCJET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`,
`NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`, and several
`NEXT_PUBLIC_ENABLE_*` / `NEXT_PUBLIC_DECAY_THRESHOLD_MS` /
`NEXT_PUBLIC_XP_PER_LEVEL` gamification feature flags.

## Gotchas

- Drizzle is only half-wired: `drizzle-kit` is a devDependency and
  `drizzle.config.ts` exists, but no `drizzle-orm` runtime dependency is
  installed, its target schema file doesn't exist, and `drizzle/` is
  empty. The strings `postgresql` / `drizzle-orm` you'll see in
  `src/lib/skill-data.ts`, `badges.ts`, `LearningPaths.tsx`, and
  `OnboardingModal.tsx` are skill-tree content (topics the app teaches
  about), not evidence the app itself uses them.

## Documentation

Version-matched Next.js docs are bundled locally in
`node_modules/next/dist/docs/`, always accurate for the installed version.
