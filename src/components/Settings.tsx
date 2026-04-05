import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle } from 'lucide-react';
import './Settings.css';

interface Props {
  clockType: 'digital' | 'analog';
  onClockTypeChange: (t: 'digital' | 'analog') => void;
  onClearData: () => void;
}

export const Settings = ({ clockType, onClockTypeChange, onClearData }: Props) => {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-card">
        <div className="setting-row">
          <div>
            <h4>Clock Style</h4>
            <p className="setting-desc">Choose your time picker style</p>
          </div>
          <div className="toggle-group">
            <button onClick={() => onClockTypeChange('digital')} className={`toggle-btn ${clockType === 'digital' ? 'active' : ''}`}>Casio</button>
            <button onClick={() => onClockTypeChange('analog')} className={`toggle-btn ${clockType === 'analog' ? 'active' : ''}`}>Analog</button>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="setting-row">
          <div>
            <h4>App Info</h4>
            <p className="setting-desc">Strike It v1.0 — Built with love</p>
          </div>
        </div>
      </div>

      <div className="settings-card danger">
        <div className="setting-row">
          <div>
            <h4>Clear All Data</h4>
            <p className="setting-desc">Permanently delete all tasks and progress</p>
          </div>
        </div>
        {!confirmClear ? (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setConfirmClear(true)} className="clear-btn">
            <Trash2 size={16} /><span>Clear Data</span>
          </motion.button>
        ) : (
          <div className="confirm-row">
            <div className="confirm-warn"><AlertTriangle size={16} /><span>This cannot be undone!</span></div>
            <div className="confirm-btns">
              <button onClick={() => setConfirmClear(false)} className="cancel-btn">Cancel</button>
              <button onClick={() => { onClearData(); setConfirmClear(false); }} className="danger-btn">Delete Everything</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
