import { useState } from 'react';
import { motion } from 'framer-motion';
import './DigitalClock.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  label: string;
}

export const DigitalClock = ({ value, onChange, label }: Props) => {
  const [hours, minutes] = value.split(':').map(Number);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState<'hours' | 'minutes'>('hours');

  const setTime = (h: number, m: number) =>
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

  const isPM = hours >= 12;
  const display12 = hours % 12 || 12;

  const adjust = (delta: number) => {
    if (editMode === 'hours') {
      setTime((hours + delta + 24) % 24, minutes);
    } else {
      setTime(hours, (minutes + delta + 60) % 60);
    }
  };

  return (
    <div className="dclock-wrap">
      <div className="dclock-label-row">
        <span className="dclock-label">{label}</span>
        <button onClick={() => setIsOpen(!isOpen)} className="dclock-display">{value}</button>
      </div>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dclock-modal">
          <div className="casio-screen">
            <div className="casio-inner">
              <div className="casio-time">
                <span className={`casio-digit ${editMode === 'hours' ? 'blink' : ''}`}
                  onClick={() => setEditMode('hours')}>
                  {String(display12).padStart(2, '0')}
                </span>
                <span className="casio-colon">:</span>
                <span className={`casio-digit ${editMode === 'minutes' ? 'blink' : ''}`}
                  onClick={() => setEditMode('minutes')}>
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="casio-ampm">{isPM ? 'PM' : 'AM'}</span>
              </div>
              <div className="casio-sub">
                {editMode === 'hours' ? 'SET HOUR' : 'SET MIN'}
              </div>
            </div>
          </div>

          <div className="dclock-controls">
            <button onClick={() => adjust(editMode === 'hours' ? 1 : 5)} className="dclock-btn up">+</button>
            <button onClick={() => adjust(editMode === 'hours' ? -1 : -5)} className="dclock-btn down">-</button>
            <button onClick={() => setTime(isPM ? hours - 12 : hours + 12, minutes)} className="dclock-btn ampm">
              {isPM ? 'AM' : 'PM'}
            </button>
            <button onClick={() => {
              if (editMode === 'hours') setEditMode('minutes');
              else setIsOpen(false);
            }} className="dclock-btn next">
              {editMode === 'hours' ? 'Next' : 'Done'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
