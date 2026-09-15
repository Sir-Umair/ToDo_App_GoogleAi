export function formatDeadline(isoStr?: string): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

export interface DeadlineInfo {
  status: 'none' | 'overdue' | 'due-now' | 'due-soon' | 'upcoming';
  relativeText: string;
  diffMs: number;
  isOverdue: boolean;
  isDueNow: boolean;
}

export function getDeadlineInfo(isoStr?: string, completed?: boolean): DeadlineInfo {
  if (!isoStr || completed) {
    return {
      status: 'none',
      relativeText: '',
      diffMs: 0,
      isOverdue: false,
      isDueNow: false
    };
  }

  const target = new Date(isoStr).getTime();
  if (isNaN(target)) {
    return {
      status: 'none',
      relativeText: '',
      diffMs: 0,
      isOverdue: false,
      isDueNow: false
    };
  }

  const now = Date.now();
  const diffMs = target - now;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < -1) {
    const absMin = Math.abs(diffMinutes);
    if (absMin >= 1440) {
      const days = Math.floor(absMin / 1440);
      return {
        status: 'overdue',
        relativeText: `${days}d overdue`,
        diffMs,
        isOverdue: true,
        isDueNow: false
      };
    }
    if (absMin >= 60) {
      const hours = Math.floor(absMin / 60);
      return {
        status: 'overdue',
        relativeText: `${hours}h overdue`,
        diffMs,
        isOverdue: true,
        isDueNow: false
      };
    }
    return {
      status: 'overdue',
      relativeText: `${absMin}m overdue`,
      diffMs,
      isOverdue: true,
      isDueNow: false
    };
  }

  if (diffMinutes >= -1 && diffMinutes <= 1) {
    return {
      status: 'due-now',
      relativeText: 'Due now!',
      diffMs,
      isOverdue: false,
      isDueNow: true
    };
  }

  if (diffMinutes > 1 && diffMinutes <= 30) {
    return {
      status: 'due-soon',
      relativeText: `Due in ${diffMinutes}m`,
      diffMs,
      isOverdue: false,
      isDueNow: false
    };
  }

  if (diffMinutes > 30 && diffMinutes < 1440) {
    const hours = Math.round(diffMinutes / 60);
    return {
      status: 'upcoming',
      relativeText: `Due in ~${hours}h`,
      diffMs,
      isOverdue: false,
      isDueNow: false
    };
  }

  const days = Math.round(diffMinutes / 1440);
  return {
    status: 'upcoming',
    relativeText: `Due in ${days}d`,
    diffMs,
    isOverdue: false,
    isDueNow: false
  };
}
