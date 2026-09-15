import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Calendar, Bell, BellOff, Music, Volume2 } from 'lucide-react';
import { Task, Priority, Category, AlarmTone, CustomRingtone } from '../types';
import { soundManager } from '../utils/audio';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  customRingtones: CustomRingtone[];
  onOpenRingtoneManager: () => void;
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
  onSave,
  customRingtones,
  onOpenRingtoneManager
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [deadline, setDeadline] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmTone, setAlarmTone] = useState<AlarmTone>('chime');
  const [customRingtoneId, setCustomRingtoneId] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category);
      setDeadline(task.deadline || '');
      setAlarmEnabled(task.alarmEnabled);
      setAlarmTone(task.alarmTone || 'chime');
      setCustomRingtoneId(task.customRingtoneId || (customRingtones[0]?.id || ''));
    }
  }, [task, customRingtones]);

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
      alarmTone,
      customRingtoneId: alarmTone === 'custom' ? customRingtoneId : undefined,
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

              {/* Tone Selection inside Edit modal */}
              {alarmEnabled && deadline && (
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <Music className="w-3 h-3 text-indigo-500" />
                      Alarm Tone:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (alarmTone === 'custom') {
                            const picked = customRingtones.find(r => r.id === customRingtoneId) || customRingtones[0];
                            if (picked) soundManager.playCustomAudio(picked.dataUrl, false);
                            else soundManager.playTone('chime');
                          } else {
                            soundManager.playTone(alarmTone);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        <Volume2 className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={onOpenRingtoneManager}
                        className="text-[11px] text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 underline decoration-dotted"
                      >
                        + Custom
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: 'chime', label: 'Classic' },
                      { id: 'digital', label: 'Digital' },
                      { id: 'radar', label: 'Sonar' },
                      { id: 'gentle', label: 'Gentle' },
                      { id: 'custom', label: 'Custom' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => {
                          const t = tone.id as AlarmTone;
                          setAlarmTone(t);
                          if (t === 'custom') {
                            if (customRingtones.length === 0) {
                              onOpenRingtoneManager();
                            } else {
                              const picked = customRingtones.find(r => r.id === customRingtoneId) || customRingtones[0];
                              soundManager.playCustomAudio(picked.dataUrl, false);
                            }
                          } else {
                            soundManager.playTone(t);
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-lg border transition-all text-center ${
                          alarmTone === tone.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>

                  {alarmTone === 'custom' && (
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2 text-xs">
                      {customRingtones.length > 0 ? (
                        <select
                          value={customRingtoneId}
                          onChange={(e) => {
                            setCustomRingtoneId(e.target.value);
                            const picked = customRingtones.find(r => r.id === e.target.value);
                            if (picked) soundManager.playCustomAudio(picked.dataUrl, false);
                          }}
                          className="flex-1 px-2 py-1 text-xs rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                        >
                          {customRingtones.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.duration ? `(${r.duration}s)` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-zinc-400">No custom ringtone uploaded yet</span>
                      )}
                      <button
                        type="button"
                        onClick={onOpenRingtoneManager}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] shrink-0"
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </div>
              )}
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
