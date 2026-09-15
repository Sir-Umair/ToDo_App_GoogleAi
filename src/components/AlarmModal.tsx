import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Volume2, 
  AlertTriangle 
} from 'lucide-react';
import { Task } from '../types';
import { soundManager } from '../utils/audio';

interface AlarmModalProps {
  ringingTasks: Task[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onMarkComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  ringingTasks,
  onDismiss,
  onDismissAll,
  onMarkComplete,
  onSnooze
}) => {
  // Trigger audio loop whenever ringingTasks has items
  useEffect(() => {
    if (ringingTasks.length > 0) {
      soundManager.startAlarm();
    } else {
      soundManager.stopAlarm();
    }

    return () => {
      soundManager.stopAlarm();
    };
  }, [ringingTasks.length]);

  if (ringingTasks.length === 0) return null;

  return (
    <AnimatePresence>
      <div 
        id="alarm-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          id="alarm-modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/20 overflow-hidden"
        >
          {/* Top pulsing banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  Deadline Alarm Ringing
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {ringingTasks.length === 1 
                    ? 'A scheduled deadline has arrived!' 
                    : `${ringingTasks.length} deadlines need immediate attention!`}
                </p>
              </div>
            </div>

            <button
              id="btn-dismiss-all-alarms"
              onClick={onDismissAll}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Dismiss all alarms"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ringing Items */}
          <div className="my-4 max-h-72 overflow-y-auto space-y-3 pr-1">
            {ringingTasks.map((task) => (
              <div
                key={task.id}
                id={`alarm-ringing-card-${task.id}`}
                className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    task.priority === 'urgent' ? 'bg-rose-500 text-white' :
                    task.priority === 'high' ? 'bg-amber-500 text-white' :
                    'bg-zinc-700 text-white'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                {/* Actions for this specific task */}
                <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                  <button
                    id={`alarm-complete-btn-${task.id}`}
                    type="button"
                    onClick={() => onMarkComplete(task.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>

                  <button
                    id={`alarm-snooze-btn-${task.id}`}
                    type="button"
                    onClick={() => onSnooze(task.id, 5)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>+5m Snooze</span>
                  </button>

                  <button
                    id={`alarm-dismiss-btn-${task.id}`}
                    type="button"
                    onClick={() => onDismiss(task.id)}
                    className="px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Silence
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              Alarm chime is looping
            </span>
            <button
              onClick={onDismissAll}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Silence & Close All
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
