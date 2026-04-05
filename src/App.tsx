import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BarChart2, ListChecks, SlidersHorizontal } from 'lucide-react';
import './App.css';

import { format } from 'date-fns';

function App() {
  const { tasks, addTask, deleteTask, toggleComplete, calculateStreak, getStats, clearAll } = useTasks();
  const [tab, setTab] = useState<'tasks' | 'stats' | 'settings'>('tasks');
  const [cheering, setCheering] = useState(false);
  const [clockType, setClockType] = useState<'digital' | 'analog'>(() => {
    return (localStorage.getItem('strike_it_clock') as 'digital' | 'analog') || 'digital';
  });

  const handleClockTypeChange = (t: 'digital' | 'analog') => {
    setClockType(t);
    localStorage.setItem('strike_it_clock', t);
  };

  const handleToggle = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (task && !task.completedDates.includes(todayStr)) {
      setCheering(true);
      setTimeout(() => setCheering(false), 2000);
    }
    toggleComplete(id);
  };

  const todayDay = new Date().getDay();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.repeatDays?.includes(todayDay));
  const allDone = todayTasks.length > 0 && todayTasks.every(t => t.completedDates.includes(todayStr));
  const isSleeping = !cheering && (todayTasks.length === 0 || allDone);

  const mascotVariants = {
    normal: { scale: 1, rotate: 0, y: [0, -3, 0], transition: { y: { repeat: Infinity, duration: 3, ease: "easeInOut" as const } } },
    sleep: { scale: 1, filter: 'brightness(0.8)', y: [0, 2, 0], transition: { y: { repeat: Infinity, duration: 4, ease: "easeInOut" as const } } },
    cheer: { scale: 1.1, rotate: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div className="mascot-container">
          <motion.div variants={mascotVariants} animate={cheering ? 'cheer' : isSleeping ? 'sleep' : 'normal'} className="mascot-wrap">
            <img src="/mascot.png" alt="Strike It Mascot" className="mascot-img" />
          </motion.div>
          <AnimatePresence>
            {isSleeping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0 }} className="mood-emoji zzz">
                💤
              </motion.div>
            )}
            {cheering && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1, y: -15 }} exit={{ opacity: 0 }} className="mood-emoji sparkles">
                ✨
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <h1 className="app-title">Strike It</h1>
          <p className="app-sub">Make every streak count!</p>
        </div>
      </header>

      <nav className="tab-nav">
        <button onClick={() => setTab('tasks')} className={`tab ${tab === 'tasks' ? 'active' : ''}`}>
          <ListChecks size={18} /><span>Goals</span>
        </button>
        <button onClick={() => setTab('stats')} className={`tab ${tab === 'stats' ? 'active' : ''}`}>
          <BarChart2 size={18} /><span>Analytics</span>
        </button>
        <button onClick={() => setTab('settings')} className={`tab ${tab === 'settings' ? 'active' : ''}`}>
          <SlidersHorizontal size={18} /><span>Settings</span>
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {tab === 'tasks' && (
          <motion.div key="t" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="tab-content">
            <TaskInput onAdd={addTask} clockType={clockType} />
            <TaskList tasks={tasks} onToggle={handleToggle} onDelete={deleteTask} calculateStreak={calculateStreak} />
          </motion.div>
        )}
        {tab === 'stats' && (
          <motion.div key="s" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="tab-content">
            <Analytics tasks={tasks} stats={getStats()} calculateStreak={calculateStreak} />
          </motion.div>
        )}
        {tab === 'settings' && (
          <motion.div key="g" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="tab-content">
            <Settings clockType={clockType} onClockTypeChange={handleClockTypeChange} onClearData={clearAll} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer">Strike It &middot; Built with love</footer>
    </div>
  );
}

export default App;
