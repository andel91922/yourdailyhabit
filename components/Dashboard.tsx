
import React from 'react';
import type { HabitWithMetrics, Checkin } from '../types';
import { Status, View, DayOfWeekArray } from '../types';
import HabitCard from './HabitCard';
import Button from './Button';
import { Plus, BarChart2 } from 'lucide-react';
import { getToday, getStartOfWeek, addDays, formatDate } from '../utils/dateUtils';
import type { useHabits } from '../hooks/useHabits';

type DashboardProps = ReturnType<typeof useHabits> & {
    setView: (view: View) => void;
    handleShowDetail: (habitId: string) => void;
    handleAddNewHabit: () => void;
};

const ThisWeekChart: React.FC<{ habits: HabitWithMetrics[], checkins: Checkin[] }> = ({ habits, checkins }) => {
    const startOfWeek = getStartOfWeek(new Date());
    const weekData = DayOfWeekArray.map((dayName, i) => {
        const date = addDays(startOfWeek, i);
        const dateStr = formatDate(date);

        const dueHabits = habits.filter(h => h.days_of_week.length === 0 || h.days_of_week.includes(dayName));
        if (dueHabits.length === 0) {
            return { day: dayName, rate: -1 }; // -1 to indicate no habits due
        }

        const completedCount = dueHabits.reduce((acc, habit) => {
            const checkin = checkins.find(c => c.habit_id === habit.id && c.date === dateStr);
            return (checkin && checkin.status === Status.Done) ? acc + 1 : acc;
        }, 0);

        return { day: dayName, rate: (completedCount / dueHabits.length) * 100 };
    });

    const getBarColor = (rate: number) => {
        if (rate === -1) return 'bg-gray-200 dark:bg-gray-700';
        if (rate > 75) return 'bg-habits-green';
        if (rate > 40) return 'bg-habits-yellow';
        return 'bg-habits-red';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">This Week's Progress</h3>
            <div className="flex justify-between items-end h-24">
                {weekData.map(({ day, rate }) => (
                    <div key={day} className="flex flex-col items-center w-1/7">
                        <div 
                            className="w-4/5 rounded-t-md transition-all duration-500"
                            style={{ height: `${rate === -1 ? 10 : Math.max(10, rate)}%` }}
                            title={`${day}: ${rate === -1 ? 'N/A' : `${Math.round(rate)}%`}`}
                        >
                            <div className={`h-full w-full rounded-t-md ${getBarColor(rate)}`}></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ 
    getAllHabitsWithMetrics, 
    addOrUpdateCheckin, 
    removeCheckin, 
    setView, 
    handleShowDetail, 
    handleAddNewHabit,
    checkins 
}) => {
    const today = new Date();
    const habits = getAllHabitsWithMetrics();
    const todayStr = getToday();

    const greetings = {
        morning: '早上好！今天也要元氣滿滿喔！',
        afternoon: '下午好！休息一下，繼續加油！',
        evening: '晚上好！今天過得如何？',
    };

    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return greetings.morning;
        if (hour < 18) return greetings.afternoon;
        return greetings.evening;
    };
    
    const todayDueHabits = habits.filter(h => h.next_due_date === todayStr);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-gray-500 dark:text-gray-400">{today.toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{getGreeting()}</h2>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">今日習慣</h3>
                {todayDueHabits.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todayDueHabits.map(habit => (
                            <HabitCard 
                                key={habit.id} 
                                habit={habit} 
                                onCheckin={(status) => addOrUpdateCheckin(habit.id, todayStr, status)}
                                onUndo={() => removeCheckin(habit.id, todayStr)}
                                onShowDetail={() => handleShowDetail(habit.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">今天沒有需要完成的習慣。好好休息！</p>
                    </div>
                )}
            </div>

            <ThisWeekChart habits={habits} checkins={checkins} />

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleAddNewHabit} className="w-full sm:w-auto flex-1">
                    <Plus size={18} className="mr-2"/> 新增習慣
                </Button>
                <Button onClick={() => setView(View.WeeklySummary)} variant="secondary" className="w-full sm:w-auto flex-1">
                    <BarChart2 size={18} className="mr-2"/> 每週總結
                </Button>
            </div>
        </div>
    );
};

export default Dashboard;
