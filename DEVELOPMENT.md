# Development Guide

Welcome to the Skill Mapper development guide! This document will help you get started with contributing to the project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skill-mapper.git
cd skill-mapper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Type Checking

```bash
npm run type-check
```

### 5. Run Tests

```bash
npm test
```

---

## Project Structure

```
skill-mapper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── skill-tree/         # Skill tree specific components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── ChallengeModal.tsx  # Quiz modal
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-game-sounds.ts
│   │   ├── use-analytics.ts
│   │   ├── use-performance.ts
│   │   └── ...
│   ├── lib/                    # Business logic & utilities
│   │   ├── store.ts            # Zustand state management
│   │   ├── skill-data.ts       # Skill tree data
│   │   ├── badges.ts           # Badge definitions
│   │   ├── config.ts           # App configuration
│   │   └── utils.ts            # Utility functions
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   └── test/                   # Test files
│       ├── setup.ts
│       ├── utils.test.ts
│       └── store.test.ts
├── public/                     # Static assets
├── ARCHITECTURE.md             # Architecture documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── DEVELOPMENT.md              # This file
└── ...config files

```

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if used)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Workflow Steps

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test Your Changes**
   ```bash
   npm run type-check
   npm test
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add skill search functionality
fix: resolve TypeScript error in HUD component
docs: update README with new features
refactor: improve store performance with memoization
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (`strict: true` in tsconfig.json)
- Use interfaces for objects, types for unions
- Add JSDoc comments for public APIs

**Example:**
```typescript
/**
 * Calculate percentage with optional decimal precision
 * @param value - The current value
 * @param total - The total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Percentage as a number
 */
export function calculatePercentage(
    value: number,
    total: number,
    decimals = 0
): number {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
}
```

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use `'use client'` directive for client components
- Keep components under 250 lines

**Example:**
```typescript
'use client';

import { useState } from 'react';

export default function MyComponent() {
    const [count, setCount] = useState(0);
    
    return (
        <button onClick={() => setCount(count + 1)}>
            Count: {count}
        </button>
    );
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use custom CSS variables for theme colors
- Avoid inline styles

**Example:**
```tsx
<div className="p-4 md:p-6 bg-gray-900 border border-neon-cyan rounded-lg">
    {/* Content */}
</div>
```

---

## Testing

### Unit Tests

We use **Vitest** for unit testing.

**Running Tests:**
```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

**Writing Tests:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculatePercentage } from '@/lib/utils';

describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
        expect(calculatePercentage(50, 200)).toBe(25);
    });
    
    it('should handle zero total', () => {
        expect(calculatePercentage(50, 0)).toBe(0);
    });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
    it('should render correctly', () => {
        render(<MyComponent />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
});
```

---

## Common Tasks

### Adding a New Skill

1. Open `src/lib/skill-data.ts`
2. Add your skill to the `RAW_SKILLS` array:

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

### Adding a New Badge

1. Open `src/lib/badges.ts`
2. Import your icon from `lucide-react`
3. Add your badge:

```typescript
{
    id: 'my-badge',
    label: 'Badge Name',
    description: 'How to earn this badge',
    icon: YourIcon,
    color: 'text-blue-400',
    requirements: ['skill-1', 'skill-2']
}
```

### Adding a New Component

1. Create file in appropriate directory
2. Use TypeScript and follow naming conventions
3. Add JSDoc comments
4. Export as default or named export

```typescript
'use client';

/**
 * My new component description
 */
export default function MyComponent() {
    return <div>Content</div>;
}
```

### Adding a New Utility Function

1. Open `src/lib/utils.ts` (or create new utility file)
2. Add function with JSDoc comments
3. Write tests in `src/test/`

---

## Troubleshooting

### Common Issues

**Issue: TypeScript errors after `npm install`**
```bash
npm run type-check
# Fix any type errors shown
```

**Issue: Tests failing**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

**Issue: Hot reload not working**
- Check if you're editing the right file
- Restart the dev server
- Clear browser cache

---

## Contributing

### Before Submitting a PR

- [ ] Code follows the style guide
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR description explains changes

### PR Review Process

1. Submit PR with clear description
2. Wait for automated checks to pass
3. Address reviewer feedback
4. Get approval from maintainer
5. PR will be merged to main

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Flow Documentation](https://reactflow.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Getting Help

- Open an issue on GitHub
- Check existing issues for solutions
- Ask in discussions
- Read the documentation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy coding! 🚀
