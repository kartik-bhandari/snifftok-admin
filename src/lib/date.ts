import { format, formatDistanceToNow, parseISO } from 'date-fns'

const TZ = 'Asia/Kolkata'

/** Format an ISO date string or Date to a human-readable date in IST */
export function formatDate(date: string | Date, fmt = 'd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  // date-fns doesn't have built-in tz support without date-fns-tz;
  // We format in IST using Intl as a workaround since the project avoids extra deps
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(d)
}

/** Format date + time in IST */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
    hour12: true,
  }).format(d)
}

/** Relative time — "3 minutes ago" */
export function fromNow(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/** Format as short time — "2:30 PM" */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
    hour12: true,
  }).format(d)
}

/** Get today's date at midnight IST as ISO string */
export function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
