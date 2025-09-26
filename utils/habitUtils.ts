
import type { Habit, Checkin, DayOfWeek } from '../types';
import { Frequency, Status } from '../types';
import { formatDate, addDays, getDayOfWeekName, getToday as getTodayStr } from './dateUtils';

export * from './dateUtils';

/**
 * Checks if a habit is scheduled to be completed on a specific date.
 */
export const isDueOnDate = (habit: Habit, date: Date): boolean => {
  if (habit.frequency === Frequency.Daily) {
    return true;
  }
  const dayOfWeek = getDayOfWeekName(date);
  return habit.days_of_week.includes(dayOfWeek);
};


/**
 * Calculates current and best streaks for a habit.
 */
export const calculateStreak = (habit: Habit, checkins: Checkin[]): { current_streak: number, best_streak: number } => {
    const sortedCheckins = [...checkins]
        .filter(c => c.status === Status.Done)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedCheckins.length === 0) {
        return { current_streak: 0, best_streak: 0 };
    }

    let currentStreak = 0;
    let bestStreak = 0;
    let tempCurrentStreak = 0;
    
    const checkinDates = new Set(sortedCheckins.map(c => c.date));
    // FIX: The array being sorted contains date strings, not objects.
    // The sort callback should use the strings `a` and `b` directly.
    const allCheckinDatesSorted = Array.from(new Set(checkins.map(c => c.date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Calculate current streak
    let currentDate = new Date();
    const todayStr = formatDate(currentDate);

    // If today is not a due day, start checking from the last due day
    if (!isDueOnDate(habit, currentDate)) {
        let daysChecked = 0;
        while (!isDueOnDate(habit, currentDate) && daysChecked < 7) {
            currentDate = addDays(currentDate, -1);
            daysChecked++;
        }
    }
    
    // Check if today is done or skipped, if skipped current streak is 0
    const todayCheckin = checkins.find(c => c.date === todayStr);
    if(todayCheckin && todayCheckin.status === Status.Skipped) {
      // Current streak is 0 if today was skipped.
    } else {
        while (true) {
            const dateStr = formatDate(currentDate);
            if (isDueOnDate(habit, currentDate)) {
                if (checkinDates.has(dateStr)) {
                    currentStreak++;
                } else {
                    // if it's today and no checkin yet, don't break
                    if (dateStr !== todayStr) break;
                }
            }
            currentDate = addDays(currentDate, -1);
        }
    }
    

    // Calculate best streak
    if(allCheckinDatesSorted.length > 0) {
        for (let i = 0; i < allCheckinDatesSorted.length; i++) {
            const currentDate = new Date(allCheckinDatesSorted[i] + 'T00:00:00');
            tempCurrentStreak = 0;

            let cursorDate = new Date(currentDate);
            while(true) {
                if (isDueOnDate(habit, cursorDate)) {
                    const dateStr = formatDate(cursorDate);
                    const checkin = checkins.find(c => c.date === dateStr);
                    if (checkin && checkin.status === Status.Done) {
                        tempCurrentStreak++;
                    } else {
                        break;
                    }
                }
                cursorDate = addDays(cursorDate, -1);
            }
            if(tempCurrentStreak > bestStreak) {
                bestStreak = tempCurrentStreak;
            }
        }
    }


    return { current_streak: currentStreak, best_streak: bestStreak };
};


/**
 * Calculates the completion rate for a habit within a date range.
 */
export const calculateCompletionRate = (habit: Habit, checkins: Checkin[], startDate: Date, endDate: Date): number => {
  let dueDays = 0;
  let completedDays = 0;

  for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
    if (isDueOnDate(habit, d)) {
      dueDays++;
      const dateStr = formatDate(d);
      const checkin = checkins.find(c => c.date === dateStr);
      if (checkin && checkin.status === Status.Done) {
        completedDays++;
      }
    }
  }

  return dueDays === 0 ? 0 : Math.round((completedDays / dueDays) * 100);
};

/**
 * Gets the next due date for a habit, starting from today.
 */
export const getNextDueDate = (habit: Habit): string => {
    let date = new Date();
    for (let i = 0; i < 7; i++) {
        if (isDueOnDate(habit, date)) {
            return formatDate(date);
        }
        date = addDays(date, 1);
    }
    return formatDate(addDays(new Date(), 7)); // Fallback
};