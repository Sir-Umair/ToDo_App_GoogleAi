import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Bell, 
  BellOff, 
  Clock, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Task, Priority } from '../types';
import { formatDeadline, getDeadlineInfo } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleAlarm: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string; dot: string; border: string }> = {
  urgent: {
    label: 'Urgent',
    badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
    dot: 'bg-rose-500',
    border: 'border-l-rose-500'
  },
  high: {
    label: 'High',
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    border: 'border-l-amber-500'
  },
  medium: {
    label: 'Medium',
    badge: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/60',
    dot: 'bg-sky-500',
    border: 'border-l-sky-500'
  },
  low: {
    label: 'Low',
    badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    dot: 'bg-zinc-400',
    border: 'border-l-zinc-400'
  },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleAlarm,
  onSnooze
}) => {
  const priorityInfo = PRIORITY_CONFIG[task.priority];
  const deadlineInfo = getDeadlineInfo(task.deadline, task.completed);
  const formattedDeadline = formatDeadline(task.deadline);

  return (
    <motion.div
      layout
      id={`task-item-${task.id}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative p-4 rounded-xl border bg-white dark:bg-zinc-900 transition-all duration-200 shadow-sm hover:shadow-md ${
        task.completed 
          ? 'border-zinc-200 dark:border-zinc-800/60 opacity-65 bg-zinc-50/50 dark:bg-zinc-900/40' 
          : deadlineInfo.isOverdue
            ? 'border-rose-300 dark:border-rose-900/70 border-l-4 border-l-rose-500'
            : deadlineInfo.isDueNow
              ? 'border-amber-300 dark:border-amber-900/70 border-l-4 border-l-amber-500 ring-1 ring-amber-500/20'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Animated Checkbox */}
        <button
          type="button"
          id={`checkbox-task-${task.id}`}
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-zinc-800/80'
          }`}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title with strikethrough */}
            <span
              className={`text-sm font-semibold tracking-tight transition-all duration-200 ${
                task.completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </span>

            {/* Priority Tag */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${priorityInfo.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
              {priorityInfo.label}
            </span>

            {/* Category Tag */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 capitalize">
              {task.category}
            </span>
          </div>

          {/* Description if present */}
          {task.description && (
            <p className={`text-xs mt-1 leading-relaxed ${
              task.completed ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'
            }`}>
              {task.description}
            </p>
          )}

          {/* Deadline & Status Bar */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs">
            {task.deadline && (
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] border ${
                  task.completed
                    ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    : deadlineInfo.isOverdue
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                      : deadlineInfo.isDueNow
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 animate-pulse'
                        : deadlineInfo.status === 'due-soon'
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/50'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
                title={`Deadline: ${formattedDeadline}`}
              >
                <Clock className="w-3 h-3" />
                <span>{formattedDeadline}</span>
                {deadlineInfo.relativeText && (
                  <span className="font-semibold ml-0.5">
                    ({deadlineInfo.relativeText})
                  </span>
                )}
              </div>
            )}

            {/* Alarm Status Indicator */}
            {task.deadline && (
              <button
                type="button"
                id={`btn-toggle-alarm-${task.id}`}
                onClick={() => onToggleAlarm(task.id)}
                disabled={task.completed}
                className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                  task.completed
                    ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                    : task.alarmEnabled
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={task.alarmEnabled ? 'Alarm enabled on deadline (Click to disable)' : 'Alarm disabled (Click to enable)'}
              >
                {task.alarmEnabled ? (
                  <>
                    <Bell className="w-3 h-3 text-amber-500 fill-amber-500/20 animate-wiggle" />
                    <span>Alarm on</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3 h-3" />
                    <span>Alarm off</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Snooze button if overdue or due now */}
            {!task.completed && task.deadline && (deadlineInfo.isOverdue || deadlineInfo.isDueNow) && (
              <button
                type="button"
                id={`btn-snooze-task-${task.id}`}
                onClick={() => onSnooze(task.id, 15)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200/60 dark:border-indigo-800/60"
                title="Snooze deadline by 15 minutes"
              >
                <RotateCcw className="w-3 h-3" />
                <span>+15m Snooze</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit, Delete */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            id={`btn-edit-task-${task.id}`}
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Edit task details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          
          <button
            type="button"
            id={`btn-delete-task-${task.id}`}
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
