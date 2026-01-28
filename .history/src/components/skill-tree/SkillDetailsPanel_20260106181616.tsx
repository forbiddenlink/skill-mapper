'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ExternalLink, CheckCircle, RotateCcw, Play,
    FileText, Beaker, Video, BookOpen, MonitorPlay, BrainCircuit
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useGameSounds } from '@/hooks/use-game-sounds';
import ChallengeModal from '../ChallengeModal';
import { useState } from 'react';

// Helper for resource icons
const getResourceIcon = (type: string) => {
    switch (type) {
        case 'video': return <Video className="w-4 h-4" />;
        case 'article': return <BookOpen className="w-4 h-4" />;
        case 'paper': return <FileText className="w-4 h-4" />;
        case 'lab': return <Beaker className="w-4 h-4" />;
        case 'course': return <MonitorPlay className="w-4 h-4" />;
        default: return <ExternalLink className="w-4 h-4" />;
    }
};

export default function SkillDetailsPanel() {
    const selectedSkillId = useGameStore((state) => state.selectedSkillId);
    const nodes = useGameStore((state) => state.nodes);
    const selectSkill = useGameStore((state) => state.selectSkill);
    const unlockSkill = useGameStore((state) => state.unlockSkill);
    const completeSkill = useGameStore((state) => state.completeSkill);
    const refreshSkill = useGameStore((state) => state.refreshSkill);

    // Sounds & State
    const { playUnlock, playMastery, playClick, playHover } = useGameSounds();
    const [isChallengeOpen, setIsChallengeOpen] = useState(false);

    const skill = nodes.find((n) => n.id === selectedSkillId);

    const handleUnlock = () => {
        playUnlock();
        unlockSkill(skill!.id);
    };

    const handleComplete = () => {
        // Check if quiz exists
        if (skill?.data.quiz && skill.data.quiz.length > 0) {
            playClick();
            setIsChallengeOpen(true);
        } else {
            playMastery();
            completeSkill(skill!.id);
        }
    };

    const handleChallengeSuccess = () => {
        completeSkill(skill!.id);
        // Modal closes itself or we close it here? 
        // Modal calls onSuccess then onClose typically, but let's be safe
        setIsChallengeOpen(false);
    };

    const handleClose = () => {
        playClick();
        selectSkill(null);
    };

    if (!skill) return null;

    const { title, description, tier, status, resources, xpReward, quiz } = skill.data;
    const hasQuiz = quiz && quiz.length > 0;

    return (
        <>
            <AnimatePresence>
                {selectedSkillId && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 p-6 z-50 shadow-2xl flex flex-col"
                        role="dialog"
                        aria-labelledby="skill-title"
                        aria-describedby="skill-description"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] font-mono uppercase bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                    Tier: {tier}
                                </span>
                                <h2 id="skill-title" className="text-2xl font-display font-bold text-white mt-2 leading-tight">
                                    {title}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                                aria-label="Close skill details"
                            >
                                <X className="w-6 h-6 text-gray-400" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto space-y-6">
                            <p id="skill-description" className="text-gray-300 leading-relaxed border-l-2 border-neon-cyan pl-4">
                                {description}
                            </p>

                            <div className="bg-black/50 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-mono mb-1">Reward</div>
                                    <div className="text-neon-cyan font-display text-xl">{xpReward} XP</div>
                                </div>
                                {hasQuiz && (
                                    <div className="text-right">
                                        <div className="text-xs text-orange-500 uppercase font-mono mb-1">Challenge</div>
                                        <div className="text-orange-400 font-bold text-sm flex items-center gap-1 justify-end">
                                            <BrainCircuit size={14} /> Active
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Resources */}
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                                    Learning Uplink
                                </h3>
                                <div className="space-y-2">
                                    {resources.length > 0 ? resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onMouseEnter={() => playHover()}
                                            className="flex items-center gap-3 p-3 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors group border border-transparent hover:border-gray-700"
                                        >
                                            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center group-hover:bg-neon-cyan/10 group-hover:text-neon-cyan transition-colors text-gray-400">
                                                {getResourceIcon(res.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-200 font-medium group-hover:text-neon-cyan transition-colors line-clamp-1">{res.label}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{res.type}</div>
                                            </div>
                                        </a>
                                    )) : (
                                        <div className="text-gray-500 text-sm italic">No data feed connected.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            {status === 'available' && (
                                <button
                                    onClick={handleUnlock}
                                    className="w-full py-4 bg-neon-cyan text-black font-bold uppercase tracking-widest hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 rounded"
                                >
                                    <Play className="w-4 h-4" /> Start Learning
                                </button>
                            )}

                            {status === 'in-progress' && (
                                <button
                                    onClick={handleComplete}
                                    className={`w-full py-4 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded ${hasQuiz
                                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                                            : 'bg-electric-green text-black hover:bg-green-400'
                                        }`}
                                >
                                    {hasQuiz ? (
                                        <>
                                            <BrainCircuit className="w-4 h-4" /> Initialize Challenge
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Initialize Mastery
                                        </>
                                    )}
                                </button>
                            )}

                            {status === 'mastered' && (
                                <div className="text-center p-4 bg-plasma-pink/10 border border-plasma-pink/30 rounded text-plasma-pink font-mono text-sm">
                                    Skill Optimized
                                </div>
                            )}

                            {status === 'decayed' && (
                                <button
                                    onClick={() => refreshSkill(skill.id)}
                                    className="w-full py-4 bg-alert-red text-white font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2 rounded animate-pulse"
                                >
                                    <RotateCcw className="w-4 h-4" /> Repair Skill Node
                                </button>
                            )}

                            {status === 'locked' && (
                                <div className="text-center p-4 bg-gray-800 rounded text-gray-500 font-mono text-xs">
                                    Prerequisites Missing
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Quiz Modal */}
            {isChallengeOpen && skill && (
                <ChallengeModal
                    skillId={skill.id}
                    onClose={() => setIsChallengeOpen(false)}
                    onSuccess={handleChallengeSuccess}
                />
            )}
        </>
    );
}
