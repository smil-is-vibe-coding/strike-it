import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Zap, Clock, TrendingUp } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Task } from '../types';
import './ShareCard.css';

interface Props {
  tasks: Task[];
  calculateStreak: (d: string[]) => number;
}

type CardType = 'streak' | 'hours' | 'consistency';

export const ShareCard = ({ tasks, calculateStreak }: Props) => {
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<CardType>('streak');
  const cardRef = useRef<HTMLDivElement>(null);

  const bestTask = tasks.reduce((best, t) => {
    const s = calculateStreak(t.completedDates);
    return s > (best ? calculateStreak(best.completedDates) : 0) ? t : best;
  }, tasks[0] as Task | undefined);

  const totalCompleted = tasks.reduce((sum, t) => sum + t.completedDates.length, 0);

  const totalHours = tasks.reduce((sum, t) => {
    const [sH, sM] = t.startTime.split(':').map(Number);
    const [eH, eM] = t.endTime.split(':').map(Number);
    let dur = (eH + eM / 60) - (sH + sM / 60);
    if (dur <= 0) dur += 24;
    return sum + dur * t.completedDates.length;
  }, 0);


  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'strike-it-card.png', { type: 'image/png' });

      if (navigator.share) {
        // Try sharing with file first
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'My Strike It Progress!' });
            return;
          }
        } catch { /* file share failed, try text */ }

        // Text-only share (opens share tray without image)
        await navigator.share({
          title: 'My Strike It Progress!',
          text: 'Check out my streaks on Strike It!',
          url: window.location.href,
        });
      } else {
        // No share API (desktop) — download
        const a = document.createElement('a');
        a.download = 'strike-it-card.png';
        a.href = dataUrl;
        a.click();
      }
    } catch { /* user cancelled */ }
  };

  if (tasks.length === 0) return null;

  return (
    <>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)} className="share-trigger">
        <Share2 size={18} /><span>Share your progress</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="share-overlay" onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="share-sheet" onClick={e => e.stopPropagation()}>

              <div className="share-head">
                <h3>Share Card</h3>
                <button onClick={() => setOpen(false)}><X size={20} /></button>
              </div>

              <div className="card-types">
                {(['streak', 'hours', 'consistency'] as CardType[]).map(t => (
                  <button key={t} onClick={() => setCardType(t)} className={`type-btn ${cardType === t ? 'active' : ''}`}>
                    {t === 'streak' ? 'Streak' : t === 'hours' ? 'Hours' : 'Stats'}
                  </button>
                ))}
              </div>

              <div ref={cardRef} className={`share-card card-${cardType}`}>
                <div className="card-brand">Strike It</div>
                {cardType === 'streak' && bestTask && (
                  <div className="card-body">
                    <div className="card-icon"><Zap size={32} /></div>
                    <div className="card-big">{calculateStreak(bestTask.completedDates)}</div>
                    <div className="card-label">day streak</div>
                    <div className="card-task">{bestTask.name}</div>
                  </div>
                )}
                {cardType === 'hours' && (
                  <div className="card-body">
                    <div className="card-icon"><Clock size={32} /></div>
                    <div className="card-big">{totalHours.toFixed(1)}</div>
                    <div className="card-label">total hours invested</div>
                    <div className="card-task">across {tasks.length} goals</div>
                  </div>
                )}
                {cardType === 'consistency' && (
                  <div className="card-body">
                    <div className="card-icon"><TrendingUp size={32} /></div>
                    <div className="card-big">{totalCompleted}</div>
                    <div className="card-label">tasks completed</div>
                    <div className="card-task">{tasks.length} goals tracked</div>
                  </div>
                )}
                <div className="card-footer">strikeit.app</div>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="share-action">
                <Share2 size={18} /><span>Share</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
