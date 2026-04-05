import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns';

const STORAGE_KEY = 'strike_it_tasks_v1';

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completedDates' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...task, id: genId(), completedDates: [], createdAt: Date.now() }]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const done = task.completedDates.includes(today);
      return { ...task, completedDates: done ? task.completedDates.filter(d => d !== today) : [...task.completedDates, today] };
    }));
  }, []);

  const calculateStreak = useCallback((completedDates: string[]) => {
    if (!completedDates.length) return 0;
    const sorted = [...completedDates].sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());
    const last = parseISO(sorted[0]);
    if (differenceInDays(new Date(), last) > 1) return 0;
    let streak = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (isSameDay(parseISO(sorted[i]), subDays(last, i))) streak++;
      else break;
    }
    return streak;
  }, []);

  const getStats = useCallback(() => {
    const dailyHours: Record<string, number> = {};
    let totalHours = 0;
    tasks.forEach(task => {
      const [sH, sM] = task.startTime.split(':').map(Number);
      const [eH, eM] = task.endTime.split(':').map(Number);
      let dur = (eH + eM / 60) - (sH + sM / 60);
      if (dur <= 0) dur += 24;
      task.completedDates.forEach(date => {
        dailyHours[date] = (dailyHours[date] || 0) + dur;
        totalHours += dur;
      });
    });
    const graphData = Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      return { date: format(subDays(new Date(), 6 - i), 'EEE'), hours: Number((dailyHours[d] || 0).toFixed(1)) };
    });
    return { totalHours, graphData };
  }, [tasks]);

  const clearAll = useCallback(() => {
    setTasks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { tasks, addTask, deleteTask, toggleComplete, calculateStreak, getStats, clearAll };
};
