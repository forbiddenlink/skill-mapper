import { LucideIcon, Shield, Atom, Bot, Layers, Trophy, Accessibility, Swords, Crown } from 'lucide-react';

export interface Badge {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
    requirements: string[]; // Skill IDs required. Empty = awarded by a boss battle, never by mastery.
}

/**
 * Badges awarded for a first boss clear (see BossBattles `unlocksBadge`). They
 * were granted before but had no catalog entry, so the badge toast had nothing
 * to show and the badge never rendered.
 */
const BOSS_BADGES: Badge[] = [
    { id: 'foundation-boss', label: 'Foundation Champion', description: 'Cleared the Foundation Master Challenge.', icon: Swords, color: 'text-progress', requirements: [] },
    { id: 'frontend-boss', label: 'Frontend Champion', description: 'Cleared the Frontend Engineering Battle.', icon: Swords, color: 'text-signal', requirements: [] },
    { id: 'backend-boss', label: 'Backend Champion', description: 'Cleared the Backend and Data Boss Fight.', icon: Swords, color: 'text-mastery', requirements: [] },
    { id: 'ai-boss', label: 'AI Champion', description: 'Cleared the AI Engineering Ultimate Challenge.', icon: Swords, color: 'text-reward', requirements: [] },
    { id: 'master-boss', label: 'Systems Grandmaster', description: 'Cleared the Systems and Architecture Final Boss.', icon: Crown, color: 'text-reward', requirements: [] },
];

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
    },
    ...BOSS_BADGES,
];
