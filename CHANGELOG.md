# Changelog

All notable changes to the Skill Mapper project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1](https://github.com/forbiddenlink/skill-mapper/compare/v1.1.0...v1.1.1) (2026-09-06)


### Bug Fixes

* **security:** pin browserslist off the open HIGH advisories ([#103](https://github.com/forbiddenlink/skill-mapper/issues/103)) ([07fcfe5](https://github.com/forbiddenlink/skill-mapper/commit/07fcfe542b35bfc4dc54782c238d4444a5d4064f))
* **seo:** point robots and sitemap at the real production alias ([#101](https://github.com/forbiddenlink/skill-mapper/issues/101)) ([07dff0d](https://github.com/forbiddenlink/skill-mapper/commit/07dff0dfd99a23d62297d9cf18ebef5ffc7b353b))

## [1.1.0](https://github.com/forbiddenlink/skill-mapper/compare/v1.0.3...v1.1.0) (2026-09-01)


### Features

* **showcase:** add the /showcase landing page and demo loop ([#81](https://github.com/forbiddenlink/skill-mapper/issues/81)) ([87ee69d](https://github.com/forbiddenlink/skill-mapper/commit/87ee69d0709dacdc0ea222016bcb9fa180dd89bd))


### Bug Fixes

* **build:** resync pnpm lockfile with the package.json overrides block ([#86](https://github.com/forbiddenlink/skill-mapper/issues/86)) ([ac303af](https://github.com/forbiddenlink/skill-mapper/commit/ac303afe44c9e9cb9ae1fc0f1cf1f3aca02e3b34))

## [1.0.3](https://github.com/forbiddenlink/skill-mapper/compare/v1.0.2...v1.0.3) (2026-08-29)


### Bug Fixes

* **deps:** honour resolution overrides and patch transitive vulnerabilities ([#78](https://github.com/forbiddenlink/skill-mapper/issues/78)) ([1832343](https://github.com/forbiddenlink/skill-mapper/commit/1832343eab9588be14f8e56e1f417ac042af67a3))

## [1.0.2](https://github.com/forbiddenlink/skill-mapper/compare/v1.0.1...v1.0.2) (2026-08-29)


### Bug Fixes

* **deps:** bump next to 16.3.3 for AVIF image RCE ([#76](https://github.com/forbiddenlink/skill-mapper/issues/76)) ([0d4815d](https://github.com/forbiddenlink/skill-mapper/commit/0d4815d6679505159e6ca960480ba7a5d60a8a9e))

## [1.0.1](https://github.com/forbiddenlink/skill-mapper/compare/v1.0.0...v1.0.1) (2026-08-29)


### Bug Fixes

* **lint:** suppress set-state-in-effect for client-only hydration gates ([#68](https://github.com/forbiddenlink/skill-mapper/issues/68)) ([a0fe3d8](https://github.com/forbiddenlink/skill-mapper/commit/a0fe3d8842783f6e94ec5312697174bc66d722a2))

## 1.0.0 (2026-08-16)


### Features

* add complete Skill Mapper application with gamification, skill tree, and documentation ([132c134](https://github.com/forbiddenlink/skill-mapper/commit/132c13429f2afd2f789e902ef612728fd7396aa1))
* add massive content expansion ([3591595](https://github.com/forbiddenlink/skill-mapper/commit/35915951c08a7ec8bf86552520c0314c19a49192))
* AI-powered recommendations + custom branding ([c427f64](https://github.com/forbiddenlink/skill-mapper/commit/c427f645697002331604f72823b7c2889b67c3d7))
* background category music with HUD toggle ([dc884e6](https://github.com/forbiddenlink/skill-mapper/commit/dc884e6db43959fa4dc60f9a32349c56fa459745))
* complete session loop, persist bosses, and expand CS/data content ([2c0acf5](https://github.com/forbiddenlink/skill-mapper/commit/2c0acf5e054e5357d75b192e02e73739f91ff05e))
* **design:** introduce Signal Atlas system ([f03fb19](https://github.com/forbiddenlink/skill-mapper/commit/f03fb19fcd70e3e6906514753b3d5e03ad21d419))
* **design:** restyle mode UIs to Signal Atlas ([8c2467f](https://github.com/forbiddenlink/skill-mapper/commit/8c2467f3a77386b83627e4a5ff1f2e22fc6747e1))
* documentation overhaul, accessibility fixes, and test improvements ([78812b1](https://github.com/forbiddenlink/skill-mapper/commit/78812b1fd45ca3b293bbf3deb5d67e3ee0f36bbb))
* enhance branding assets and fix UI/metadata issues ([6c9648c](https://github.com/forbiddenlink/skill-mapper/commit/6c9648c8eb3f6c12975acce45db3e3a328af6a20))
* harden product loop, expand skills, and clean Next/proxy debt ([c4aa339](https://github.com/forbiddenlink/skill-mapper/commit/c4aa339ad6d5801c3f9dcdf8fe6ea74be8ec9850))
* IndexedDB persist, undo/redo, shields, and share card ([8f3287e](https://github.com/forbiddenlink/skill-mapper/commit/8f3287e43859f9b75a656690c602e28028c756fa))
* massive content expansion and engagement features ([bb55673](https://github.com/forbiddenlink/skill-mapper/commit/bb55673694d2a798dc89c062d68b25fb81bf837d))
* play generated victory jingle on skill mastery ([5b53d65](https://github.com/forbiddenlink/skill-mapper/commit/5b53d65d76ea2e3717acfc44b0bc18b1c412eeae))
* **sentry:** add missing runtime init files ([f89c8e3](https://github.com/forbiddenlink/skill-mapper/commit/f89c8e3ba3c3d7fe27ef4a595a82414e548f922b))
* skill-constellation visual system ([5228f56](https://github.com/forbiddenlink/skill-mapper/commit/5228f56d8002813def64c88d5758544ccdcb496c))


### Bug Fixes

* add drizzle-kit dependency ([3d6ae89](https://github.com/forbiddenlink/skill-mapper/commit/3d6ae8939705863792deb54610bcc2cbd4fbdf17))
* add maxDuration to TriggerConfig (resolve merge conflicts) ([07fb521](https://github.com/forbiddenlink/skill-mapper/commit/07fb5217ffd8da3c38aa45c640646a63ee82c93e))
* add missing @vercel/analytics and @vercel/speed-insights packages ([d988dc1](https://github.com/forbiddenlink/skill-mapper/commit/d988dc13e8f9022759288aa51a436b99578e32a9))
* cap cookie override below v2 to prevent @supabase/ssr build break ([6ebbca9](https://github.com/forbiddenlink/skill-mapper/commit/6ebbca96d210fd09382454b76d38314c6aff4847))
* **deps:** add pnpm-workspace overrides for security patches ([138f9d2](https://github.com/forbiddenlink/skill-mapper/commit/138f9d26ebf581b063e86ae29de2baff6c982983))
* **deps:** clear high CVEs via same-major overrides ([c0ecf37](https://github.com/forbiddenlink/skill-mapper/commit/c0ecf3717d77fb4bf7ef6ea3b9d2b9fd3eb14144))
* env.ts import, sentry paths, MSW types, safe-action api ([b769ca8](https://github.com/forbiddenlink/skill-mapper/commit/b769ca88d557f0e01c35d0d4aca65b63a6eb05a7))
* **lint:** scope ajv override so eslint+eslintrc keep ajv@^6 ([b229b70](https://github.com/forbiddenlink/skill-mapper/commit/b229b70c1dc9866b16932f7d207b7f18cbf02a29))
* patch 14 security vulnerabilities ([1cb6d9b](https://github.com/forbiddenlink/skill-mapper/commit/1cb6d9beba2080844bfc48f45a5ac529dd684a61))
* regenerate npm lockfile ([c6bfcce](https://github.com/forbiddenlink/skill-mapper/commit/c6bfcceeb43be120a6cfca914e34b342be63b9d9))
* remove unavailable socketsecurity/socket-action from security workflow ([f444228](https://github.com/forbiddenlink/skill-mapper/commit/f444228f2471207f9b2a1ea3b06f359215b119c2))
* resolve build errors ([4e593e1](https://github.com/forbiddenlink/skill-mapper/commit/4e593e1ce7ecfd1f7a3ca30080a6886f771f509e))
* resolve React hooks error crashing skill completion ([97fa688](https://github.com/forbiddenlink/skill-mapper/commit/97fa68815e76d1bfb55b5d25d5f768925ba25315))
* resolve Vercel build errors ([8ef2329](https://github.com/forbiddenlink/skill-mapper/commit/8ef23290003ca73d0a46eddac5a6572fce6a0479))
* resolve Vercel deployment dependency conflicts ([d6f1174](https://github.com/forbiddenlink/skill-mapper/commit/d6f1174c4c476d0ff298c7301e2dbf556da8c46d))
* resolve z-index layering bug and improve code quality (v1.0.1) ([a984379](https://github.com/forbiddenlink/skill-mapper/commit/a984379dbb3ae1d849dbec3a2a666e087bc6908a))
* restore CI green on main ([#54](https://github.com/forbiddenlink/skill-mapper/issues/54)) ([5158c17](https://github.com/forbiddenlink/skill-mapper/commit/5158c17d44a833b779c310a4d5bdac90c013302c))
* **security:** pin transitive deps to patched versions (Dependabot high alerts) ([3bf1b35](https://github.com/forbiddenlink/skill-mapper/commit/3bf1b353413c3346a6ba5aebdb578f00435ba354))
* upgrade @testing-library/react to v16 for React 19 compatibility ([f9a2b61](https://github.com/forbiddenlink/skill-mapper/commit/f9a2b617da9029fc567a19390bbf5abab44c160d))
* Vercel build fixes ([b8c161e](https://github.com/forbiddenlink/skill-mapper/commit/b8c161ea4569d52a2999b55702b94d4259d856e3))

## [1.0.1] - 2026-02-12

### 🔧 Bug Fixes & Code Quality

#### Critical Fixes
- **Fixed Z-Index Layering Bug**: Floating action buttons were being blocked by AI Recommendations panel
  - Increased z-index from `z-40` to `z-50` for Analytics, Stats, and Keyboard Shortcuts buttons
  - Resolved test failures and UI interactivity issues
- **Fixed Multiple Import Statements**: Consolidated duplicate imports in `skills-store.ts`
- **Reduced Function Nesting**: Refactored `unlockBatch` function to reduce complexity
  - Extracted `checkPrereqsMet` helper function
  - Improved code readability and maintainability

#### Code Quality Improvements
- **Enhanced Error Handling**: 
  - Wrapped IndexedDB errors in proper Error objects
  - Improved error messages throughout the codebase
  - Fixed try-catch patterns in E2E tests
- **Type Safety**: 
  - Changed `any` to `unknown` for safer type handling
  - Applied `Readonly<>` to component props
  - Fixed return type annotations
- **Performance**: 
  - Replaced `JSON.parse(JSON.stringify())` with `structuredClone()`
  - Used nullish coalescing operator (`??=`)
- **React Best Practices**:
  - Fixed array index keys in KeyboardShortcutsModal and StatsPanel
  - Used proper unique identifiers for list items

#### Test Results
- Improved E2E test pass rate from 73% to 82%
- Fixed 2 critical UI interaction tests (Analytics and Stats buttons)
- Build verification: ✅ All checks passing

**Files Modified:**
- `src/components/AnalyticsDashboard.tsx`
- `src/components/StatsPanel.tsx`
- `src/components/KeyboardShortcutsModal.tsx`
- `src/lib/stores/skills-store.ts`
- `src/lib/stores/undo-redo-store.ts`
- `src/lib/indexeddb.ts`
- `e2e/skill-mapper.spec.ts`

## [1.0.0] - 2026-02-11

### 🚀 Major Release - Production Ready

Complete overhaul with performance optimizations, PWA support, comprehensive testing, and accessibility improvements.

### Added - Phase 3 (Production & PWA)

#### Progressive Web App (PWA)
- **Service Worker Integration** via next-pwa 5.6
- **Offline Support** with intelligent caching strategies
  - Google Fonts: 1 year cache
  - Static assets: 7 days cache  
  - Images: 24 hours cache
  - API calls: 5 minutes with network-first fallback
- **PWA Manifest** with theme colors and display modes
- **Install Prompts** for mobile and desktop
- **Icon Generation Script** for all required sizes (72px-512px)
- **Standalone Mode** runs as native-like app

#### Data & Storage
- **IndexedDB Integration** replacing localStorage for robust data persistence
  - 50MB+ capacity (vs 5MB localStorage)
  - Async operations (non-blocking UI)
  - Structured queries and indexes
  - Full offline support
- **Migration Utilities** automatic localStorage → IndexedDB migration
- **Undo/Redo System** with history management (50-entry circular buffer)
  - Keyboard shortcuts: Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z
  - State snapshots at key actions
  - Memory-efficient circular buffer

#### Analytics & Insights
- **Analytics Dashboard** comprehensive learning metrics
  - Learning velocity tracking (skills/week graphs)
  - Category breakdown visualization
  - Recent activity timeline
  - Streak tracking display
  - Keyboard shortcut: `Shift + A`
- **Performance Monitoring Hook** tracks render times and state updates

#### Gamification Enhancements
- **Milestone Celebrations** with confetti effects
  - Level milestones (every 5 levels) - Epic 3D confetti
  - Skill milestones (5, 10, 25, 50, 75, 100) - Fireworks effect
  - Badge milestones (every 3 badges) - Star burst
- **Enhanced Badge System** real-time validation and notifications

#### Testing Infrastructure
- **Playwright E2E Tests** comprehensive test suite
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Mobile viewport testing (iPhone, Android)
  - Accessibility testing with @axe-core/playwright
  - Skill tree interaction tests
  - Modal and navigation tests
- **GitHub Actions CI/CD Pipeline** 7-stage automation
  1. Lint (ESLint)
  2. Type Check (TypeScript strict mode)
  3. Unit Tests (Vitest with coverage)
  4. E2E Tests (Playwright multi-browser)
  5. Build (Production validation)
  6. Lighthouse (Performance auditing, 90+ target)
  7. Deploy Preview (Optional)
- **Lighthouse Integration** automated performance monitoring

#### Accessibility (WCAG 2.1 AA)
- **Live Regions** for screen reader announcements
  - Polite announcements for XP gains
  - Assertive announcements for level ups and badges
  - Real-time progress updates
- **Comprehensive ARIA Labels** on all interactive elements
- **Keyboard Navigation Enhancements**
  - Full keyboard-only interaction support
  - Visible focus indicators (2px cyan ring)
  - Modal focus traps
- **Color Contrast Compliance** all text meets 4.5:1 ratio

### Enhanced - Phase 3

#### Performance Optimizations
- **Modular Zustand Architecture** split into 4 focused stores
  - `skills-store.ts` - Skill tree state (nodes, edges)
  - `user-store.ts` - User progress (XP, badges, streak)
  - `ui-store.ts` - UI preferences (theme, sound)
  - `undo-redo-store.ts` - History management
- **useShallow Pattern** 40-60% reduction in unnecessary re-renders
  - Applied to all array/object subscriptions
  - Selective state updates only when data changes
- **React.memo Optimization** memoized expensive components
  - CustomNode (3D tilt calculations)
  - ParticleEdge (SVG animations)
  - SkillDetailsPanel (rich content)
- **Code Splitting** lazy-loaded heavy components
  - AnalyticsDashboard: ~50KB saved from initial bundle
  - Dynamic imports with loading states
- **Bundle Size Optimization**
  - Initial load: ~150KB gzipped (from ~200KB)
  - Tree-shaking enabled
  - Webpack mode for PWA compatibility

#### Documentation
- **Comprehensive README.md** professional 14-section guide
  - Feature overview with badges
  - Installation and setup
  - Complete architecture documentation
  - Testing instructions
  - Performance metrics
  - Roadmap and contribution guidelines
- **Updated ARCHITECTURE.md** 13-section technical deep dive
  - Modular store architecture
  - PWA implementation details
  - Performance optimization strategies
  - Accessibility compliance guide
  - Testing strategy and CI/CD
  - Security considerations
  - Troubleshooting guide
- **PWA_ICONS.md** icon generation guide
- **Project Structure** detailed file organization documentation

#### Build & Development
- **Webpack Mode** required for next-pwa (not Turbopack)
- **TypeScript  Strict Mode** enhanced type safety
  - Fixed all strict mode violations
  - useEffect return type compliance
  - Undefined checks for array access
- **Build Scripts** updated for PWA support
- **Development Workflow** streamlined with clear guidelines

### Fixed - Phase 3
- **TypeScript Compilation Errors** resolved all strict mode violations
  - useEffect return type errors (3 hooks)
  - Undefined checks for history access (undo/redo)
  - Unused parameter warnings
  - React Flow type incompatibilities
- **Build Process** fixed webpack/Turbopack conflicts
- **PWA Configuration** proper next.config.ts setup
- **Service Worker** generation and caching strategies
- **Type Declarations** added next-pwa module types

### Changed - Phase 3
- **State Management** from monolithic to modular stor architecture
- **Data Persistence** from localStorage to IndexedDB
- **Build Mode** from Turbopack to webpack (for PWA)
- **Testing Infrastructure** added comprehensive E2E coverage
- **Documentation** complete rewrite for production quality

### Removed - Phase 3
- **Incomplete Storybook Setup** removed unfinished integration
- **Invalid React Flow Props** removed ariaLabelConfig (not supported)
- **Unused Variables** cleaned up across all files

## [Unreleased] - Phase 2 (Previous)

### Added - Phase 2 (Advanced Features)
- **Toast Notification System** - Beautiful animated notifications replacing browser alerts
- **Keyboard Shortcuts Manager** - Comprehensive keyboard shortcut system with help modal
- **Stats Dashboard** - Detailed progress visualization with charts and metrics
- **Local Storage Hook** - Safe localStorage management with error handling
- **Development Guide** - Complete `DEVELOPMENT.md` for contributors
- **GitHub Templates** - PR and issue templates for better collaboration
- **Prettier Configuration** - Consistent code formatting rules
- **Keyboard Shortcuts Help Modal** - Discoverable shortcuts (Shift + ?)

### Added - Phase 1 (Foundation)
- Error Boundary component for graceful error handling
- Loading spinner and skeleton components for better UX
- Comprehensive utility functions library (`src/lib/utils.ts`)
- Analytics tracking hook (`use-analytics.ts`)
- Performance monitoring hooks (`use-performance.ts`)
- Configuration management system (`src/lib/config.ts`)
- Additional unit tests for utils and store
- Mobile responsiveness improvements across components
- Inline documentation and JSDoc comments
- CHANGELOG.md for tracking project changes

### Enhanced
- HUD now uses toast notifications for save/load feedback
- Added stats button and keyboard shortcuts button to UI
- Improved accessibility with better keyboard navigation
- Enhanced developer experience with comprehensive documentation

### Fixed
- TypeScript compilation errors in ChallengeModal component
- Invalid Tailwind CSS classes (z-100, min-h-50, bg-linear-to-r)
- JSX syntax error with inline comments
- TypeScript return type errors in hooks

### Changed
- Improved mobile responsiveness in HUD and SkillDetailsPanel
- Enhanced type safety with better interface documentation
- Updated store to use centralized configuration
- Refactored ChallengeModal for cleaner code structure
- Replaced browser alerts with elegant toast notifications

### Performance
- Added memoization to prevent unnecessary re-renders
- Implemented debounce and throttle utilities
- Added performance monitoring capabilities

## [0.1.0] - 2026-01-06

### Added
- Initial release of Skill Mapper
- Interactive skill tree with React Flow
- Gamification system (XP, levels, badges, streaks)
- Challenge quiz system
- Local storage persistence
- Sound effects with Web Audio API
- Onboarding modal for new users
- Import/Export progress functionality
- Keyboard navigation support
- Cyberpunk-themed UI design

### Features
- 25+ predefined skills across 5 tiers
- Badge system with achievements
- Skill decay mechanism
- Prerequisite-based unlocking
- Real-time progress tracking
- Responsive animations with Framer Motion
