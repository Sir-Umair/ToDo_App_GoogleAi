import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Bell, 
  BellOff, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Sparkles,
  Volume2,
  Music
} from 'lucide-react';
import { Priority, Category, AlarmTone, CustomRingtone } from '../types';
import { soundManager } from '../utils/audio';

interface TaskFormProps {
  customRingtones: CustomRingtone[];
  onOpenRingtoneManager: () => void;
  onAddTask: (task: {
    title: string;
    description?: string;
    priority: Priority;
    category: Category;
    deadline?: string;
    alarmEnabled: boolean;
    alarmTone?: AlarmTone;
    customRingtoneId?: string;
  }) => void;
}

const PRIORITIES: { id: Priority; label: string; color: string; activeColor: string }[] = [
  { 
    id: 'urgent', 
    label: 'Urgent', 
    color: 'border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    activeColor: 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-600/20'
  },
  { 
    id: 'high', 
    label: 'High', 
    color: 'border-amber-300 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
    activeColor: 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-600/20'
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    color: 'border-sky-300 dark:border-sky-900/60 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30',
    activeColor: 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20'
  },
  { 
    id: 'low', 
    label: 'Low', 
    color: 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    activeColor: 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
  },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'study', label: 'Study' },
  { id: 'health', label: 'Health' },
  { id: 'finance', label: 'Finance' },
  { id: 'other', label: 'Other' },
];

export const TaskForm: React.FC<TaskFormProps> = ({ 
  onAddTask,
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync customRingtoneId if custom tone is selected and none picked yet
  useEffect(() => {
    if (alarmTone === 'custom' && !customRingtoneId && customRingtones.length > 0) {
      setCustomRingtoneId(customRingtones[0].id);
    }
  }, [alarmTone, customRingtoneId, customRingtones]);

  // Quick deadline helper
  const setQuickDeadline = (minutesFromNow: number) => {
    const target = new Date(Date.now() + minutesFromNow * 60 * 1000);
    // Format YYYY-MM-DDTHH:mm in local timezone
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    setDeadline(`${year}-${month}-${day}T${hours}:${mins}`);
    setAlarmEnabled(true);
    setIsExpanded(true);
  };

  const setTodayEvening = () => {
    const target = new Date();
    target.setHours(17, 0, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setHours(20, 0, 0, 0);
    }
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    setDeadline(`${year}-${month}-${day}T${hours}:${mins}`);
    setAlarmEnabled(true);
    setIsExpanded(true);
  };

  const setTomorrowMorning = () => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(9, 0, 0, 0);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    setDeadline(`${year}-${month}-${day}T${hours}:${mins}`);
    setAlarmEnabled(true);
    setIsExpanded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      category,
      deadline: deadline || undefined,
      alarmEnabled: Boolean(deadline && alarmEnabled),
      alarmTone,
      customRingtoneId: alarmTone === 'custom' ? customRingtoneId : undefined
    });

    setTitle('');
    setDescription('');
    setDeadline('');
    setIsExpanded(false);
  };

  return (
    <form
      id="task-create-form"
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
    >
      {/* Primary Input Line */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="task-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Add a new task (e.g. 'Complete security audit report')..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>

        <button
          id="btn-add-task-submit"
          type="submit"
          disabled={!title.trim()}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shrink-0 ${
            title.trim()
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse options' : 'Expand options'}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={isExpanded ? 'Hide details' : 'Set priority, deadline & alarm'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Controls: Priority, Category, Deadline & Alarm */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Optional description */}
          <div>
            <textarea
              id="task-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes or checklist details..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs transition-all"
            />
          </div>

          {/* Priority Levels Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  id={`priority-btn-${p.id}`}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    priority === p.id ? p.activeColor : p.color
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    p.id === 'urgent' ? 'bg-rose-500' :
                    p.id === 'high' ? 'bg-amber-500' :
                    p.id === 'medium' ? 'bg-sky-500' : 'bg-zinc-400'
                  }`} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`category-btn-${cat.id}`}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    category === cat.id
                      ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline & Alarm Setting */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Target Deadline & Alarm
                </span>
              </div>

              {/* Alarm Toggle */}
              <button
                id="btn-toggle-task-alarm"
                type="button"
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  alarmEnabled && deadline
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                }`}
                title={alarmEnabled ? 'Alarm chime will sound when deadline is reached' : 'Alarm disabled'}
              >
                {alarmEnabled && deadline ? (
                  <>
                    <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    <span>Alarm Ring Active</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3.5 h-3.5" />
                    <span>Alarm Inactive</span>
                  </>
                )}
              </button>
            </div>

            {/* Input & Quick Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="task-deadline-input"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline('')}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Alarm Tone Selection */}
            {alarmEnabled && deadline && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
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
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Preview selected tone"
                    >
                      <Volume2 className="w-3 h-3" />
                      Preview Tone
                    </button>
                    <button
                      type="button"
                      onClick={onOpenRingtoneManager}
                      className="text-[11px] text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 underline decoration-dotted"
                      title="Upload custom ringtone from your device"
                    >
                      + Upload Custom
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'chime', label: 'Classic Chime' },
                    { id: 'digital', label: 'Digital Beep' },
                    { id: 'radar', label: 'Sonar Radar' },
                    { id: 'gentle', label: 'Gentle Bell' },
                    { id: 'custom', label: 'Custom Audio' },
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
                            const selected = customRingtones.find(r => r.id === customRingtoneId) || customRingtones[0];
                            soundManager.playCustomAudio(selected.dataUrl, false);
                          }
                        } else {
                          soundManager.playTone(t);
                        }
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg border transition-all text-center flex items-center justify-between ${
                        alarmTone === tone.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="truncate">{tone.label}</span>
                      {alarmTone === tone.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Sub-selector if Custom Audio is selected */}
                {alarmTone === 'custom' && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {customRingtones.length > 0 ? (
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] shrink-0">Select File:</span>
                        <select
                          value={customRingtoneId}
                          onChange={(e) => {
                            setCustomRingtoneId(e.target.value);
                            const picked = customRingtones.find(r => r.id === e.target.value);
                            if (picked) soundManager.playCustomAudio(picked.dataUrl, false);
                          }}
                          className="flex-1 px-2 py-1 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {customRingtones.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.duration ? `(${r.duration}s)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        No custom audio uploaded yet. Click &apos;Upload Audio&apos; to pick from your iPhone, Android, or computer.
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={onOpenRingtoneManager}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors"
                    >
                      {customRingtones.length > 0 ? 'Manage Files' : 'Upload Audio'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Presets (Super helpful for testing alarms!) */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => setQuickDeadline(2)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
                title="Test alarm in 2 minutes"
              >
                +2m (Alarm Test)
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(15)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
              >
                +15m
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(60)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={setTodayEvening}
                className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
              >
                Today 5pm
              </button>
              <button
                type="button"
                onClick={setTomorrowMorning}
                className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
              >
                Tomorrow 9am
              </button>
            </div>
          </div>

        </div>
      )}
    </form>
  );
};
