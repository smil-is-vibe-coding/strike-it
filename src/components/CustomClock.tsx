import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './CustomClock.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label: string;
}

export const CustomClock = ({ value, onChange, label }: Props) => {
  const [hours, minutes] = value.split(':').map(Number);
  const [isOpen, setIsOpen] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  const setTime = (h: number, m: number) =>
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

  const handleDrag = (_e: unknown, info: { point: { x: number; y: number } }) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let deg = (Math.atan2(info.point.y - cy, info.point.x - cx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    setTime(Math.round(deg / 30) % 12 || 12, minutes);
  };

  return (
    <div className="clock-wrap">
      <div className="clock-label-row">
        <span className="clock-label">{label}</span>
        <button onClick={() => setIsOpen(!isOpen)} className="time-display">{value}</button>
      </div>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clock-modal">
          <div className="clock-face" ref={clockRef}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`hour-num ${(i === 0 ? 12 : i) === hours % 12 || (i === 0 && hours === 12) ? 'active' : ''}`}
                style={{ transform: `rotate(${i * 30}deg) translateY(-78px) rotate(-${i * 30}deg)` }}
                onClick={() => setTime(i === 0 ? 12 : i, minutes)}
              >{i === 0 ? 12 : i}</div>
            ))}
            <motion.div className="clock-hand" animate={{ rotate: (hours % 12) * 30 }}
              drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} onDrag={handleDrag}>
              <div className="hand-dot" />
            </motion.div>
            <div className="clock-center" />
          </div>
          <div className="minute-picker">
            <input type="range" min="0" max="59" value={minutes} onChange={(e) => setTime(hours, +e.target.value)} className="minute-slider" />
            <span className="minute-text">{String(minutes).padStart(2, '0')} min</span>
          </div>
          <div className="ampm-row">
            {['AM', 'PM'].map(p => (
              <button key={p} className={`ampm-btn ${(p === 'AM' && hours < 12) || (p === 'PM' && hours >= 12) ? 'active' : ''}`}
                onClick={() => setTime(p === 'AM' ? hours % 12 : (hours % 12) + 12, minutes)}>{p}</button>
            ))}
          </div>
          <button onClick={() => setIsOpen(false)} className="done-btn">Done</button>
        </motion.div>
      )}
    </div>
  );
};
