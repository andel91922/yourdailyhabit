
import type { Habit } from './types';
import { Frequency, DayOfWeek } from './types';

export const HABIT_COLORS: { name: string; value: string; twClass: string }[] = [
  { name: 'Blue', value: '#3b82f6', twClass: 'bg-habits-blue' },
  { name: 'Green', value: '#22c55e', twClass: 'bg-habits-green' },
  { name: 'Orange', value: '#f97316', twClass: 'bg-habits-orange' },
  { name: 'Purple', value: '#8b5cf6', twClass: 'bg-habits-purple' },
  { name: 'Pink', value: '#ec4899', twClass: 'bg-habits-pink' },
  { name: 'Red', value: '#ef4444', twClass: 'bg-habits-red' },
  { name: 'Yellow', value: '#eab308', twClass: 'bg-habits-yellow' },
  { name: 'Cyan', value: '#06b6d4', twClass: 'bg-habits-cyan' },
];

export const EMOJI_OPTIONS = ['💧', '📚', '🥾', '🧘', '🎨', '🎸', '💻', '🏋️', '🍎', '📝', '🏃', '☀️'];

export const DEFAULT_HABITS_DATA: Omit<Habit, 'id' | 'created_at' | 'is_archived' | 'user_id'>[] = [
  {
    title: '喝 2L 水',
    icon: '💧',
    color: '#3b82f6',
    frequency: Frequency.Daily,
    days_of_week: [],
  },
  {
    title: '閱讀 20 分鐘',
    icon: '📚',
    color: '#8b5cf6',
    frequency: Frequency.SpecificDays,
    days_of_week: [DayOfWeek.Mon, DayOfWeek.Wed, DayOfWeek.Fri],
  },
  {
    title: '走 1 萬步',
    icon: '🥾',
    color: '#f97316',
    frequency: Frequency.Daily,
    days_of_week: [],
  },
];
