import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Calendar, Bell, BellOff } from 'lucide-react';
import { Task, Priority, Category } from '../types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const PRIORITIES: { id: Priority; label: string; activeColor: string; color: string }[] = [
  { id: 'urgent', label: 'Urgent', activeColor: 'bg-rose-600 text-white border-rose-600', color: 'border-zinc-300 dark:border-zinc-700 text-rose-600' },
  { id: 'high', label: 'High', activeColor: 'bg-amber-600 text-white border-amber-600', color: 'border-zinc-300 dark:border-zinc-700 text-amber-600' },
  { id: 'medium', label: 'Medium', activeColor: 'bg-sky-600 text-white border-sky-600', color: 'border-zinc-300 dark:border-zinc-700 text-sky-600' },
  { id: 'low', label: 'Low', activeColor: 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800', color: 'border-zinc-300 dark:border-zinc-700 text-zinc-600' },
];

const CATEGORIES: Category[] = ['work', 'personal', 'study', 'health', 'finance', 'other'];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [deadline, setDeadline] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category);
      setDeadline(task.deadline || '');
      setAlarmEnabled(task.alarmEnabled);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      deadline: deadline || undefined,
      alarmEnabled: Boolean(deadline && alarmEnabled),
      // If deadline was changed and is in future, reset triggered flag
      alarmTriggered: deadline && new Date(deadline).getTime() > Date.now() ? false : task.alarmTriggered
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="edit-task-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          id="edit-task-modal-content"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Edit Task
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Notes & Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional description..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      priority === p.id ? p.activeColor : p.color
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize transition-colors ${
                      category === cat
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline & Alarm */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Target Deadline
                </span>
                <button
                  type="button"
                  onClick={() => setAlarmEnabled(!alarmEnabled)}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors ${
                    alarmEnabled && deadline
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300'
                      : 'text-zinc-500 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {alarmEnabled && deadline ? (
                    <>
                      <Bell className="w-3 h-3 text-amber-500" />
                      <span>Alarm Enabled</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3 h-3" />
                      <span>Alarm Disabled</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                />
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline('')}
                    className="text-xs text-zinc-400 hover:text-zinc-600 px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
