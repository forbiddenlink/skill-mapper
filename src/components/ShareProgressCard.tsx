'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, Copy, Check } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useDialogA11y } from '@/hooks/use-dialog-a11y';
import { calculateSkillStats } from '@/lib/gamification';

function formatXp(xp: number) {
  return new Intl.NumberFormat('en-US').format(xp);
}

export default function ShareProgressCard() {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    nodes,
    userXP,
    userLevel,
    streak,
    unlockedBadges,
    getLevelInfo,
    sharePromptOpen,
    sharePromptReason,
    openSharePrompt,
    closeSharePrompt,
  } = useGameStore(
    useShallow((s) => ({
      nodes: s.nodes,
      userXP: s.userXP,
      userLevel: s.userLevel,
      streak: s.streak,
      unlockedBadges: s.unlockedBadges,
      getLevelInfo: s.getLevelInfo,
      sharePromptOpen: s.sharePromptOpen,
      sharePromptReason: s.sharePromptReason,
      openSharePrompt: s.openSharePrompt,
      closeSharePrompt: s.closeSharePrompt,
    }))
  );

  const dialogRef = useDialogA11y<HTMLDivElement>(sharePromptOpen, closeSharePrompt);
  const stats = calculateSkillStats(nodes);
  const levelInfo = getLevelInfo();

  const summaryText = [
    `Skill Mapper — Level ${userLevel} (${levelInfo.title})`,
    `${stats.mastered}/${stats.totalSkills} skills mastered · ${formatXp(userXP)} XP`,
    `${streak}-day streak · ${unlockedBadges.length} badges`,
  ].join('\n');

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = 1200;
    const h = 630;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#121820';
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(200, 80, 40, 200, 80, 420);
    grad.addColorStop(0, 'rgba(90, 200, 190, 0.22)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 56) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#e8eef5';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText('Skill Mapper', 72, 96);

    ctx.fillStyle = '#7ad4c8';
    ctx.font = '500 18px ui-monospace, monospace';
    ctx.fillText('SIGNAL ATLAS', 72, 128);

    ctx.fillStyle = '#f4f7fb';
    ctx.font = '700 72px system-ui, sans-serif';
    ctx.fillText(`Level ${userLevel}`, 72, 250);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText(levelInfo.title, 72, 298);

    const metrics = [
      { label: 'MASTERED', value: `${stats.mastered}/${stats.totalSkills}` },
      { label: 'XP', value: formatXp(userXP) },
      { label: 'STREAK', value: `${streak}d` },
      { label: 'BADGES', value: String(unlockedBadges.length) },
    ];

    metrics.forEach((m, i) => {
      const x = 72 + i * 270;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x, 360, 240, 120);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.strokeRect(x, 360, 240, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px ui-monospace, monospace';
      ctx.fillText(m.label, x + 24, 400);
      ctx.fillStyle = '#f4f7fb';
      ctx.font = '700 36px system-ui, sans-serif';
      ctx.fillText(m.value, x + 24, 450);
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '400 16px system-ui, sans-serif';
    ctx.fillText('skill-mapper.vercel.app', 72, 560);

    return canvas;
  };

  useEffect(() => {
    if (sharePromptOpen) {
      requestAnimationFrame(() => drawCard());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw when prompt opens / stats change
  }, [sharePromptOpen, userXP, userLevel, streak, stats.mastered]);

  const handleDownload = () => {
    const canvas = drawCard();
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `skill-mapper-level-${userLevel}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const reasonCopy =
    sharePromptReason === 'daily-challenge'
      ? 'Daily challenge cleared — share the streak.'
      : sharePromptReason === 'level-up'
        ? 'Level up — show the atlas.'
        : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          openSharePrompt('manual');
        }}
        className="icon-btn pointer-events-auto grid h-8 w-8 place-items-center"
        title="Share progress"
        aria-label="Share progress card"
      >
        <Share2 size={14} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {sharePromptOpen && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-progress-title"
              tabIndex={-1}
              className="modal-shell w-full max-w-2xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 id="share-progress-title" className="font-display text-xl font-semibold text-foreground">
                    Share your progress
                  </h2>
                  {reasonCopy && <p className="mt-1 text-sm text-text-muted">{reasonCopy}</p>}
                </div>
                <button
                  type="button"
                  className="icon-btn grid place-items-center"
                  onClick={closeSharePrompt}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <canvas
                ref={canvasRef}
                className="mb-4 w-full rounded-[10px] border border-white/10"
                style={{ aspectRatio: '1200 / 630' }}
                aria-label="Progress share preview"
              />

              <p className="mb-4 whitespace-pre-line rounded-[10px] border border-white/10 bg-surface-1 p-3 font-mono text-xs text-text-muted">
                {summaryText}
              </p>

              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary flex items-center gap-2" onClick={handleDownload}>
                  <Download size={16} /> Download card
                </button>
                <button type="button" className="btn-ghost flex items-center gap-2" onClick={handleCopy}>
                  {copied ? <Check size={16} className="text-mastery" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy summary'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
