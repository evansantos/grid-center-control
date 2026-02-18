/**
 * Human-friendly time formatting utilities for timeline views
 */

export interface TimeFormatOptions {
  showSeconds?: boolean;
  compact?: boolean;
  showRelative?: boolean;
}

/**
 * Format milliseconds into human-readable duration
 */
export function formatDuration(ms: number, options: TimeFormatOptions = {}): string {
  const { showSeconds = true, compact = false } = options;
  
  if (ms < 1000) {
    return compact ? `${ms}ms` : `${ms} milliseconds`;
  }
  
  if (ms < 60000) {
    const seconds = (ms / 1000).toFixed(showSeconds ? 1 : 0);
    return compact ? `${seconds}s` : `${seconds} second${seconds === '1' ? '' : 's'}`;
  }
  
  if (ms < 3600000) {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (compact) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    
    const minuteStr = `${minutes} minute${minutes === 1 ? '' : 's'}`;
    return seconds > 0 ? `${minuteStr} ${seconds} second${seconds === 1 ? '' : 's'}` : minuteStr;
  }
  
  // For hours and above
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (compact) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  const hourStr = `${hours} hour${hours === 1 ? '' : 's'}`;
  return minutes > 0 ? `${hourStr} ${minutes} minute${minutes === 1 ? '' : 's'}` : hourStr;
}

/**
 * Get relative time from now (enhanced version of existing timeAgo)
 */
export function timeAgo(iso: string | number): string {
  const date = typeof iso === 'string' ? new Date(iso) : new Date(iso);
  const ms = Date.now() - date.getTime();
  const secs = Math.floor(ms / 1000);
  
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs} second${secs === 1 ? '' : 's'} ago`;
  
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Format timestamp with context-aware display
 */
export function formatTimestamp(
  iso: string | number, 
  options: { showRelative?: boolean; format?: 'short' | 'medium' | 'long' } = {}
): string {
  const { showRelative = false, format = 'medium' } = options;
  const date = typeof iso === 'string' ? new Date(iso) : new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // If recent and showRelative is true, use relative format
  if (showRelative && diffMs < 7 * 24 * 60 * 60 * 1000) {
    return timeAgo(iso);
  }
  
  // Format based on how recent the timestamp is
  const isToday = diffDays === 0;
  const isYesterday = diffDays === 1;
  const isThisWeek = diffDays < 7;
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (isToday) {
    return format === 'short' ? timeStr : `Today at ${timeStr}`;
  }
  
  if (isYesterday) {
    return format === 'short' ? 'Yesterday' : `Yesterday at ${timeStr}`;
  }
  
  if (isThisWeek) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return format === 'short' ? dayName : `${dayName} at ${timeStr}`;
  }
  
  if (isThisYear) {
    const monthDay = date.toLocaleDateString('en-US', { 
      month: format === 'short' ? 'short' : 'long', 
      day: 'numeric' 
    });
    return format === 'short' ? monthDay : `${monthDay} at ${timeStr}`;
  }
  
  // Different year
  const fullDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric'
  });
  return format === 'short' ? fullDate : `${fullDate} at ${timeStr}`;
}

/**
 * Format session duration for display
 */
export function formatSessionDuration(startMs: number, endMs?: number): string {
  const duration = endMs ? endMs - startMs : Date.now() - startMs;
  return formatDuration(duration, { compact: true });
}

/**
 * Get a contextual time description for timeline entries
 */
export function getTimeContext(startMs: number, durationMs: number): {
  start: string;
  duration: string;
  context: string;
} {
  const startTime = formatTimestamp(startMs, { format: 'medium' });
  const duration = formatDuration(durationMs, { compact: true });
  
  let context = '';
  if (durationMs < 1000) {
    context = 'Very fast';
  } else if (durationMs < 5000) {
    context = 'Quick';
  } else if (durationMs < 30000) {
    context = 'Normal';
  } else if (durationMs < 120000) {
    context = 'Slow';
  } else {
    context = 'Very slow';
  }
  
  return {
    start: startTime,
    duration,
    context
  };
}

/**
 * Format time range for session spans
 */
export function formatTimeRange(startMs: number, endMs: number): string {
  const start = new Date(startMs);
  const end = new Date(endMs);
  const startTime = start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  const endTime = end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  
  const isToday = start.toDateString() === new Date().toDateString();
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isToday && isSameDay) {
    return `${startTime} - ${endTime}`;
  }
  
  if (isSameDay) {
    const dateStr = formatTimestamp(startMs, { format: 'short' });
    return `${dateStr}, ${startTime} - ${endTime}`;
  }
  
  const startDate = formatTimestamp(startMs, { format: 'short' });
  const endDate = formatTimestamp(endMs, { format: 'short' });
  return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}