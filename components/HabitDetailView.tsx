
import React from 'react';
import type { Habit, HabitWithMetrics, Checkin, DayOfWeek } from '../types';
import { View, Status, DayOfWeekArray } from '../types';
import Button from './Button';
import { Flame, Star, Percent, Calendar, Edit, Archive, ArrowLeft } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { getToday, formatDate, addDays, getDayOfWeekName } from '../utils/dateUtils';


interface CalendarViewProps {
    habit: Habit;
    checkins: Checkin[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ habit, checkins }) => {
    const today = new Date();
    const startDate = addDays(today, -29);
    
    const checkinsMap = new Map(checkins.map(c => [c.date, c.status]));
    const dates = Array.from({ length: 30 }, (_, i) => addDays(startDate, i));

    const getDayClass = (date: Date): string => {
        const dateStr = formatDate(date);
        const status = checkinsMap.get(dateStr);
        const isFuture = date > today;
        
        if (isFuture) return 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600';

        if (status === Status.Done) return 'bg-green-400 dark:bg-green-600 text-white';
        if (status === Status.Skipped) return 'bg-red-400 dark:bg-red-600 text-white';
        
        const isDue = habit.frequency === 'daily' || habit.days_of_week.includes(getDayOfWeekName(date));
        if (isDue) return 'bg-gray-200 dark:bg-gray-700'; // Pending
        
        return 'bg-gray-100 dark:bg-gray-800/50'; // Not due
    };

    return (
        <div className="grid grid-cols-10 gap-1.5">
            {dates.map(date => (
                <div key={date.toISOString()} title={formatDate(date)} className={`w-full aspect-square rounded-sm ${getDayClass(date)}`}></div>
            ))}
        </div>
    );
};


type HabitDetailViewProps = ReturnType<typeof useHabits> & {
    habitId: string;
    setView: (view: View) => void;
    handleEditHabit: (habit: Habit) => void;
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-4 shadow">
        <div className="p-2 rounded-full" style={{backgroundColor: `${color}33`, color: color}}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);


const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habitId, getHabitWithMetrics, getCheckinsForHabit, setView, handleEditHabit, archiveHabit, addOrUpdateCheckin }) => {
    const habit = getHabitWithMetrics(habitId);
    const checkins = getCheckinsForHabit(habitId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!habit) {
        return <div>Habit not found. <Button onClick={() => setView(View.Dashboard)}>Go back</Button></div>;
    }

    const todayStr = getToday();

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => setView(View.Dashboard)} className="mb-4 -ml-4"><ArrowLeft size={18} className="mr-2"/>返回</Button>
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{habit.icon}</span>
                    <h1 className="text-3xl font-bold">{habit.title}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEditHabit(habit)}><Edit size={16}/></Button>
                    <Button variant="danger" size="sm" onClick={() => {archiveHabit(habit.id); setView(View.Dashboard)}}><Archive size={16}/></Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={<Flame size={20}/>} label="Current Streak" value={habit.current_streak} color="#f97316" />
                <MetricCard icon={<Star size={20}/>} label="Best Streak" value={habit.best_streak} color="#eab308" />
                <MetricCard icon={<Percent size={20}/>} label="7-Day Rate" value={`${habit.completion_rate_7d}%`} color="#22c55e" />
                <MetricCard icon={<Calendar size={20}/>} label="Month Rate" value={`${habit.completion_rate_month}%`} color="#3b82f6" />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">最近 30 天</h3>
                <CalendarView habit={habit} checkins={checkins} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => addOrUpdateCheckin(habit.id, todayStr, Status.Done)} className="w-full">今日完成</Button>
                <Button onClick={() => addOrUpdateCheckin(habit.id, todayStr, Status.Skipped)} variant="secondary" className="w-full">今日跳過</Button>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">最近紀錄</h3>
                <div className="space-y-2">
                {checkins.slice(0, 5).map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center text-sm">
                        <p>{new Date(c.date + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === Status.Done ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {c.status === Status.Done ? '完成' : '跳過'}
                        </span>
                    </div>
                ))}
                {checkins.length === 0 && <p className="text-gray-500 text-sm">還沒有任何紀錄。</p>}
                </div>
            </div>
        </div>
    );
};

export default HabitDetailView;
