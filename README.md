# Skill Mapper

A gamified skill-tree learning platform: an interactive node graph (React Flow) where skills
unlock as you master their prerequisites, with XP, badges, streaks, and AI-powered
recommendations.

[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org/) [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/) [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Features

- **Interactive skill tree** — React Flow node graph with elkjs layout; skills unlock based on
  mastered prerequisites
- **Gamification** — XP and leveling, badges, daily streaks, optional skill decay, interactive
  quizzes
- **AI recommendations** — next-step, decay-prevention, category-balance, optimal-difficulty,
  and quick-win suggestions (Groq)
- **Analytics dashboard** — learning velocity, category breakdown, activity timeline
  (`Shift + A`)
- **Offline-first** — IndexedDB storage (not localStorage), PWA install, service worker caching
- **Accessible** — ARIA live regions, full keyboard navigation, axe-core in CI

See `docs/DESIGN.md` for the Signal Atlas design system this UI follows.

## Quickstart

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
pnpm build   # runs next-sitemap as a postbuild step
pnpm start
```

### PWA icons

PWA icons are not yet generated. Follow `docs/PWA_ICONS.md` before shipping the installable app.

## Stack

- Next.js 16, React 19, TypeScript 6, App Router
- Tailwind CSS 4
- Zustand for state, IndexedDB for client-side persistence (see the Gotchas note in `CLAUDE.md`
  about the half-wired Drizzle scaffolding — there is no server database)
- React Flow (`@xyflow/react`) + elkjs for the skill tree, Motion (`motion/react`, the renamed
  Framer Motion) for animation
- Arcjet, Upstash Redis, Sentry, Axiom, PostHog for rate limiting and observability
- Groq SDK for AI recommendations, Trigger.dev for background jobs
- Vitest + Testing Library, Playwright (with `@axe-core/playwright`), Storybook

Full stack, layout, and gotchas: see `CLAUDE.md`.

## Scripts

```bash
pnpm dev                # next dev
pnpm build              # next build (postbuild runs next-sitemap)
pnpm start              # next start
pnpm lint               # eslint
pnpm type-check         # tsc --noEmit
pnpm test               # vitest
pnpm test:coverage      # vitest --coverage
pnpm test:e2e           # playwright test
pnpm storybook          # storybook dev -p 6006
pnpm analyze            # ANALYZE=true next build
```

ESLint (`pnpm lint`) is the enforced linter. Biome and Prettier are also installed with their
own scripts (`pnpm biome:check`, `pnpm biome:fix`); check which a file you're touching follows.

## Skill tree structure

Skills are organized into tiers, defined in `src/lib/skill-data.ts`:

| Tier | Focus |
|------|-------|
| Foundation | Core fundamentals (web standards, Git, JavaScript, Python) |
| Frontend | UI development (React, TypeScript, Tailwind, state management) |
| Backend & Data | Server-side (Node.js, PostgreSQL, REST, GraphQL, ORMs) |
| AI Engineer | LLM integration, RAG, vector databases |
| Systems | Performance, security, DevOps, architecture |

Each skill has a title, description, prerequisites, XP reward, category, and an optional quiz.

### Adding a skill

Edit `src/lib/skill-data.ts`:

```typescript
{
  id: 'my-new-skill',
  type: 'skill',
  data: {
    id: 'my-new-skill',
    title: 'My New Skill',
    description: 'What you will learn',
    tier: 'foundation',
    category: 'frontend',
    status: 'locked',
    prerequisites: ['web-standards'],
    xpReward: 150,
    resources: [
      { label: 'Tutorial', url: 'https://...', type: 'course' }
    ],
    quiz: [
      {
        question: 'What is...?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1
      }
    ]
  }
}
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Arrow keys | Navigate between skills |
| Enter | Select/open skill details |
| Escape | Close panels and modals |
| Shift + ? | Show all keyboard shortcuts |
| Shift + A | Open analytics dashboard |
| Shift + S | Toggle sound effects |
| Ctrl/Cmd + Z | Undo last action |
| Ctrl/Cmd + Shift + Z | Redo action |

## Documentation

- [CLAUDE.md](CLAUDE.md) — stack, commands, layout, env vars, gotchas (the verified source of truth for agents)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and patterns
- [docs/DESIGN.md](docs/DESIGN.md) — the Signal Atlas design system
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — developer setup and workflow
- [docs/PWA_ICONS.md](docs/PWA_ICONS.md) — PWA icon generation guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) — version history

## Known limitations

- No backend or multi-user accounts; progress is local-first (IndexedDB) by design
- PWA icons are not yet generated (see `docs/PWA_ICONS.md`)

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run `pnpm test`, `pnpm type-check`, and `pnpm lint`
5. Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT. See [LICENSE](LICENSE).
