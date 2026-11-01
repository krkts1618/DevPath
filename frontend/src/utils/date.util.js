import { useState, useEffect } from 'react';

/**
 * DevPath Frontend Date & Timezone Utilities
 * Enforces strict Asia/Kolkata (IST, UTC+05:30) timezone calculation across all views.
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current Date in system
 */
export function getKolkataNow() {
  return new Date();
}

/**
 * Formats a Date or date string into YYYY-MM-DD string in Asia/Kolkata timezone
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} e.g. "2026-11-01"
 */
export function getKolkataDateString(date = new Date()) {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Returns the current hour (0-23) in Asia/Kolkata timezone
 * @param {Date|string|number} [date=new Date()]
 * @returns {number}
 */
export function getKolkataHour(date = new Date()) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date().getHours();

  const hourStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: DEFAULT_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(d);

  const parsed = parseInt(hourStr, 10);
  return isNaN(parsed) ? 12 : (parsed === 24 ? 0 : parsed);
}

/**
 * Formats a Date or date string with Indian Standard Time convention
 * @param {Date|string|number} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatKolkataDate(date, options = {}) {
  if (!date) return '';
  // If date is pure YYYY-MM-DD, parse as noon UTC to avoid local offset issues
  let d;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    d = new Date(`${date}T12:00:00Z`);
  } else {
    d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  }

  if (isNaN(d.getTime())) return String(date);

  const defaultOptions = {
    timeZone: DEFAULT_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
}

/**
 * Formats a time string in Asia/Kolkata
 * @param {Date|string|number} date
 * @param {boolean} [includeSeconds=false]
 * @returns {string} e.g. "14:30" or "02:30 PM"
 */
export function formatKolkataTime(date, includeSeconds = false) {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  }).format(d);
}

/**
 * Formats a full date and time string in Asia/Kolkata
 * @param {Date|string|number} date
 * @returns {string} e.g. "01 Nov 2026, 02:30 PM"
 */
export function formatKolkataDateTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: DEFAULT_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Adds or subtracts days to a YYYY-MM-DD date string without timezone drift
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} - YYYY-MM-DD
 */
export function addDaysToKolkataDate(dateStr, days) {
  if (!dateStr) return getKolkataDateString();
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return getKolkataDateString(d);
}

/**
 * Returns previous calendar day's YYYY-MM-DD
 */
export function getPreviousKolkataDate(dateStr = getKolkataDateString()) {
  return addDaysToKolkataDate(dateStr, -1);
}

/**
 * Returns next calendar day's YYYY-MM-DD
 */
export function getNextKolkataDate(dateStr = getKolkataDateString()) {
  return addDaysToKolkataDate(dateStr, 1);
}

/**
 * Returns dynamic contextual greeting based on Asia/Kolkata current time:
 * - 05:00 to 11:59: "Good morning, Engineer"
 * - 12:00 to 16:59: "Good afternoon, Engineer"
 * - 17:00 to 20:59: "Good evening, Engineer"
 * - 21:00 to 04:59: "Working late, Engineer"
 */
export function getKolkataGreeting(date = new Date()) {
  const hour = getKolkataHour(date);

  if (hour >= 5 && hour < 12) {
    return {
      title: 'Good morning, Engineer',
      subtitle: 'Fresh mind for deep architecture, algorithms, and roadmap execution.',
      period: 'morning',
      hour,
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      title: 'Good afternoon, Engineer',
      subtitle: 'Keep the momentum going with structured daily milestone progression.',
      period: 'afternoon',
      hour,
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      title: 'Good evening, Engineer',
      subtitle: "Solidify today's engineering concepts and prepare for interview recall.",
      period: 'evening',
      hour,
    };
  }

  // 21:00 to 04:59
  return {
    title: 'Working late, Engineer',
    subtitle: 'Late-night focus session. Pace your energy and lock in your deep work.',
    period: 'night',
    hour,
  };
}

/**
 * Custom React Hook that returns the current Asia/Kolkata greeting and date.
 * Reactively updates every 30 seconds and on window focus so boundary transitions
 * (e.g. 11:59 AM -> 12:00 PM) update seamlessly without page reloads.
 */
export function useKolkataGreeting() {
  const [greetingData, setGreetingData] = useState(() => getKolkataGreeting());
  const [todayStr, setTodayStr] = useState(() => getKolkataDateString());
  const [formattedDate, setFormattedDate] = useState(() =>
    formatKolkataDate(new Date(), { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
  );

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setGreetingData(getKolkataGreeting(now));
      setTodayStr(getKolkataDateString(now));
      setFormattedDate(
        formatKolkataDate(now, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      );
    };

    const interval = setInterval(update, 30000); // Check every 30s
    window.addEventListener('focus', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', update);
    };
  }, []);

  return {
    ...greetingData,
    todayStr,
    formattedDate,
  };
}

/**
 * Returns human-readable relative time in Asia/Kolkata
 */
export function formatRelativeKolkataTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }
  if (diffSec < 172800) {
    return 'yesterday';
  }
  return formatKolkataDate(d, { month: 'short', day: 'numeric' });
}

/**
 * Helper to construct safe calendar month dates (YYYY-MM-DD)
 * without any UTC midnight offset bugs
 */
export function getCalendarMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
  const totalDays = lastDay.getDate();

  const days = [];

  // Helper to format year, month, day into YYYY-MM-DD
  const toStr = (y, m, d) => {
    const yStr = String(y).padStart(4, '0');
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  // Prior month overflow days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({
      dayNumber: d,
      dateStr: toStr(prevYear, prevMonth, d),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      dayNumber: d,
      dateStr: toStr(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Next month overflow days
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    days.push({
      dayNumber: d,
      dateStr: toStr(nextYear, nextMonth, d),
      isCurrentMonth: false,
    });
  }

  return days;
}

/**
 * Helper to construct safe calendar week days (7 days)
 * without UTC midnight offset bugs
 */
export function getCalendarWeekDays(currentDate) {
  const curr = new Date(currentDate);
  const dayOfWeek = curr.getDay();
  const firstDayOfWeek = new Date(curr);
  firstDayOfWeek.setDate(curr.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDayOfWeek);
    d.setDate(firstDayOfWeek.getDate() + i);
    const y = d.getFullYear();
    const m = d.getMonth();
    const dateNum = d.getDate();
    const yStr = String(y).padStart(4, '0');
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(dateNum).padStart(2, '0');

    days.push({
      dateObj: d,
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: dateNum,
    });
  }
  return days;
}
