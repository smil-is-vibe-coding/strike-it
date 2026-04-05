import { subDays, format, startOfWeek, addDays } from 'date-fns';
import './HeatMap.css';

interface Props {
  completedDates: string[];
  weeks?: number;
}

export const HeatMap = ({ completedDates, weeks = 16 }: Props) => {
  const today = new Date();
  const totalDays = weeks * 7;
  const startDate = subDays(today, totalDays - 1);
  const weekStart = startOfWeek(startDate);

  // Build grid of weeks
  const grid: { date: string; level: number }[][] = [];
  let current = weekStart;

  while (current <= today) {
    const week: { date: string; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = format(current, 'yyyy-MM-dd');
      const count = completedDates.filter(cd => cd === dateStr).length;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
      week.push({ date: dateStr, level });
      current = addDays(current, 1);
    }
    grid.push(week);
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-labels">
        {dayLabels.map((l, i) => <span key={i} className="day-label">{l}</span>)}
      </div>
      <div className="heatmap-grid">
        {grid.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((day, di) => (
              <div key={di} className={`heatmap-cell level-${day.level}`}
                title={`${day.date}: ${completedDates.filter(d => d === day.date).length} tasks`} />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell level-0" />
        <div className="heatmap-cell level-1" />
        <div className="heatmap-cell level-2" />
        <div className="heatmap-cell level-3" />
        <span>More</span>
      </div>
    </div>
  );
};
