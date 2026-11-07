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
 * Returns YYYY-MM string in Asia/Kolkata
 * @param {Date|string} [date=new Date()]
 * @returns {string} e.g. "2026-11"
 */
export function getKolkataYearMonth(date = new Date()) {
  const dateStr = getKolkataDateString(date);
  return dateStr.slice(0, 7);
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
 * Checks whether a given date or YYYY-MM-DD string is a weekday (Monday–Friday) in Asia/Kolkata
 * @param {Date|string} [date=new Date()]
 * @returns {boolean}
 */
export function isKolkataWeekday(date = new Date()) {
  const dow = getKolkataDayOfWeek(date);
  return dow >= 1 && dow <= 5;
}

/**
 * Checks whether a given date or YYYY-MM-DD string is a weekend (Saturday or Sunday) in Asia/Kolkata
 * @param {Date|string} [date=new Date()]
 * @returns {boolean}
 */
export function isKolkataWeekend(date = new Date()) {
  const dow = getKolkataDayOfWeek(date);
  return dow === 0 || dow === 6;
}

/**
 * For any given date, returns the week range { weekStartDate, weekEndDate }
 * where weekStartDate is Monday and weekEndDate is Sunday in Asia/Kolkata.
 * @param {Date|string} [date=new Date()]
 * @returns {{ weekStartDate: string, weekEndDate: string }}
 */
export function getKolkataWeekRange(date = new Date()) {
  const dateStr = getKolkataDateString(date);
  const dow = getKolkataDayOfWeek(date);
  const diffToMonday = dow === 0 ? 6 : dow - 1;
  const weekStartDate = addDaysToKolkataDate(dateStr, -diffToMonday);
  const weekEndDate = addDaysToKolkataDate(weekStartDate, 6);
  return { weekStartDate, weekEndDate };
}

/**
 * Calculates scheduled date for a roadmap day based on a 5-day learning week (skipping weekends).
 * Monday–Friday are learning days; Saturday and Sunday are reserved for revision.
 *
 * @param {Date|string|null} startDate - The start date of the roadmap
 * @param {number} dayNumber - 1-based day index within the roadmap
 * @returns {Date|null}
 */
export function calculateScheduledDate(startDate, dayNumber) {
  if (!startDate || !dayNumber || dayNumber < 1) {
    return null;
  }
  const baseStr = getKolkataDateString(startDate);
  // If startDate falls on weekend, advance to following Monday
  let currentStr = baseStr;
  while (isKolkataWeekend(currentStr)) {
    currentStr = addDaysToKolkataDate(currentStr, 1);
  }

  // Advance (dayNumber - 1) weekdays
  let weekdaysCount = 1;
  while (weekdaysCount < dayNumber) {
    currentStr = addDaysToKolkataDate(currentStr, 1);
    if (!isKolkataWeekend(currentStr)) {
      weekdaysCount++;
    }
  }

  const [y, m, d] = currentStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
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
 * Weekends do not advance the curriculum day number.
 * @param {Date|string} startDate
 * @param {Date|string} [targetDate]
 * @returns {number|null} 1-based day number, or null if invalid
 */
export function calculateDayNumberForDate(startDate, targetDate = new Date()) {
  if (!startDate) return null;
  const startStr = getKolkataDateString(startDate);
  const targetStr = getKolkataDateString(targetDate);

  if (targetStr < startStr) return 1;

  let currentStr = startStr;
  while (isKolkataWeekend(currentStr)) {
    currentStr = addDaysToKolkataDate(currentStr, 1);
  }

  let dayNumber = 1;
  while (currentStr < targetStr) {
    currentStr = addDaysToKolkataDate(currentStr, 1);
    if (!isKolkataWeekend(currentStr)) {
      dayNumber++;
    }
  }
  return dayNumber;
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

