/**
 * Date helpers. Dates are stored as ISO strings; period keys are "YYYY-MM".
 */

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM" period key for a date (defaults to now). */
export function periodKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** The period key that an ISO date falls into. */
export function periodOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return `${MONTHS[m - 1]} ${y}`;
}

export function shortMonth(period: string): string {
  const [, m] = period.split('-').map(Number);
  return MONTHS[(m ?? 1) - 1]?.slice(0, 3) ?? '';
}

/** Human-friendly date like "Oct 18, 2026" or relative "Today"/"Yesterday". */
export function friendlyDate(isoDate: string): string {
  const today = todayISO();
  if (isoDate === today) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isoDate === toISODate(yesterday)) return 'Yesterday';

  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** List of the last `count` period keys ending at `end` (inclusive), oldest first. */
export function recentPeriods(count: number, end: Date = new Date()): string[] {
  const result: string[] = [];
  const cursor = new Date(end.getFullYear(), end.getMonth(), 1);
  for (let i = 0; i < count; i++) {
    result.unshift(periodKey(cursor));
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return result;
}
