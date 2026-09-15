export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Category = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export type AlarmTone = 'chime' | 'digital' | 'radar' | 'gentle' | 'custom';

export interface CustomRingtone {
  id: string;
  name: string;
  dataUrl: string; // Base64 audio/mp3, audio/wav, audio/ogg, audio/m4a, etc.
  duration?: number;
  addedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  deadline?: string; // ISO 8601 string e.g. "2026-09-15T15:30"
  alarmEnabled: boolean;
  alarmTone?: AlarmTone;
  customRingtoneId?: string; // Reference to custom ringtone ID if alarmTone === 'custom'
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
