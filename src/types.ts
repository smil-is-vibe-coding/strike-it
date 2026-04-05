export interface Task {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  repeatDays: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  completedDates: string[];
  category: string;
  createdAt: number;
}
