import { Task } from '../types';

const STORAGE_KEY = 'priority_todo_tasks_v1';
const THEME_KEY = 'priority_todo_theme_v1';

export function getInitialTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  // Pre-populate with realistic, helpful starter tasks
  const now = new Date();
  
  // Due in 15 minutes (with alarm enabled)
  const dueSoon = new Date(now.getTime() + 15 * 60 * 1000);
  const dueSoonStr = dueSoon.toISOString().slice(0, 16);

  // Due in 3 hours
  const dueLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const dueLaterStr = dueLater.toISOString().slice(0, 16);

  // Due tomorrow at 10:00
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowStr = tomorrow.toISOString().slice(0, 16);

  return [
    {
      id: 'task-1',
      title: 'Submit quarterly budget proposal',
      description: 'Review updated spreadsheets and send to finance committee.',
      priority: 'urgent',
      category: 'work',
      deadline: dueSoonStr,
      alarmEnabled: true,
      alarmTriggered: false,
      completed: false,
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'task-2',
      title: 'Review team pull requests and deployment logs',
      description: 'Check automated tests and approve staging pipeline.',
      priority: 'high',
      category: 'work',
      deadline: dueLaterStr,
      alarmEnabled: true,
      alarmTriggered: false,
      completed: false,
      createdAt: new Date(now.getTime() - 1 * 3600 * 1000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Schedule dentist appointment',
      description: 'Annual routine cleaning and checkup.',
      priority: 'medium',
      category: 'health',
      deadline: tomorrowStr,
      alarmEnabled: false,
      alarmTriggered: false,
      completed: false,
      createdAt: new Date(now.getTime() - 5 * 3600 * 1000).toISOString()
    },
    {
      id: 'task-4',
      title: 'Morning 30-minute cardio & stretch',
      description: 'Completed warmup and session.',
      priority: 'low',
      category: 'health',
      deadline: new Date(now.getTime() - 4 * 3600 * 1000).toISOString().slice(0, 16),
      alarmEnabled: false,
      alarmTriggered: false,
      completed: true,
      completedAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 6 * 3600 * 1000).toISOString()
    }
  ];
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage quota or private browsing error
  }
}

export function getInitialTheme(): boolean {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved !== null) {
    return saved === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function saveTheme(isDark: boolean): void {
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Ignore
  }
}
