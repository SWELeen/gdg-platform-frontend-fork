// Event date/time helpers for the leader dashboards.
//
// Committee events store display strings ("Oct 14, 2026", "4:00 PM") because that is
// the shape of the existing mock data and of every component that renders it. Native
// form inputs produce ISO values ("2026-10-14", "16:00"), so new events are converted
// here before they enter the shared dashboard state, and filters parse either shape.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})$/;
const ISO_TIME = /^(\d{2}):(\d{2})/;

/** Parses "2026-10-14" or "Oct 14, 2026" into a local-midnight Date, or null. */
export function parseEventDate(value: string | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();

  const iso = ISO_DATE.exec(trimmed);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const display = DISPLAY_DATE.exec(trimmed);
  if (display) {
    const month = MONTHS.findIndex((name) => name.toLowerCase() === display[1].toLowerCase());
    if (month === -1) return null;
    return new Date(Number(display[3]), month, Number(display[2]));
  }

  return null;
}

/** "2026-10-14" → "Oct 14, 2026". Already-formatted or unknown values pass through. */
export function formatEventDate(value: string): string {
  const iso = ISO_DATE.exec(value.trim());
  if (!iso) return value;
  return `${MONTHS[Number(iso[2]) - 1]} ${Number(iso[3])}, ${iso[1]}`;
}

/** "16:00" → "4:00 PM". Already-formatted or unknown values pass through. */
export function formatEventTime(value: string): string {
  const iso = ISO_TIME.exec(value.trim());
  if (!iso) return value;
  const hours = Number(iso[1]);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${iso[2]} ${period}`;
}

/** Date-badge parts ("OCT", "14") for an event date in either supported shape. */
export function getEventDateBadge(value: string): { month: string; day: string } | null {
  const date = parseEventDate(value);
  if (!date) return null;
  return { month: MONTHS[date.getMonth()].toUpperCase(), day: String(date.getDate()) };
}

/** Local-date ISO string ("2026-10-14") for a Date, without UTC shifting. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export type EventDateFilter = "all" | "upcoming" | "october" | "november";

/** Applies the leader dashboard's date filter options to a stored event date. */
export function matchesEventDateFilter(value: string, filter: string, now: Date): boolean {
  if (filter === "all") return true;
  const date = parseEventDate(value);
  if (!date) return false;

  if (filter === "upcoming") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    return date >= today && date <= limit;
  }
  if (filter === "october") return date.getFullYear() === 2026 && date.getMonth() === 9;
  if (filter === "november") return date.getFullYear() === 2026 && date.getMonth() === 10;
  return true;
}

const DISPLAY_TIME = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

/** Parses "4:00 PM" or "16:00" into 24h hours/minutes, or null. */
export function parseEventTime(value: string | undefined): { hours: number; minutes: number } | null {
  if (!value) return null;
  const trimmed = value.trim();
  const display = DISPLAY_TIME.exec(trimmed);
  if (display) {
    const hours12 = Number(display[1]) % 12;
    return { hours: display[3].toUpperCase() === "PM" ? hours12 + 12 : hours12, minutes: Number(display[2]) };
  }
  const iso = ISO_TIME.exec(trimmed);
  return iso ? { hours: Number(iso[1]), minutes: Number(iso[2]) } : null;
}

/** Local Date for an event's date and (optional) start time, or null. */
export function parseEventDateTime(date: string, time?: string): Date | null {
  const day = parseEventDate(date);
  if (!day) return null;
  const parsedTime = parseEventTime(time);
  if (parsedTime) day.setHours(parsedTime.hours, parsedTime.minutes);
  return day;
}

/**
 * ISO start time with the Saudi offset (+03:00). Event times are entered as local
 * University of Jeddah times and carry no zone, so this is the stated assumption.
 */
export function toSaudiIsoDateTime(date: string, time: string): string | null {
  const day = parseEventDate(date);
  const parsedTime = parseEventTime(time);
  if (!day || !parsedTime) return null;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${toIsoDate(day)}T${pad(parsedTime.hours)}:${pad(parsedTime.minutes)}:00+03:00`;
}

/** True when an event's calendar date is today or later, relative to `now` (ms). */
export function isUpcomingEventDate(date: string, now: number): boolean {
  const day = parseEventDate(date);
  if (!day) return false;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return day.getTime() >= today.getTime();
}
