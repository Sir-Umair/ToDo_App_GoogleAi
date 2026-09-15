import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame,
  Target
} from 'lucide-react';
import { Task } from '../types';

interface ProgressTrackerProps {
  tasks: Task[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  
  // Overdue count among non-completed tasks
  const now = Date.now();
  const overdue = tasks.filter(t => {
    if (t.completed || !t.deadline) return false;
    return new Date(t.deadline).getTime() < now;
  }).length;

  // Urgent & High priority completed stats
  const urgentTotal = tasks.filter(t => t.priority === 'urgent').length;
  const urgentDone = tasks.filter(t => t.priority === 'urgent' && t.completed).length;

  const highTotal = tasks.filter(t => t.priority === 'high').length;
  const highDone = tasks.filter(t => t.priority === 'high' && t.completed).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Circular ring geometry
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusMessage = () => {
    if (total === 0) return 'Add your first task to start tracking progress.';
    if (percentage === 100) return 'Incredible work! All scheduled goals completed.';
    if (overdue > 0) return `${overdue} deadline${overdue > 1 ? 's' : ''} require attention.`;
    if (percentage >= 75) return 'Almost done! The finish line is in sight.';
    if (percentage >= 50) return 'Halfway there! Keep up the great pace.';
    if (percentage > 0) return 'Good momentum underway. Stay focused.';
    return 'Ready to make today productive? Start with urgent items.';
  };

  return (
    <div 
      id="progress-tracker-card"
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
        
        {/* Left: Circular Ring & Key Stats */}
        <div className="flex items-center gap-5 w-full sm:w-auto">
          {/* SVG Progress Circle */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
              {/* Background ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-wider">
                Done
              </span>
            </div>
          </div>

          {/* Heading and motivational context */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Goal Progress
              </h2>
              {percentage === 100 && total > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Flame className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  All Done
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              {getStatusMessage()}
            </p>

            {/* Quick Priority Completion indicators */}
            <div className="flex items-center gap-2 mt-2.5">
              {urgentTotal > 0 && (
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-[11px] font-medium text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50"
                  title="Urgent tasks completed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Urgent: {urgentDone}/{urgentTotal}</span>
                </div>
              )}
              {highTotal > 0 && (
                <div 
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50"
                  title="High priority tasks completed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>High: {highDone}/{highTotal}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metric Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-6">
          {/* Completed counter */}
          <div className="flex flex-col items-center sm:items-start p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </div>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {completed}
            </span>
          </div>

          {/* Pending counter */}
          <div className="flex flex-col items-center sm:items-start p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
            </div>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pending}
            </span>
          </div>

          {/* Overdue counter */}
          <div className={`flex flex-col items-center sm:items-start p-2 sm:p-2.5 rounded-xl border ${
            overdue > 0 
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' 
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800'
          }`}>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue</span>
            </div>
            <span className={`text-lg font-bold mt-0.5 ${
              overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}>
              {overdue}
            </span>
          </div>
        </div>

      </div>

      {/* Micro Linear Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-4">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
