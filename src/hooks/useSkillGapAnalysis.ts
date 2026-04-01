/**
 * useSkillGapAnalysis — AI-powered skill gap detection for skill-mapper.
 *
 * WHY ADDED: skill-mapper visualises skills as a graph but lacks analysis of
 * *where the gaps are*. This hook compares a developer's current skill set against
 * a target role's requirements and returns a prioritised gap list with learning
 * paths — using Groq (already in deps) for NLP-powered role matching.
 *
 * WHAT IT DOES:
 *  - Takes a list of current skills + a target role ("Senior Frontend Engineer")
 *  - Calls Groq to map skills to proficiency levels and identify gaps
 *  - Returns: missing skills, weak skills, recommended learning order, time estimate
 *  - Supports offline mode: falls back to a built-in role→skills dictionary
 *  - Caches results in localStorage to avoid repeat API calls for same inputs
 *
 * USAGE:
 *   const { analyze, gap, isAnalyzing } = useSkillGapAnalysis()
 *   await analyze(['React', 'TypeScript', 'CSS'], 'Senior Frontend Engineer')
 */

'use client';

import { useCallback, useState } from 'react';

export interface SkillNode {
  name: string;
  /** Learner's current proficiency 0–10 */
  proficiency: number;
  /** Whether this skill is required for the target role */
  required: boolean;
  /** Required proficiency for the target role */
  requiredProficiency: number;
  category: 'core' | 'tooling' | 'architecture' | 'soft' | 'domain';
}

export interface LearningPath {
  skill: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Estimated hours to reach required proficiency from current level */
  estimatedHours: number;
  /** Concrete resources or approaches (from AI or static fallback) */
  resources: string[];
}

export interface SkillGapReport {
  targetRole: string;
  overallReadiness: number; // 0–100 %
  missingSkills: string[];
  weakSkills: SkillNode[];
  strongSkills: SkillNode[];
  learningPaths: LearningPath[];
  /** Estimated total weeks to become ready */
  totalEstimatedWeeks: number;
  generatedAt: string;
}

// ── Built-in role → skills dictionary (offline fallback) ──────────────────

const ROLE_SKILLS: Record<
  string,
  Array<{ name: string; category: SkillNode['category']; required: number }>
> = {
  'senior frontend engineer': [
    { name: 'React', category: 'core', required: 8 },
    { name: 'TypeScript', category: 'core', required: 8 },
    { name: 'CSS/Tailwind', category: 'core', required: 7 },
    { name: 'Next.js', category: 'tooling', required: 7 },
    { name: 'Testing (Vitest/Jest)', category: 'tooling', required: 7 },
    { name: 'Web Performance', category: 'architecture', required: 7 },
    { name: 'Accessibility (a11y)', category: 'core', required: 6 },
    { name: 'State Management', category: 'architecture', required: 7 },
    { name: 'CI/CD', category: 'tooling', required: 6 },
    { name: 'System Design', category: 'architecture', required: 6 },
  ],
  'fullstack engineer': [
    { name: 'React', category: 'core', required: 7 },
    { name: 'TypeScript', category: 'core', required: 8 },
    { name: 'Node.js', category: 'core', required: 7 },
    { name: 'SQL/Postgres', category: 'core', required: 7 },
    { name: 'REST/GraphQL APIs', category: 'architecture', required: 7 },
    { name: 'Docker', category: 'tooling', required: 6 },
    { name: 'Authentication', category: 'architecture', required: 7 },
    { name: 'Cloud (AWS/GCP)', category: 'tooling', required: 5 },
    { name: 'Testing', category: 'tooling', required: 7 },
  ],
  'backend engineer': [
    { name: 'Node.js / Python / Go', category: 'core', required: 8 },
    { name: 'SQL/Postgres', category: 'core', required: 8 },
    { name: 'Redis', category: 'tooling', required: 7 },
    { name: 'REST API Design', category: 'architecture', required: 8 },
    { name: 'Authentication/Auth', category: 'architecture', required: 7 },
    { name: 'Observability/Logging', category: 'tooling', required: 6 },
    { name: 'Docker/Kubernetes', category: 'tooling', required: 6 },
    { name: 'Message Queues', category: 'architecture', required: 6 },
    { name: 'Database Optimisation', category: 'core', required: 7 },
  ],
};

function normRole(role: string): string {
  return role.toLowerCase().trim();
}

function buildOfflineReport(currentSkills: string[], targetRole: string): SkillGapReport {
  const roleKey = normRole(targetRole);
  const roleTemplate = ROLE_SKILLS[roleKey] ?? ROLE_SKILLS['senior frontend engineer'];

  const currentSet = new Set(currentSkills.map((s) => s.toLowerCase()));

  const nodes: SkillNode[] = roleTemplate.map((req) => {
    const has = currentSet.has(req.name.toLowerCase());
    return {
      name: req.name,
      proficiency: has ? 6 : 0,
      required: true,
      requiredProficiency: req.required,
      category: req.category,
    };
  });

  const missing = nodes.filter((n) => n.proficiency === 0).map((n) => n.name);
  const weak = nodes.filter((n) => n.proficiency > 0 && n.proficiency < n.requiredProficiency);
  const strong = nodes.filter((n) => n.proficiency >= n.requiredProficiency);

  const overallReadiness = Math.round((strong.length / nodes.length) * 100);

  const learningPaths: LearningPath[] = [
    ...missing.slice(0, 3).map((s) => ({
      skill: s,
      priority: 'critical' as const,
      estimatedHours: 40,
      resources: [
        `Search: "${s} for ${targetRole}" on roadmap.sh`,
        `Practice: build a project using ${s}`,
      ],
    })),
    ...weak.slice(0, 3).map((n) => ({
      skill: n.name,
      priority: 'high' as const,
      estimatedHours: Math.round((n.requiredProficiency - n.proficiency) * 8),
      resources: [
        `Deepen ${n.name} with advanced patterns`,
        `Read official docs for latest ${n.name} features`,
      ],
    })),
  ];

  const totalEstimatedWeeks = Math.ceil(
    learningPaths.reduce((sum, p) => sum + p.estimatedHours, 0) / 20
  );

  return {
    targetRole,
    overallReadiness,
    missingSkills: missing,
    weakSkills: weak,
    strongSkills: strong,
    learningPaths,
    totalEstimatedWeeks,
    generatedAt: new Date().toISOString(),
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────

interface UseSkillGapAnalysisReturn {
  analyze: (currentSkills: string[], targetRole: string) => Promise<void>;
  gap: SkillGapReport | null;
  isAnalyzing: boolean;
  error: string | null;
}

export function useSkillGapAnalysis(): UseSkillGapAnalysisReturn {
  const [gap, setGap] = useState<SkillGapReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (currentSkills: string[], targetRole: string) => {
    if (!targetRole.trim() || currentSkills.length === 0) return;

    const cacheKey = `skill-gap:${targetRole.toLowerCase()}:${currentSkills.join(',')}`;

    // Check cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as SkillGapReport;
        // Expire after 24h
        if (Date.now() - new Date(parsed.generatedAt).getTime() < 86_400_000) {
          setGap(parsed);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Try AI-powered analysis
      const res = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSkills, targetRole }),
      });

      if (!res.ok) throw new Error('AI analysis unavailable');

      const report: SkillGapReport = await res.json();

      try {
        localStorage.setItem(cacheKey, JSON.stringify(report));
      } catch {
        /* storage full */
      }

      setGap(report);
    } catch {
      // Graceful offline fallback
      const report = buildOfflineReport(currentSkills, targetRole);
      setGap(report);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyze, gap, isAnalyzing, error };
}
