
import React, { useState, useEffect } from 'react';
import { useHabits } from './hooks/useHabits';
import type { Habit } from './types';
import { View } from './types';
import Dashboard from './components/Dashboard';
import HabitDetailView from './components/HabitDetailView';
import WeeklySummaryView from './components/WeeklySummaryView';
import HabitForm from './components/HabitForm';
import Modal from './components/Modal';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const habitsHook = useHabits();
  const [view, setView] = useState<View>(View.Dashboard);
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleShowDetail = (habitId: string) => {
    setActiveHabitId(habitId);
    setView(View.HabitDetail);
  };

  const handleAddNewHabit = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };
  
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'created_at' | 'is_archived' | 'user_id'>) => {
    if(editingHabit) {
      habitsHook.updateHabit(editingHabit.id, {...editingHabit, ...habitData});
    } else {
      habitsHook.addHabit(habitData);
    }
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  const renderView = () => {
    switch(view) {
      case View.HabitDetail:
        return activeHabitId ? <HabitDetailView habitId={activeHabitId} {...habitsHook} setView={setView} handleEditHabit={handleEditHabit} /> : <Dashboard {...habitsHook} setView={setView} handleShowDetail={handleShowDetail} handleAddNewHabit={handleAddNewHabit} />;
      case View.WeeklySummary:
        return <WeeklySummaryView {...habitsHook} setView={setView} />;
      case View.Dashboard:
      default:
        return <Dashboard {...habitsHook} setView={setView} handleShowDetail={handleShowDetail} handleAddNewHabit={handleAddNewHabit} />;
    }
  };
  
  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="flex justify-between items-center mb-6">
        <h1 
            className="text-2xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer" 
            onClick={() => setView(View.Dashboard)}>
            Habit Tracker
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-habits-blue"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
      <main>
        {renderView()}
      </main>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <HabitForm 
          habit={editingHabit}
          onSave={handleSaveHabit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default App;
