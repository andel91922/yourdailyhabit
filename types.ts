
export enum Frequency {
  Daily = 'daily',
  SpecificDays = 'specific_days',
}

export enum DayOfWeek {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}

export const DayOfWeekArray: DayOfWeek[] = [DayOfWeek.Mon, DayOfWeek.Tue, DayOfWeek.Wed, DayOfWeek.Thu, DayOfWeek.Fri, DayOfWeek.Sat, DayOfWeek.Sun];

export enum Status {
  Done = 'done',
  Skipped = 'skipped',
}

export type TodayStatus = Status | 'pending';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  color: string;
  frequency: Frequency;
  days_of_week: DayOfWeek[];
  created_at: string;
  is_archived: boolean;
}

export interface Checkin {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  status: Status;
  note?: string;
  created_at: string;
}

export interface HabitWithMetrics extends Habit {
  today_status: TodayStatus;
  current_streak: number;
  best_streak: number;
  completion_rate_7d: number;
  completion_rate_month: number;
  next_due_date: string; // YYYY-MM-DD
}

export enum View {
    Dashboard = 'dashboard',
    HabitDetail = 'habitDetail',
    WeeklySummary = 'weeklySummary',
}
