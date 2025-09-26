
import React from 'react';
import type { HabitWithMetrics } from '../types';
import { Status } from '../types';
import { Check, X, Undo2, Star, Flame } from 'lucide-react';

interface HabitCardProps {
  habit: HabitWithMetrics;
  onCheckin: (status: Status) => void;
  onUndo: () => void;
  onShowDetail: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onCheckin, onUndo, onShowDetail }) => {
  const isDone = habit.today_status === Status.Done;
  const isSkipped = habit.today_status === Status.Skipped;
  const isPending = habit.today_status === 'pending';

  const cardColorClass = habit.color;

  return (
    <div
      className={`relative p-4 rounded-lg shadow-md transition-all duration-300 ${isDone ? 'bg-green-100 dark:bg-green-900/50' : 'bg-white dark:bg-gray-800'}`}
      style={{ borderLeft: `5px solid ${cardColorClass}` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onShowDetail}>
          <span className="text-2xl">{habit.icon}</span>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{habit.title}</h3>
        </div>
        <div className="flex gap-2">
            {isPending && (
                <>
                    <button onClick={() => onCheckin(Status.Skipped)} className="p-2 rounded-full text-gray-500 hover:bg-red-200 dark:hover:bg-red-800/50" title="跳過"><X size={18} /></button>
                    <button onClick={() => onCheckin(Status.Done)} className="p-2 rounded-full text-white bg-green-500 hover:bg-green-600" title="完成"><Check size={18} /></button>
                </>
            )}
            {(isDone || isSkipped) && (
                <button onClick={onUndo} className="p-2 rounded-full text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600" title="復原"><Undo2 size={18} /></button>
            )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1" title="Current Streak">
            <Flame size={16} className={habit.current_streak > 0 ? 'text-orange-500' : 'text-gray-400'}/>
            <span>{habit.current_streak}</span>
          </div>
          <div className="flex items-center gap-1" title="Best Streak">
            <Star size={16} className={habit.best_streak > 0 ? 'text-yellow-500' : 'text-gray-400'}/>
            <span>{habit.best_streak}</span>
          </div>
      </div>
       {isDone && <div className="absolute top-2 right-2 text-green-500"><Check size={16}/></div>}
       {isSkipped && <div className="absolute top-2 right-2 text-red-500"><X size={16}/></div>}
    </div>
  );
};

export default HabitCard;
