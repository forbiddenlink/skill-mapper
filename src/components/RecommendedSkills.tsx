'use client';

import { useEffect } from 'react';
import { useGameStore, RecommendationReason } from '@/lib/store';
import { Sparkles, TrendingUp, Target, Zap, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reasonIcons: Record<RecommendationReason, typeof Sparkles> = {
  'next-step': Target,
  'decay-prevention': TrendingUp,
  'category-balance': Award,
  'optimal-difficulty': Zap,
  'quick-win': Sparkles,
};

const reasonLabels: Record<RecommendationReason, string> = {
  'next-step': 'Next Step',
  'decay-prevention': 'Refresh Skill',
  'category-balance': 'Diversify',
  'optimal-difficulty': 'Perfect Match',
  'quick-win': 'Quick Win',
};

const reasonDescriptions: Record<RecommendationReason, string> = {
  'next-step': 'Prerequisites met - ready to learn',
  'decay-prevention': 'Practice to maintain mastery',
  'category-balance': 'Explore a new category',
  'optimal-difficulty': 'Matches your current level',
  'quick-win': 'Easy skill for motivation boost',
};

export default function RecommendedSkills() {
  const nodes = useGameStore((state) => state.nodes);
  const recommendations = useGameStore((state) => state.recommendations);
  const calculateRecommendations = useGameStore((state) => state.calculateRecommendations);
  const dismissRecommendation = useGameStore((state) => state.dismissRecommendation);
  const selectSkill = useGameStore((state) => state.selectSkill);
  
  // Calculate recommendations on mount and when nodes change
  useEffect(() => {
    calculateRecommendations();
  }, [nodes.length, calculateRecommendations]);
  
  // Recalculate when skills are completed
  useEffect(() => {
    calculateRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.filter(n => n.data.status === 'mastered').length]);
  
  if (recommendations.length === 0) {
    return null;
  }
  
  const handleSkillClick = (skillId: string) => {
    selectSkill(skillId);
    // Scroll to skill tree (optional)
    const skillTree = document.querySelector('[data-skill-tree]');
    if (skillTree) {
      skillTree.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  return (
    <div className="fixed bottom-[9.5rem] right-14 z-30 hidden max-w-sm sm:block md:bottom-8 md:right-[5.5rem] lg:right-[6rem]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-strong overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-signal/25 bg-signal/10 px-4 py-3">
            <Sparkles className="h-5 w-5 text-signal" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-signal">Recommendations</h2>
            <span className="ml-auto font-mono text-xs text-text-muted">{recommendations.length} suggested</span>
          </div>
          
          {/* Recommendations List */}
          <div className="max-h-96 overflow-y-auto">
            {recommendations.map((rec, index) => {
              const skill = nodes.find(n => n.id === rec.skillId);
              if (!skill) return null;
              
              const Icon = reasonIcons[rec.reason];
              const isDecay = rec.reason === 'decay-prevention';
              
              return (
                <motion.div
                  key={rec.skillId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative cursor-pointer border-b border-white/10 p-4 transition-colors hover:bg-surface-3/40 ${
                    isDecay ? 'bg-reward/5' : ''
                  }`}
                  onClick={() => handleSkillClick(rec.skillId)}
                >
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRecommendation(rec.skillId);
                    }}
                    className="absolute top-2 right-2 rounded p-1 opacity-0 transition-opacity hover:bg-surface-3 group-hover:opacity-100"
                    aria-label="Dismiss recommendation"
                  >
                    <X className="h-3 w-3 text-text-muted" />
                  </button>
                  
                  {/* Content */}
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`shrink-0 rounded-[8px] border p-2 ${
                      isDecay ? 'border-reward/25 bg-reward/15' : 'border-signal/25 bg-signal/10'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        isDecay ? 'text-reward' : 'text-signal'
                      }`} />
                    </div>
                    
                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-foreground">
                          {skill.data.title}
                        </h3>
                        <span className={`rounded-[6px] px-2 py-0.5 font-mono text-[10px] uppercase ${
                          isDecay 
                            ? 'bg-reward/20 text-reward'
                            : 'bg-signal/20 text-signal'
                        }`}>
                          {reasonLabels[rec.reason]}
                        </span>
                      </div>
                      
                      <p className="mb-1 text-xs text-text-muted">
                        {reasonDescriptions[rec.reason]}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">{skill.data.category}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{skill.data.xpReward} XP</span>
                        {isDecay && skill.data.lastPracticedAt && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-yellow-400/60">
                              {/* eslint-disable-next-line react-hooks/purity -- Date.now() is intentional here: display-only relative time that re-reads on each render is correct behavior */}
                              {Math.floor((Date.now() - skill.data.lastPracticedAt) / (1000 * 60 * 60 * 24))} days ago
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority indicator */}
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-signal"
                       style={{ opacity: rec.priority / 100 }} 
                  />
                </motion.div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-white/10 bg-black/20 px-4 py-2 text-center text-xs text-text-muted">
            Personalized based on your progress
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
