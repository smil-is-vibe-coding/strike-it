import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { TrendingUp, Calendar, Heart, Clock, Zap } from 'lucide-react';
import type { Task } from '../types';
import { HeatMap } from './HeatMap';
import { ShareCard } from './ShareCard';
import './Analytics.css';

interface Props {
  tasks: Task[];
  stats: { totalHours: number; graphData: { date: string; hours: number }[] };
  calculateStreak: (d: string[]) => number;
}

export const Analytics = ({ tasks, stats, calculateStreak }: Props) => {
  const monthly = (stats.totalHours / 7) * 30;
  const annual = (stats.totalHours / 7) * 365;

  // All completed dates across all tasks for heat map
  const allDates = tasks.flatMap(t => t.completedDates);

  // Per-task stats
  const taskStats = tasks.map(t => {
    const [sH, sM] = t.startTime.split(':').map(Number);
    const [eH, eM] = t.endTime.split(':').map(Number);
    let dur = (eH + eM / 60) - (sH + sM / 60);
    if (dur <= 0) dur += 24;
    const totalHrs = dur * t.completedDates.length;
    const monthEst = (totalHrs / Math.max(t.completedDates.length, 1)) * 30;
    const yearEst = (totalHrs / Math.max(t.completedDates.length, 1)) * 365;
    return { ...t, dur, totalHrs, monthEst, yearEst, streak: calculateStreak(t.completedDates) };
  });

  return (
    <div className="analytics">
      {/* Share Card */}
      <ShareCard tasks={tasks} calculateStreak={calculateStreak} />

      {/* Overall Stats */}
      <div className="stats-head">
        <h2>Overview</h2>
        <div className="total-pill"><TrendingUp size={14} /><span>{stats.totalHours.toFixed(1)} hrs</span></div>
      </div>

      <div className="graph-card">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.graphData}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8b735b' }} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
              {stats.graphData.map((e, i) => <Cell key={i} fill={e.hours > 0 ? '#e6a87c' : '#f3d2b9'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="graph-sub">Hours per day (last 7 days)</p>
      </div>

      <div className="proj-grid">
        <motion.div whileHover={{ y: -3 }} className="proj-card">
          <div className="icon-circle blue"><Calendar size={18} /></div>
          <div><h4>Monthly</h4><p className="proj-val">~{monthly.toFixed(1)} hrs</p><p className="proj-sub">est. this month</p></div>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="proj-card">
          <div className="icon-circle gold"><TrendingUp size={18} /></div>
          <div><h4>Yearly</h4><p className="proj-val">~{annual.toFixed(0)} hrs</p><p className="proj-sub">est. this year</p></div>
        </motion.div>
      </div>

      {/* Cozy Trophy Room */}
      <div className="trophy-room">
        <h2 style={{ marginBottom: 12 }}>Cozy Trophies</h2>
        <div className="trophy-grid">
          {[
            { hrs: 10,  icon: '🧶', name: 'Yarn Ball' },
            { hrs: 25,  icon: '☕', name: 'Cozy Coffee' },
            { hrs: 50,  icon: '🪴', name: 'Tiny Plant' },
            { hrs: 100, icon: '🧸', name: 'Teddy Bear' },
            { hrs: 250, icon: '👑', name: 'Royal Crown' }
          ].map(t => {
            const unlocked = stats.totalHours >= t.hrs;
            return (
              <div key={t.hrs} className={`trophy-item ${unlocked ? 'unlocked' : 'locked'}`}>
                <div className="trophy-icon">{unlocked ? t.icon : '🔒'}</div>
                <div className="trophy-name">{t.name}</div>
                <div className="trophy-req">{t.hrs}h</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heat Map */}
      <div>
        <h2 style={{ marginBottom: 12 }}>Activity</h2>
        <HeatMap completedDates={allDates} />
      </div>

      {/* Per-Task Breakdown */}
      {taskStats.length > 0 && (
        <div className="per-task-section">
          <h2>Per Task Breakdown</h2>
          <div className="per-task-grid">
            {taskStats.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="per-task-card">
                <div className="pt-head">
                  <div>
                    <span className="pt-cat">{t.category}</span>
                    <h3 className="pt-name">{t.name}</h3>
                  </div>
                  <div className="pt-streak"><Zap size={14} />{t.streak}d</div>
                </div>
                <div className="pt-stats-row">
                  <div className="pt-stat">
                    <Clock size={14} />
                    <div>
                      <span className="pt-val">{t.dur.toFixed(1)}h</span>
                      <span className="pt-label">per session</span>
                    </div>
                  </div>
                  <div className="pt-stat">
                    <span className="pt-val">{t.totalHrs.toFixed(1)}h</span>
                    <span className="pt-label">total done</span>
                  </div>
                </div>
                <div className="pt-projections">
                  <div className="pt-proj"><span className="pt-proj-val">~{t.monthEst.toFixed(0)}h</span><span className="pt-proj-label">/month</span></div>
                  <div className="pt-proj"><span className="pt-proj-val">~{t.yearEst.toFixed(0)}h</span><span className="pt-proj-label">/year</span></div>
                  <div className="pt-proj"><span className="pt-proj-val">{t.completedDates.length}</span><span className="pt-proj-label">sessions</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="motiv-card">
        <div className="heart-circle"><Heart size={22} fill="#f472b6" color="#f472b6" /></div>
        <div><h3>Keep going!</h3><p>Consistency is the secret. Each strike takes you closer to your best self.</p></div>
      </div>
    </div>
  );
};
