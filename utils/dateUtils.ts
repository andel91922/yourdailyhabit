
import type { DayOfWeek } from '../types';
import { DayOfWeekArray } from '../types';

/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Returns today's date as a 'YYYY-MM-DD' string.
 */
export const getToday = (): string => {
  return formatDate(new Date());
};

/**
 * Adds a specified number of days to a date.
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Gets the day of the week for a given date.
 * Returns 'Mon', 'Tue', etc.
 */
export const getDayOfWeekName = (date: Date): DayOfWeek => {
  const dayIndex = date.getUTCDay(); // Use UTC day to avoid timezone shifts
  // Sunday is 0, Monday is 1... Saturday is 6. We want Monday to be first.
  const adjustedIndex = (dayIndex === 0) ? 6 : dayIndex - 1;
  return DayOfWeekArray[adjustedIndex];
};

/**
 * Gets the start of the week (Monday) for a given date.
 */
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday - 0, Monday - 1
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};
