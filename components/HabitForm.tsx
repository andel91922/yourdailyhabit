
import React, { useState, useEffect } from 'react';
import type { Habit, DayOfWeek } from '../types';
import { Frequency, DayOfWeekArray } from '../types';
import { HABIT_COLORS, EMOJI_OPTIONS } from '../constants';
import Button from './Button';

interface HabitFormProps {
  habit: Habit | null;
  onSave: (habitData: Omit<Habit, 'id' | 'created_at' | 'is_archived' | 'user_id'>) => void;
  onCancel: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ habit, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('💧');
  const [color, setColor] = useState('#3b82f6');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.Daily);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setIcon(habit.icon);
      setColor(habit.color);
      setFrequency(habit.frequency);
      setDaysOfWeek(habit.days_of_week);
    } else {
      // Reset to defaults for new habit
      setTitle('');
      setIcon('💧');
      setColor('#3b82f6');
      setFrequency(Frequency.Daily);
      setDaysOfWeek([]);
    }
  }, [habit]);
  
  const handleDayToggle = (day: DayOfWeek) => {
    setDaysOfWeek(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('標題不能為空');
      return;
    }
    if (frequency === Frequency.SpecificDays && daysOfWeek.length === 0) {
      setError('請至少選擇一天');
      return;
    }
    setError('');
    onSave({ title, icon, color, frequency, days_of_week: frequency === Frequency.Daily ? [] : daysOfWeek });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">{habit ? '編輯習慣' : '新增習慣'}</h2>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">標題</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-habits-blue focus:border-habits-blue sm:text-sm"
          placeholder="例如：喝 2L 水"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">圖示</label>
        <div className="mt-1 flex gap-2 flex-wrap bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md">
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`text-2xl p-2 rounded-md transition-transform duration-150 ${icon === emoji ? 'bg-blue-200 dark:bg-blue-800 scale-110' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">顏色</label>
        <div className="mt-1 flex gap-2 flex-wrap">
          {HABIT_COLORS.map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full ${c.twClass} transition-transform duration-150 ${color === c.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-black dark:ring-white' : ''}`}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">頻率</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <button type="button" onClick={() => setFrequency(Frequency.Daily)} className={`px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-l-md w-1/2 ${frequency === Frequency.Daily ? 'bg-habits-blue text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>每日</button>
          <button type="button" onClick={() => setFrequency(Frequency.SpecificDays)} className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-300 dark:border-gray-600 rounded-r-md w-1/2 ${frequency === Frequency.SpecificDays ? 'bg-habits-blue text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>特定日</button>
        </div>
      </div>

      {frequency === Frequency.SpecificDays && (
        <div className="animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">選擇日期</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {DayOfWeekArray.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-2 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md ${daysOfWeek.includes(day) ? 'bg-habits-blue text-white' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
};

export default HabitForm;
