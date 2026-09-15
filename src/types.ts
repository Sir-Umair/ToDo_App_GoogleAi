export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Category = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  deadline?: string; // ISO 8601 string e.g. "2026-09-15T15:30"
  alarmEnabled: boolean;
  alarmTriggered?: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';
export type FilterPriority = 'all' | Priority;
export type SortOption = 'deadline' | 'priority' | 'newest' | 'alphabetical';

export interface AlarmRingingItem {
  task: Task;
  triggeredAt: number;
}
