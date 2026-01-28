# Changelog

All notable changes to the Skill Mapper project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
