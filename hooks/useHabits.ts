
import { useState, useEffect, useCallback } from 'react';
import type { Habit, Checkin, HabitWithMetrics, DayOfWeek, TodayStatus } from '../types';
import { Frequency, Status, DayOfWeekArray } from '../types';
import { DEFAULT_HABITS_DATA } from '../constants';
import { getToday, isDueOnDate, calculateStreak, calculateCompletionRate, getNextDueDate, formatDate, addDays } from '../utils/habitUtils';

const USER_ID = 'default-user';

export const useHabits = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedHabits = localStorage.getItem('habits');
            const storedCheckins = localStorage.getItem('checkins');

            if (storedHabits && storedCheckins) {
                setHabits(JSON.parse(storedHabits));
                setCheckins(JSON.parse(storedCheckins));
            } else {
                // Generate default data
                const newHabits: Habit[] = DEFAULT_HABITS_DATA.map(h => ({
                    ...h,
                    id: crypto.randomUUID(),
                    user_id: USER_ID,
                    created_at: new Date().toISOString(),
                    is_archived: false,
                }));

                const newCheckins: Checkin[] = [];
                const today = new Date();
                
                for (let i = 7; i > 0; i--) {
                    const date = addDays(today, -i);
                    const dateStr = formatDate(date);

                    newHabits.forEach(habit => {
                        if (isDueOnDate(habit, date)) {
                            const rand = Math.random();
                            let status: Status | null = null;
                            if (rand < 0.7) { // 70% done
                                status = Status.Done;
                            } else if (rand < 0.9) { // 20% skipped
                                status = Status.Skipped;
                            }
                            // 10% pending (no checkin)

                            if (status) {
                                newCheckins.push({
                                    id: crypto.randomUUID(),
                                    habit_id: habit.id,
                                    date: dateStr,
                                    status,
                                    created_at: date.toISOString(),
                                });
                            }
                        }
                    });
                }
                setHabits(newHabits);
                setCheckins(newCheckins);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            // Fallback to default if storage is corrupt
            setHabits([]);
            setCheckins([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if(!isLoading) {
            localStorage.setItem('habits', JSON.stringify(habits));
            localStorage.setItem('checkins', JSON.stringify(checkins));
        }
    }, [habits, checkins, isLoading]);

    const addHabit = (habitData: Omit<Habit, 'id' | 'created_at' | 'is_archived' | 'user_id'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: crypto.randomUUID(),
            user_id: USER_ID,
            created_at: new Date().toISOString(),
            is_archived: false,
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const updateHabit = (id: string, updatedData: Partial<Habit>) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedData } : h));
    };

    const archiveHabit = (id: string) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, is_archived: true } : h));
    };
    
    const addOrUpdateCheckin = (habitId: string, date: string, status: Status, note?: string) => {
        setCheckins(prev => {
            const existingIndex = prev.findIndex(c => c.habit_id === habitId && c.date === date);
            if (existingIndex > -1) {
                const updatedCheckins = [...prev];
                const existingCheckin = updatedCheckins[existingIndex];
                updatedCheckins[existingIndex] = { ...existingCheckin, status, note: note ?? existingCheckin.note };
                return updatedCheckins;
            } else {
                const newCheckin: Checkin = {
                    id: crypto.randomUUID(),
                    habit_id: habitId,
                    date,
                    status,
                    note,
                    created_at: new Date().toISOString(),
                };
                return [...prev, newCheckin];
            }
        });
    };

    const removeCheckin = (habitId: string, date: string) => {
        setCheckins(prev => prev.filter(c => !(c.habit_id === habitId && c.date === date)));
    };

    const getHabitWithMetrics = useCallback((habit: Habit): HabitWithMetrics => {
        const todayStr = getToday();
        const habitCheckins = checkins.filter(c => c.habit_id === habit.id);
        const todayCheckin = habitCheckins.find(c => c.date === todayStr);
        let todayStatus: TodayStatus = 'pending';
        if (todayCheckin) {
            todayStatus = todayCheckin.status;
        } else if (!isDueOnDate(habit, new Date())) {
            todayStatus = 'pending'; // Or something else to indicate not due
        }

        const { current_streak, best_streak } = calculateStreak(habit, habitCheckins);
        
        const today = new Date();
        const sevenDaysAgo = addDays(today, -6);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
            ...habit,
            today_status: todayStatus,
            current_streak,
            best_streak,
            completion_rate_7d: calculateCompletionRate(habit, habitCheckins, sevenDaysAgo, today),
            completion_rate_month: calculateCompletionRate(habit, habitCheckins, startOfMonth, today),
            next_due_date: getNextDueDate(habit),
        };
    }, [checkins]);

    const getAllHabitsWithMetrics = useCallback((): HabitWithMetrics[] => {
        return habits
            .filter(h => !h.is_archived)
            .map(getHabitWithMetrics)
            .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [habits, getHabitWithMetrics]);

    return {
        habits,
        checkins,
        isLoading,
        addHabit,
        updateHabit,
        archiveHabit,
        addOrUpdateCheckin,
        removeCheckin,
        getHabitWithMetrics: (id: string) => {
            const habit = habits.find(h => h.id === id);
            return habit ? getHabitWithMetrics(habit) : null;
        },
        getAllHabitsWithMetrics,
        getCheckinsForHabit: (habitId: string) => checkins.filter(c => c.habit_id === habitId),
    };
};
