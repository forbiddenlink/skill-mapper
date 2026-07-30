import { LucideIcon, Shield, Atom, Bot, Layers, Trophy, Accessibility } from 'lucide-react';

export interface Badge {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    requirements: string[]; // List of skill IDs required
}

export const BADGES: Badge[] = [
    {
        id: 'foundation-layer',
        label: 'Foundation Layer',
        description: 'Mastered the bedrock of the web (HTML, Git, JS).',
        icon: Shield,
        color: 'text-progress',
        requirements: ['web-standards', 'git-ops', 'es-next']
    },
    {
        id: 'react-pro',
        label: 'React Pro',
        description: 'Built a mastery of modern Frontend Engineering.',
        icon: Atom,
        color: 'text-signal',
        requirements: ['react-core', 'tailwind', 'typescript', 'state-machines']
    },
    {
        id: 'a11y-advocate',
        label: 'A11y Advocate',
        description: 'Ships inclusive interfaces with real accessibility craft.',
        icon: Accessibility,
        color: 'text-signal',
        requirements: ['accessibility', 'web-standards', 'react-core']
    },
    {
        id: 'backend-master',
        label: 'Backend Architect',
        description: 'Databases, APIs, and Server Runtimes are your playground.',
        icon: Layers,
        color: 'text-mastery',
        requirements: ['node-runtime', 'postgresql', 'drizzle-orm']
    },
    {
        id: 'ai-pioneer',
        label: 'AI Pioneer',
        description: 'Bridging the gap between software and intelligence.',
        icon: Bot,
        color: 'text-reward',
        requirements: ['llm-integration', 'rag-arch', 'vector-db']
    },
    {
        id: 'full-stack-hero',
        label: 'Full Stack Hero',
        description: 'You have conquered the entire core stack.',
        icon: Trophy,
        color: 'text-reward',
        requirements: [
            'web-standards', 'git-ops', 'es-next',
            'react-core', 'tailwind', 'typescript',
            'node-runtime', 'postgresql', 'drizzle-orm'
        ]
    }
];
