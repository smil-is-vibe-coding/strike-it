import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { CustomClock } from './CustomClock';
import { DigitalClock } from './DigitalClock';
import './TaskInput.css';

interface Props {
  onAdd: (task: { name: string; startTime: string; endTime: string; category: string; repeatDays: number[] }) => void;
  clockType: 'digital' | 'analog';
}

const CATEGORIES = ['Skill', 'Health', 'Study', 'Life'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TaskInput = ({ onAdd, clockType }: Props) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:00');
  const [category, setCategory] = useState('Skill');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (d: number) =>
    setRepeatDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  const submit = () => {
    if (!name.trim() || repeatDays.length === 0) return;
    onAdd({ name, startTime, endTime, category, repeatDays });
    setName(''); setOpen(false);
  };

  const ClockComponent = clockType === 'digital' ? DigitalClock : CustomClock;

  if (!open) return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen(true)} className="add-btn">
      <Plus size={22} /><span>Add Task</span>
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="task-form">
      <div className="form-head">
        <h3>Add Task</h3>
        <button onClick={() => setOpen(false)} className="close-btn"><X size={20} /></button>
      </div>
      <div className="input-group">
        <label>Task name</label>
        <input type="text" placeholder="e.g., DSA Practice" value={name} onChange={e => setName(e.target.value)} className="name-input" />
      </div>
      <div className="input-group">
        <label>Start time</label>
        <ClockComponent label="Start" value={startTime} onChange={setStartTime} />
      </div>
      <div className="input-group">
        <label>End time</label>
        <ClockComponent label="End" value={endTime} onChange={setEndTime} />
      </div>
      <div className="input-group">
        <label>Repeat on</label>
        <div className="day-row">
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => toggleDay(i)} className={`day-btn ${repeatDays.includes(i) ? 'active' : ''}`}>{d}</button>
          ))}
        </div>
      </div>
      <div className="cat-row">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`cat-btn ${category === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.96 }} onClick={submit} className="submit-btn">Add Task</motion.button>
    </motion.div>
  );
};
