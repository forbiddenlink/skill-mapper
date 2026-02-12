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
    const masteredCount = nodes.filter(n => n.data.status === 'mastered').length;
    calculateRecommendations();
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
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-cyan-500/30 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-400">AI Recommendations</h3>
            <span className="ml-auto text-xs text-gray-400">{recommendations.length} suggested</span>
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
                  className={`group relative p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    isDecay ? 'bg-yellow-500/5' : ''
                  }`}
                  onClick={() => handleSkillClick(rec.skillId)}
                >
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRecommendation(rec.skillId);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                    aria-label="Dismiss recommendation"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                  
                  {/* Content */}
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`shrink-0 p-2 rounded-lg ${
                      isDecay ? 'bg-yellow-500/10' : 'bg-cyan-500/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isDecay ? 'text-yellow-400' : 'text-cyan-400'
                      }`} />
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {skill.data.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          isDecay 
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {reasonLabels[rec.reason]}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-1">
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
                              {Math.floor((Date.now() - skill.data.lastPracticedAt) / (1000 * 60 * 60 * 24))} days ago
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500" 
                       style={{ opacity: rec.priority / 100 }} 
                  />
                </motion.div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 text-xs text-gray-500 text-center">
            Personalized based on your progress
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
