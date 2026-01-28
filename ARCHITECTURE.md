# Skill Mapper Architecture

## Overview

Skill Mapper is a gamified learning platform built with modern web technologies, focusing on performance, maintainability, and user experience.

## Technology Stack

### Core
- **Next.js 16.1** - React framework with App Router for server and client components
- **React 19.2** - UI library with latest concurrent features
- **TypeScript 5** - Static type checking with strict mode enabled

### State Management
- **Zustand 5.0** - Lightweight state management with persistence middleware
- **Local Storage** - Client-side data persistence

### UI & Visualization
- **React Flow 11.11** - Node-based graph for skill tree visualization
- **Framer Motion 12.24** - Animation library for smooth transitions
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React 0.562** - Icon library

### Audio
- **Web Audio API** - Native browser API for sound synthesis (no external files needed)

## Architecture Patterns

### Component Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── skill-tree/        # Skill tree related components
│   ├── ui/                # Reusable UI components
│   └── modals/            # Modal dialogs
├── lib/                   # Business logic & utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── test/                  # Test files
```

### State Management Design

We use Zustand for its simplicity and performance. The store is split into logical sections:

1. **Skill State** - Nodes, edges, and skill progression
2. **User State** - XP, level, badges, streak
3. **UI State** - Selected skill, sound preferences

**Key Performance Optimizations:**
- Shallow comparison for arrays (`useGameStore(state => state.nodes, shallow)`)
- Atomic selectors to prevent unnecessary re-renders
- Memoized components (`React.memo`)

### React Flow Integration

**Node Types:**
- `CustomNode` - Individual skill cards with 3D tilt effects

**Edge Types:**
- `ParticleEdge` - Animated connections with SVG particles

**Performance Considerations:**
- Nodes and edges are memoized
- Position calculations use Dagre layout algorithm
- Custom node types avoid inline style objects

### Data Flow

```
User Action → Zustand Store → React Flow Updates → UI Re-render
     ↓
Local Storage Persistence
```

## Key Features

### 1. Skill Progression System

Skills have 5 states:
- **Locked** - Prerequisites not met
- **Available** - Ready to unlock
- **In Progress** - Currently learning
- **Mastered** - Completed successfully
- **Decayed** - Not practiced recently

### 2. Gamification

- **XP System**: 1000 XP per level
- **Badges**: Unlocked by mastering skill combinations
- **Streaks**: Daily visit tracking
- **Challenges**: Quiz-based skill verification

### 3. Persistence

- Auto-save to localStorage via Zustand middleware
- Import/Export functionality for backup
- Version tracking for save file compatibility

## Performance Optimizations

### Applied Optimizations

1. **React Flow Performance**
   - Memoized custom nodes and edges
   - Shallow equality checks for array state
   - Atomic Zustand selectors

2. **TypeScript Strict Mode**
   - `noUncheckedIndexedAccess`
   - `noImplicitOverride`
   - `noUnusedLocals`/`noUnusedParameters`

3. **Bundle Size**
   - Next.js 16 with Turbopack
   - Tree-shaking enabled
   - Dynamic imports for heavy components

4. **Rendering**
   - Framer Motion's `layoutId` for smooth transitions
   - CSS transforms for animations (GPU-accelerated)
   - Debounced position updates

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation (arrow keys)
- Screen reader support
- Focus management in modals
- Semantic HTML structure

## Testing Strategy

### Test Pyramid

1. **Unit Tests** - Individual component logic
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full user workflows (future)

### Tools
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM environment for tests

## Security Considerations

- CSP headers (to be implemented)
- Input validation on quiz answers
- Safe localStorage operations with error handling
- No sensitive data stored client-side

## Future Enhancements

### Planned Features
1. **Backend Integration**
   - User authentication
   - Cloud sync
   - Multi-device support

2. **Social Features**
   - Leaderboards
   - Shared progress
   - Community challenges

3. **Analytics**
   - Skill completion rates
   - Learning path optimization
   - User engagement metrics

4. **Content Management**
   - Admin dashboard
   - Dynamic skill creation
   - Resource management

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run type-check   # TypeScript checking
npm run lint         # ESLint
npm test            # Run tests
```

### Git Workflow
1. Feature branches from `main`
2. Pull requests with reviews
3. Automated checks (CI/CD - to be implemented)
4. Merge after approval

## Dependencies Management

### Core Dependencies
- Keep Next.js, React, and TypeScript up to date
- Monitor React Flow for breaking changes
- Regular security audits with `npm audit`

### Dev Dependencies
- Update testing libraries quarterly
- Keep ESLint and Prettier configs synchronized

## Performance Monitoring

### Metrics to Track
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Bundle size
- Re-render frequency

### Tools
- React DevTools Profiler
- Next.js Analytics
- Lighthouse CI (to be implemented)

## Deployment

### Build Process
```bash
npm run build        # Production build
npm start           # Start production server
```

### Environment Variables
- Use `.env.local` for local overrides
- Keep `.env.example` updated
- Never commit secrets

### Hosting Recommendations
- **Vercel** - Optimal for Next.js (automatic deployments)
- **Netlify** - Alternative with similar features
- **Docker** - For custom infrastructure

## Troubleshooting

### Common Issues

1. **TypeScript Errors After Update**
   - Run `npm run type-check`
   - Check new strict mode errors

2. **React Flow Performance**
   - Verify memoization on custom nodes
   - Check selector functions
   - Profile with React DevTools

3. **State Not Persisting**
   - Check localStorage availability
   - Verify Zustand persist middleware
   - Clear corrupted storage

## Code Style Guide

- Use functional components
- Prefer hooks over class components
- Keep components under 250 lines
- Extract complex logic to hooks
- Use TypeScript interfaces for props
- Document complex algorithms

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Flow Docs](https://reactflow.dev/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [Framer Motion API](https://www.framer.com/motion/)

---

Last Updated: January 2026
