import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  Inbox, 
  Clock, 
  AlertTriangle,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Task, FilterStatus, FilterPriority, SortOption, Category } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleAlarm: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onClearCompleted: () => void;
}

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleAlarm,
  onSnooze,
  onClearCompleted
}) => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      all: tasks.length,
      active: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline).getTime() < now).length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = Date.now();

    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'overdue') {
          if (task.completed || !task.deadline) return false;
          if (new Date(task.deadline).getTime() >= now) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Completed tasks pushed to bottom unless viewing "completed"
        if (statusFilter !== 'completed') {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
        }

        if (sortBy === 'deadline') {
          // Put tasks with deadline first, sorted chronologically
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          if (a.deadline && !b.deadline) return -1;
          if (!a.deadline && b.deadline) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortBy === 'priority') {
          const diff = (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
          if (diff !== 0) return diff;
          // Sub-sort by deadline
          if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }

        return 0;
      });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div id="task-list-section" className="space-y-4">
      {/* Filter and Search Navigation Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        {/* Status Tabs: All, Active, Completed, Overdue */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80">
            <button
              id="filter-tab-all"
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All ({counts.all})
            </button>

            <button
              id="filter-tab-active"
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3 h-3 text-zinc-400" />
              Active ({counts.active})
            </button>

            <button
              id="filter-tab-completed"
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Done ({counts.completed})
            </button>

            <button
              id="filter-tab-overdue"
              type="button"
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === 'overdue'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-sm'
                  : counts.overdue > 0 
                    ? 'text-rose-600 dark:text-rose-400 font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Overdue ({counts.overdue})
            </button>
          </div>

          {/* Clear Completed Action */}
          {counts.completed > 0 && (
            <button
              id="btn-clear-completed"
              type="button"
              onClick={onClearCompleted}
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-1 transition-colors shrink-0"
              title="Remove all completed tasks"
            >
              Clear Done
            </button>
          )}
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-tasks-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
              aria-label="Filter by priority"
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent Priority</option>
              <option value="high">🟠 High Priority</option>
              <option value="medium">🔵 Medium Priority</option>
              <option value="low">⚪ Low Priority</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort tasks by"
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="deadline">⏰ By Deadline</option>
              <option value="priority">🔥 By Priority</option>
              <option value="newest">✨ Newest First</option>
              <option value="alphabetical">🔤 Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Items List with Animated Transitions */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleAlarm={onToggleAlarm}
                onSnooze={onSnooze}
              />
            ))
          ) : (
            <div 
              id="task-list-empty-state"
              className="py-12 px-4 text-center rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No tasks found
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query to see more tasks.'
                  : 'Add your first task above to start organizing your day!'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
