
import React, { useState, useMemo } from 'react';
import type { HabitWithMetrics, Checkin } from '../types';
import { View, Status, DayOfWeekArray } from '../types';
import Button from './Button';
import { ArrowLeft, Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { getStartOfWeek, addDays, formatDate } from '../utils/dateUtils';
import { generateWeeklyInsight } from '../services/geminiService';

type WeeklySummaryViewProps = ReturnType<typeof useHabits> & {
    setView: (view: View) => void;
};

const WeeklySummaryView: React.FC<WeeklySummaryViewProps> = ({ getAllHabitsWithMetrics, checkins, setView }) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const habits = getAllHabitsWithMetrics();
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = addDays(startOfWeek, 6);

    const weeklyData = useMemo(() => {
        const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(startOfWeek, i)));
        const habitData = habits.map(habit => {
            const weekCheckins = weekDates.map(dateStr => {
                const checkin = checkins.find(c => c.habit_id === habit.id && c.date === dateStr);
                return { date: dateStr, status: checkin?.status };
            });
            return { ...habit, weekCheckins };
        });
        
        let totalDue = 0;
        let totalDone = 0;
        habitData.forEach(h => {
            h.weekCheckins.forEach((c, i) => {
                const day = DayOfWeekArray[i];
                if (h.frequency === 'daily' || h.days_of_week.includes(day)) {
                    totalDue++;
                    if (c.status === Status.Done) totalDone++;
                }
            });
        });

        const overallCompletion = totalDue > 0 ? Math.round((totalDone / totalDue) * 100) : 0;
        
        const bestHabit = [...habits].sort((a, b) => b.current_streak - a.current_streak)[0];
        const worstHabit = [...habits].sort((a, b) => a.completion_rate_7d - b.completion_rate_7d)[0];
        
        return { habitData, overallCompletion, bestHabit, worstHabit };
    }, [habits, checkins, startOfWeek]);

    const handleGenerateInsight = async () => {
        setIsLoadingInsight(true);
        setError('');
        setInsight('');
        try {
            const summaryForAI = {
                overallCompletion: `${weeklyData.overallCompletion}%`,
                habits: weeklyData.habitData.map(h => ({
                    title: h.title,
                    current_streak: h.current_streak,
                    completion_rate_7d: `${h.completion_rate_7d}%`
                })),
                bestPerformingHabit: weeklyData.bestHabit?.title,
                habitToFocusOn: weeklyData.worstHabit?.title
            };
            const insightText = await generateWeeklyInsight(JSON.stringify(summaryForAI, null, 2));
            setInsight(insightText);
        } catch(e) {
            setError('無法生成洞察，請稍後再試。');
        } finally {
            setIsLoadingInsight(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => setView(View.Dashboard)} className="mb-4 -ml-4"><ArrowLeft size={18} className="mr-2"/>返回</Button>
            <header>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(startOfWeek)} - {formatDate(endOfWeek)}</p>
                <h1 className="text-3xl font-bold">每週總結</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">整體完成率</p>
                    <p className="text-4xl font-bold text-habits-blue">{weeklyData.overallCompletion}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">本週最佳習慣</p>
                    <p className="text-lg font-semibold truncate mt-2">{weeklyData.bestHabit?.title || 'N/A'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">最需關注的習慣</p>
                    <p className="text-lg font-semibold truncate mt-2">{weeklyData.worstHabit?.title || 'N/A'}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                 <h3 className="text-lg font-semibold mb-4">AI 洞察</h3>
                 {insight && !isLoadingInsight && (
                     <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">{insight}</p>
                 )}
                 {isLoadingInsight && (
                     <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-habits-blue"></div>
                        <p className="ml-4 text-gray-500">正在為您生成報告...</p>
                     </div>
                 )}
                 {error && (
                     <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-center">
                        <AlertTriangle size={20} className="mr-2"/> {error}
                     </div>
                 )}
                 {!insight && !isLoadingInsight && (
                    <Button onClick={handleGenerateInsight} disabled={isLoadingInsight}>
                        <Sparkles size={18} className="mr-2"/> 生成 AI 洞察
                    </Button>
                 )}
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">習慣</th>
                            {DayOfWeekArray.map(day => <th key={day} className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {weeklyData.habitData.map(h => (
                            <tr key={h.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{h.title}</td>
                                {h.weekCheckins.map((c, i) => (
                                    <td key={c.date} className="px-2 py-3 text-center">
                                        {c.status === Status.Done && <Check size={18} className="text-green-500 mx-auto"/>}
                                        {c.status === Status.Skipped && <X size={18} className="text-red-500 mx-auto"/>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklySummaryView;
