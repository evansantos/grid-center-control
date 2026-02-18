'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

// ══════════════════════════════════════════════════════════════════════════════
// Types & Constants
// ══════════════════════════════════════════════════════════════════════════════

type ViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'task' | 'reminder' | 'other';
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  description?: string;
  agent?: string;
}

interface CalendarEntry {
  date: string;
  events: CalendarEvent[];
  agents: string[];
}

const EVENT_TYPE_CONFIGS = {
  meeting: { color: 'info', icon: '🤝', label: 'Meeting' },
  deadline: { color: 'error', icon: '⚡', label: 'Deadline' },
  task: { color: 'warning', icon: '✅', label: 'Task' },
  reminder: { color: 'default', icon: '🔔', label: 'Reminder' },
  other: { color: 'default', icon: '📅', label: 'Event' },
} as const;

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ══════════════════════════════════════════════════════════════════════════════

function getMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDayStr(date: Date): string {
  return `${getMonthStr(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based (0=Sunday becomes 6)
}

function getWeekDates(date: Date): Date[] {
  const monday = new Date(date);
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  monday.setDate(date.getDate() - diff);
  
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════

export function CalendarClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ────────────────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/api/calendar';
      if (viewMode === 'month') {
        endpoint += `?month=${getMonthStr(currentDate)}`;
      } else if (viewMode === 'week') {
        const weekDates = getWeekDates(currentDate);
        const start = getDayStr(weekDates[0]);
        const end = getDayStr(weekDates[6]);
        endpoint += `?start=${start}&end=${end}`;
      } else {
        endpoint += `?day=${getDayStr(currentDate)}`;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ────────────────────────────────────────────────────────────────────────────
  // Navigation
  // ────────────────────────────────────────────────────────────────────────────

  const navigatePrev = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() - 1);
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
    setSelectedDate(null);
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() + 1);
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
    setSelectedDate(null);
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setFocusedDate(getDayStr(new Date()));
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard Navigation
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!calendarRef.current?.contains(document.activeElement)) return;
      
      const today = getDayStr(new Date());
      const current = focusedDate || selectedDate || today;
      const currentDateObj = new Date(current);
      
      let newDate: Date | null = null;
      
      switch (e.key) {
        case 'ArrowLeft':
          newDate = new Date(currentDateObj);
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'ArrowRight':
          newDate = new Date(currentDateObj);
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'ArrowUp':
          newDate = new Date(currentDateObj);
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'ArrowDown':
          newDate = new Date(currentDateObj);
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'Enter':
        case ' ':
          setSelectedDate(current === selectedDate ? null : current);
          e.preventDefault();
          return;
        case 'Escape':
          setSelectedDate(null);
          return;
        default:
          return;
      }
      
      if (newDate) {
        const newDateStr = getDayStr(newDate);
        setFocusedDate(newDateStr);
        
        // Update view if needed
        if (viewMode === 'month' && newDate.getMonth() !== currentDate.getMonth()) {
          setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        } else if (viewMode === 'week') {
          const currentWeek = getWeekDates(currentDate);
          const isInCurrentWeek = currentWeek.some(d => getDayStr(d) === newDateStr);
          if (!isInCurrentWeek) {
            setCurrentDate(newDate);
          }
        } else if (viewMode === 'day') {
          setCurrentDate(newDate);
        }
        
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, focusedDate, selectedDate, viewMode]);

  // ────────────────────────────────────────────────────────────────────────────
  // Data Processing
  // ────────────────────────────────────────────────────────────────────────────

  const entryMap = new Map<string, CalendarEntry>();
  for (const entry of entries) {
    entryMap.set(entry.date, entry);
  }

  const selectedEntry = selectedDate ? entryMap.get(selectedDate) : null;

  // ────────────────────────────────────────────────────────────────────────────
  // Render Functions
  // ────────────────────────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOffset(year, month);
    
    const days = [];
    
    // Empty cells for offset
    for (let i = 0; i < firstDayOffset; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entryMap.get(dateStr);
      const isSelected = selectedDate === dateStr;
      const isFocused = focusedDate === dateStr;
      const isToday = dateStr === getDayStr(new Date());
      
      days.push(
        <button
          key={day}
          className={cn(
            'aspect-square p-1 rounded text-xs transition-all focus:outline-none focus:ring-2 focus:ring-grid-accent',
            'flex flex-col items-center justify-start gap-0.5',
            'hover:bg-grid-surface border',
            isSelected && 'border-grid-accent bg-grid-accent/10',
            isFocused && !isSelected && 'border-grid-text-dim',
            !isSelected && !isFocused && 'border-transparent',
            isToday && 'font-bold text-grid-accent'
          )}
          onClick={() => {
            setSelectedDate(isSelected ? null : dateStr);
            setFocusedDate(dateStr);
          }}
          aria-label={`${day} ${MONTH_NAMES[month]} ${year}${entry ? `, ${entry.events.length} events` : ''}`}
          tabIndex={isFocused || isToday ? 0 : -1}
        >
          <span className={cn(isToday && 'text-grid-accent')}>{day}</span>
          {entry && entry.events.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-center">
              {entry.events.slice(0, 3).map((event, i) => {
                const config = EVENT_TYPE_CONFIGS[event.type];
                return (
                  <div
                    key={`${event.id}-${i}`}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: `var(--grid-${config.color === 'default' ? 'text-muted' : config.color})`,
                    }}
                    title={event.title}
                  />
                );
              })}
              {entry.events.length > 3 && (
                <span className="text-[8px] text-grid-text-muted">+{entry.events.length - 3}</span>
              )}
            </div>
          )}
        </button>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {WEEKDAY_LABELS.map(label => (
          <div key={label} className="text-center text-xs font-medium text-grid-text-muted py-2">
            {label}
          </div>
        ))}
        {/* Days */}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map(date => {
          const dateStr = getDayStr(date);
          const entry = entryMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isFocused = focusedDate === dateStr;
          const isToday = dateStr === getDayStr(new Date());
          
          return (
            <Card
              key={dateStr}
              className={cn(
                'cursor-pointer transition-all',
                isSelected && 'border-grid-accent',
                isFocused && 'ring-2 ring-grid-accent'
              )}
              onClick={() => {
                setSelectedDate(isSelected ? null : dateStr);
                setFocusedDate(dateStr);
              }}
              tabIndex={isFocused || isToday ? 0 : -1}
              role="button"
              aria-label={`${date.getDate()} ${MONTH_NAMES[date.getMonth()]}${entry ? `, ${entry.events.length} events` : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="text-center">
                  <div className="text-xs text-grid-text-muted">
                    {WEEKDAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                  </div>
                  <div className={cn(
                    'text-lg font-semibold',
                    isToday && 'text-grid-accent'
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1 min-h-[120px]">
                {entry?.events.slice(0, 4).map(event => {
                  const config = EVENT_TYPE_CONFIGS[event.type];
                  return (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{
                        backgroundColor: `var(--grid-${config.color === 'default' ? 'surface' : config.color})/10`,
                        borderLeft: `3px solid var(--grid-${config.color === 'default' ? 'text-muted' : config.color})`,
                      }}
                      title={event.title}
                    >
                      {config.icon} {event.time && `${event.time} `}{event.title}
                    </div>
                  );
                })}
                {entry && entry.events.length > 4 && (
                  <div className="text-xs text-grid-text-muted text-center">
                    +{entry.events.length - 4} more
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = getDayStr(currentDate);
    const entry = entryMap.get(dateStr);
    const isToday = dateStr === getDayStr(new Date());
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className={cn(
              'text-lg font-semibold',
              isToday && 'text-grid-accent'
            )}>
              {WEEKDAY_LABELS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]}, {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
            </h2>
            <Badge variant={isToday ? 'info' : 'default'}>
              {isToday ? 'Today' : 'Day View'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {entry && entry.events.length > 0 ? (
            entry.events.map(event => {
              const config = EVENT_TYPE_CONFIGS[event.type];
              return (
                <Card key={event.id} variant="glass">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{config.icon}</span>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.time && (
                            <Badge size="sm" variant="outline">
                              {event.time}
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-grid-text-muted">{event.description}</p>
                        )}
                        {event.agent && (
                          <div className="text-xs text-grid-text-muted mt-1">
                            Agent: {event.agent}
                          </div>
                        )}
                      </div>
                      <Badge variant={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-grid-text-muted">
              <div className="text-2xl mb-2">📅</div>
              <div>No events scheduled for this day</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Main Render
  // ────────────────────────────────────────────────────────────────────────────

  const formatViewTitle = () => {
    if (viewMode === 'day') {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(currentDate);
      const start = weekDates[0];
      const end = weekDates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
      }
    } else {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="space-y-4" ref={calendarRef} role="application" aria-label="Calendar">
      <PageHeader
        title="Calendar"
        description={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view - Use arrow keys to navigate, Enter to select`}
        icon="📅"
        actions={
          <div className="flex items-center gap-2">
            {/* View mode buttons */}
            <div className="flex border border-grid-border rounded-md overflow-hidden">
              {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'primary' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
            
            {/* Navigation */}
            <Button
              variant="secondary"
              size="sm"
              onClick={navigatePrev}
              aria-label="Previous period"
            >
              ←
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={navigateNext}
              aria-label="Next period"
            >
              →
            </Button>
          </div>
        }
      />

      {/* Current period title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-grid-text">
          {formatViewTitle()}
        </h2>
      </div>

      {/* Calendar view */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="text-center py-8 text-grid-text-muted">
              Loading calendar data...
            </div>
          ) : viewMode === 'month' ? (
            renderMonthView()
          ) : viewMode === 'week' ? (
            renderWeekView()
          ) : (
            renderDayView()
          )}
        </CardContent>
      </Card>

      {/* Selected day details */}
      {selectedDate && selectedEntry && viewMode !== 'day' && (
        <Card variant="accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedDate === getDayStr(new Date()) ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(null)}
                aria-label="Close details"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedEntry.events.map(event => {
              const config = EVENT_TYPE_CONFIGS[event.type];
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded"
                  style={{ backgroundColor: 'var(--grid-surface)' }}
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.title}</span>
                      {event.time && (
                        <Badge size="sm" variant="outline">
                          {event.time}
                        </Badge>
                      )}
                      <Badge size="sm" variant={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-grid-text-muted mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}