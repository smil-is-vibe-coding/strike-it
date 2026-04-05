import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { format } from 'date-fns';
import { fireConfetti } from '../utils/confetti';
import './TaskList.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  calculateStreak: (d: string[]) => number;
}

export const TaskList = ({ tasks, onToggle, onDelete, calculateStreak }: Props) => {
  const [undoTask, setUndoTask] = useState<Task | null>(null);

  useEffect(() => {
    if (undoTask) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [undoTask]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDay = new Date().getDay();

  const todayTasks = tasks.filter(t => t.repeatDays?.includes(todayDay));
  const otherTasks = tasks.filter(t => !t.repeatDays?.includes(todayDay));

  const handleStrike = (task: Task, isDone: boolean) => {
    if (isDone) {
      // Trying to un-strike: show warning first
      setUndoTask(task);
    } else {
      // Normal strike
      fireConfetti();
      onToggle(task.id);
    }
  };

  const confirmUndo = (task: Task) => {
    onToggle(task.id);
    setUndoTask(null);
  };

  return (
    <div className="task-list">
      {/* Today's tasks */}
      <div className="list-head">
        <h2>Today</h2>
        <span className="count-badge">{todayTasks.length} tasks</span>
      </div>
      <div className="task-grid">
        <AnimatePresence mode="popLayout">
          {todayTasks.map((task, i) => {
            const done = task.completedDates.includes(today);
            const streak = calculateStreak(task.completedDates);
            const [sH, sM] = task.startTime.split(':').map(Number);
            const [eH, eM] = task.endTime.split(':').map(Number);
            let dur = (eH + eM / 60) - (sH + sM / 60);
            if (dur <= 0) dur += 24;

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className={`task-card ${done ? 'completed' : ''}`}>
                
                <div className="task-info">
                  <div className="task-cat">{task.category}</div>
                  <h3 className={`task-name ${done ? 'struck' : ''}`}>{task.name}</h3>
                  <div className="task-time"><Clock size={13} /><span>{task.startTime} - {task.endTime}</span><span className="dur-chip">{dur.toFixed(1)}h</span></div>
                  <div className="day-pills">{task.repeatDays?.map(d => <span key={d} className={`day-pill ${d === todayDay ? 'today' : ''}`}>{DAY_LABELS[d]}</span>)}</div>
                </div>
                
                <div className="task-actions">
                  <div className="streak-badge"><Zap size={13} /><span>{streak}d</span></div>
                  <div className="btn-group">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleStrike(task, done)} className={`strike-btn ${done ? 'active' : ''}`}>
                      <CheckCircle size={18} /><span>{done ? 'Done!' : 'Strike It'}</span>
                    </motion.button>
                    <button onClick={() => onDelete(task.id)} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                </div>



              </motion.div>
            );
          })}
        </AnimatePresence>
        {todayTasks.length === 0 && <div className="empty">No tasks scheduled for today!</div>}
      </div>

      {/* Other tasks */}
      {otherTasks.length > 0 && (
        <>
          <div className="list-head" style={{ marginTop: 16 }}>
            <h2>Other days</h2>
            <span className="count-badge">{otherTasks.length}</span>
          </div>
          <div className="task-grid">
            {otherTasks.map(task => (
              <div key={task.id} className="task-card muted">
                <div className="task-info">
                  <div className="task-cat">{task.category}</div>
                  <h3 className="task-name">{task.name}</h3>
                  <div className="task-time"><Clock size={13} /><span>{task.startTime} - {task.endTime}</span></div>
                  <div className="day-pills">{task.repeatDays?.map(d => <span key={d} className="day-pill">{DAY_LABELS[d]}</span>)}</div>
                </div>
                <button onClick={() => onDelete(task.id)} className="del-btn"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Undo Warning Overlay - Full Screen */}
      <AnimatePresence>
        {undoTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="undo-overlay-backdrop">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="undo-modal">
              <div className="undo-warn-icon"><AlertTriangle size={28} /></div>
              <div className="undo-text">
                <strong>Wait... undo strike for "{undoTask.name}"?</strong>
                <p>Only undo if it was a mistake! Falsely striking just cheats yourself out of true progress.</p>
              </div>
              <div className="undo-actions">
                <button onClick={() => setUndoTask(null)} className="undo-cancel">Keep it Done</button>
                <button onClick={() => confirmUndo(undoTask)} className="undo-confirm">Un-strike</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
