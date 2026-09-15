import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ProgressTracker } from './components/ProgressTracker';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { AlarmModal } from './components/AlarmModal';
import { EditTaskModal } from './components/EditTaskModal';
import { RingtoneManagerModal } from './components/RingtoneManagerModal';
import { Task, Priority, Category, AlarmTone, CustomRingtone } from './types';
import { 
  getInitialTasks, 
  saveTasks, 
  getInitialTheme, 
  saveTheme,
  getStoredRingtones,
  saveStoredRingtones
} from './utils/storage';
import { soundManager } from './utils/audio';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [ringingTasks, setRingingTasks] = useState<Task[]>([]);
  const [customRingtones, setCustomRingtones] = useState<CustomRingtone[]>(getStoredRingtones);
  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(isDark);
  }, [isDark]);

  // Persist tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist custom ringtones on change
  useEffect(() => {
    saveStoredRingtones(customRingtones);
  }, [customRingtones]);

  const handleAddCustomRingtone = (ringtone: CustomRingtone) => {
    setCustomRingtones(prev => [ringtone, ...prev]);
  };

  const handleDeleteCustomRingtone = (id: string) => {
    setCustomRingtones(prev => prev.filter(r => r.id !== id));
  };

  // Request browser notification permission once user interacts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Optional background prompt on first user gesture
      const handleFirstInteraction = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('click', handleFirstInteraction, { once: true });
    }
  }, []);

  // Alarm verification interval (checks every 3 seconds)
  useEffect(() => {
    // Keep a persistent ref set of task IDs currently ringing or already notified
    const activeRingingIds = new Set<string>();

    const checkDeadlines = () => {
      const now = Date.now();
      const newlyTriggered: Task[] = [];

      setTasks((prevTasks) => {
        let changed = false;
        const updated = prevTasks.map((task) => {
          if (
            !task.completed &&
            task.alarmEnabled &&
            task.deadline &&
            !task.alarmTriggered &&
            !activeRingingIds.has(task.id)
          ) {
            const deadlineTime = new Date(task.deadline).getTime();
            if (!isNaN(deadlineTime) && deadlineTime <= now) {
              changed = true;
              activeRingingIds.add(task.id);
              newlyTriggered.push({ ...task, alarmTriggered: true });
              return { ...task, alarmTriggered: true };
            }
          }
          return task;
        });

        return changed ? updated : prevTasks;
      });

      if (newlyTriggered.length > 0) {
        setRingingTasks((prev) => {
          const ids = new Set(prev.map(t => t.id));
          const toAdd = newlyTriggered.filter(t => !ids.has(t.id));
          return [...prev, ...toAdd];
        });

        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          newlyTriggered.forEach((task) => {
            try {
              new Notification(`⏰ Task Deadline Reached!`, {
                body: `${task.title} is due now. Priority: ${task.priority.toUpperCase()}`,
                icon: '/favicon.ico'
              });
            } catch {
              // Notification blocked or sandboxed
            }
          });
        }
      }
    };

    // Run check immediately and on recurring interval
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 3000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Add new task
  const handleAddTask = (newTaskData: {
    title: string;
    description?: string;
    priority: Priority;
    category: Category;
    deadline?: string;
    alarmEnabled: boolean;
    alarmTone?: AlarmTone;
    customRingtoneId?: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newTaskData.title,
      description: newTaskData.description,
      priority: newTaskData.priority,
      category: newTaskData.category,
      deadline: newTaskData.deadline,
      alarmEnabled: newTaskData.alarmEnabled,
      alarmTone: newTaskData.alarmTone || 'chime',
      customRingtoneId: newTaskData.customRingtoneId,
      alarmTriggered: false,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
  };

  // Toggle completion with sound effect
  const handleToggleComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            soundManager.playChime();
          }
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            // If completed, dismiss any active alarm ringing for this task
            alarmTriggered: nextCompleted ? true : task.alarmTriggered
          };
        }
        return task;
      })
    );

    // Remove from ringing modal if active
    setRingingTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Delete task
  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setRingingTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save edited task
  const handleSaveEdit = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTask(null);
  };

  // Toggle alarm enabled/disabled for a task
  const handleToggleAlarm = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextVal = !task.alarmEnabled;
          return {
            ...task,
            alarmEnabled: nextVal,
            // Reset triggered flag if turning back on and deadline is in future
            alarmTriggered: nextVal && task.deadline && new Date(task.deadline).getTime() > Date.now() ? false : task.alarmTriggered
          };
        }
        return task;
      })
    );
  }, []);

  // Snooze task by N minutes
  const handleSnooze = useCallback((id: string, minutes: number) => {
    const newDeadline = new Date(Date.now() + minutes * 60 * 1000);
    const year = newDeadline.getFullYear();
    const month = String(newDeadline.getMonth() + 1).padStart(2, '0');
    const day = String(newDeadline.getDate()).padStart(2, '0');
    const hours = String(newDeadline.getHours()).padStart(2, '0');
    const mins = String(newDeadline.getMinutes()).padStart(2, '0');
    const newDeadlineStr = `${year}-${month}-${day}T${hours}:${mins}`;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          return {
            ...task,
            deadline: newDeadlineStr,
            alarmEnabled: true,
            alarmTriggered: false
          };
        }
        return task;
      })
    );

    // Remove from active ringing list
    setRingingTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Clear all completed tasks
  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  // Alarm modal handlers
  const handleDismissAlarm = (id: string) => {
    setRingingTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDismissAllAlarms = () => {
    setRingingTasks([]);
  };

  const handleAlarmMarkComplete = (id: string) => {
    handleToggleComplete(id);
    handleDismissAlarm(id);
  };

  // Count active scheduled alarms in the future
  const activeAlarmsCount = tasks.filter(
    t => !t.completed && t.alarmEnabled && t.deadline && new Date(t.deadline).getTime() > Date.now()
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeAlarmsCount={activeAlarmsCount}
        onOpenRingtoneManager={() => setIsRingtoneModalOpen(true)}
        customRingtonesCount={customRingtones.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Progress Tracker Card */}
        <ProgressTracker tasks={tasks} />

        {/* Task Creation Form */}
        <TaskForm 
          onAddTask={handleAddTask}
          customRingtones={customRingtones}
          onOpenRingtoneManager={() => setIsRingtoneModalOpen(true)}
        />

        {/* Task List with Filters, Search, Sorting, and Transitions */}
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onEdit={(task) => setEditingTask(task)}
          onToggleAlarm={handleToggleAlarm}
          onSnooze={handleSnooze}
          onClearCompleted={handleClearCompleted}
        />
      </main>

      {/* Persistent Alarm Ringing Modal */}
      <AlarmModal
        ringingTasks={ringingTasks}
        customRingtones={customRingtones}
        onDismiss={handleDismissAlarm}
        onDismissAll={handleDismissAllAlarms}
        onMarkComplete={handleAlarmMarkComplete}
        onSnooze={handleSnooze}
      />

      {/* Task Edit Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        customRingtones={customRingtones}
        onOpenRingtoneManager={() => setIsRingtoneModalOpen(true)}
      />

      {/* Custom Ringtone Manager Modal (Android & System files) */}
      <RingtoneManagerModal
        isOpen={isRingtoneModalOpen}
        onClose={() => setIsRingtoneModalOpen(false)}
        customRingtones={customRingtones}
        onAddRingtone={handleAddCustomRingtone}
        onDeleteRingtone={handleDeleteCustomRingtone}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Taskly</span>
          <span>Audio synthesizer alarms active • Auto-persisted locally</span>
        </div>
      </footer>
    </div>
  );
}
