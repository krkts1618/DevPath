/**
 * Roadmap Date and Timezone Utilities (Asia/Kolkata default)
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a Date into YYYY-MM-DD string in Asia/Kolkata timezone
 * @param {Date|string} [date=new Date()]
 * @returns {string} e.g. "2026-10-30"
 */
export function getKolkataDateString(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  return parts; // en-CA gives YYYY-MM-DD
}

/**
 * Calculates scheduled date for a roadmap day based on roadmap start date.
 * scheduled_date = roadmap.start_date + (day_number - 1)
 *
 * @param {Date|string|null} startDate - The start date of the roadmap
 * @param {number} dayNumber - 1-based day index within the roadmap
 * @returns {Date|null}
 */
export function calculateScheduledDate(startDate, dayNumber) {
  if (!startDate || !dayNumber || dayNumber < 1) {
    return null;
  }
  const base = new Date(startDate);
  if (isNaN(base.getTime())) {
    return null;
  }
  // Add (day_number - 1) days
  const scheduled = new Date(base);
  scheduled.setUTCDate(scheduled.getUTCDate() + (dayNumber - 1));
  return scheduled;
}

/**
 * Formats a Date object in ISO date (YYYY-MM-DD) or Kolkata local date string
 * @param {Date} date
 * @param {string} [timeZone='Asia/Kolkata']
 * @returns {string}
 */
export function formatKolkataDate(date, timeZone = DEFAULT_TIMEZONE) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Calculates the 1-based day number of a roadmap given its start date and a target date.
 * @param {Date|string} startDate
 * @param {Date|string} [targetDate]
 * @returns {number|null} 1-based day number, or null if invalid
 */
export function calculateDayNumberForDate(startDate, targetDate = new Date()) {
  if (!startDate) return null;
  const startStr = getKolkataDateString(startDate);
  const targetStr = getKolkataDateString(targetDate);

  const startUtc = new Date(`${startStr}T00:00:00Z`).getTime();
  const targetUtc = new Date(`${targetStr}T00:00:00Z`).getTime();

  const diffDays = Math.round((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Adds (or subtracts) a given number of days to a YYYY-MM-DD date string in Asia/Kolkata
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} - YYYY-MM-DD
 */
export function addDaysToKolkataDate(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return getKolkataDateString(d);
}

/**
 * Returns the previous calendar day's YYYY-MM-DD string
 * @param {string} [dateStr]
 * @returns {string}
 */
export function getPreviousKolkataDate(dateStr = getKolkataDateString()) {
  return addDaysToKolkataDate(dateStr, -1);
}

/**
 * Returns the next calendar day's YYYY-MM-DD string
 * @param {string} [dateStr]
 * @returns {string}
 */
export function getNextKolkataDate(dateStr = getKolkataDateString()) {
  return addDaysToKolkataDate(dateStr, 1);
}

/**
 * Returns current HH:mm formatted string in Asia/Kolkata
 * @param {Date|string} [date=new Date()]
 * @returns {string} e.g. "14:30"
 */
export function getKolkataTimeString(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: DEFAULT_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Returns day of week (0=Sunday, 1=Monday... 6=Saturday) in Asia/Kolkata
 * @param {Date|string} [date=new Date()]
 * @returns {number}
 */
export function getKolkataDayOfWeek(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: DEFAULT_TIMEZONE,
    weekday: 'short',
  }).format(d);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekdayStr] ?? d.getDay();
}

/**
 * Checks whether a given HH:mm time falls within a quiet-hours window
 * Supports overnight ranges (e.g. 22:30 to 07:00)
 * @param {string} timeStr - "HH:mm"
 * @param {string} quietHoursStart - "HH:mm"
 * @param {string} quietHoursEnd - "HH:mm"
 * @returns {boolean}
 */
export function isTimeInQuietHours(timeStr, quietHoursStart, quietHoursEnd) {
  if (!timeStr || !quietHoursStart || !quietHoursEnd) return false;
  if (quietHoursStart === quietHoursEnd) return false;
  if (quietHoursStart < quietHoursEnd) {
    return timeStr >= quietHoursStart && timeStr <= quietHoursEnd;
  }
  // Overnight range: e.g. start at 22:30 and end at 07:00
  return timeStr >= quietHoursStart || timeStr <= quietHoursEnd;
}

