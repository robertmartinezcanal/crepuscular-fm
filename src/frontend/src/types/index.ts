import { Weekday } from "@/backend";
import type { NewsItem, ProgramSlot } from "@/backend";

export { Weekday };
export type { NewsItem, ProgramSlot };

/** Nanosecond backend timestamps → JS Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Format a backend timestamp as "15 de mayo de 2024". */
export function formatNewsDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Fecha por confirmar";
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`;
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  [Weekday.monday]: "Lunes",
  [Weekday.tuesday]: "Martes",
  [Weekday.wednesday]: "Miércoles",
  [Weekday.thursday]: "Jueves",
  [Weekday.friday]: "Viernes",
  [Weekday.saturday]: "Sábado",
  [Weekday.sunday]: "Domingo",
};

export const WEEKDAY_ORDER: Weekday[] = [
  Weekday.monday,
  Weekday.tuesday,
  Weekday.wednesday,
  Weekday.thursday,
  Weekday.friday,
  Weekday.saturday,
  Weekday.sunday,
];

/** JS getDay() (0 = Sunday) → backend Weekday. */
export function weekdayFromDate(date: Date): Weekday {
  const map: Weekday[] = [
    Weekday.sunday,
    Weekday.monday,
    Weekday.tuesday,
    Weekday.wednesday,
    Weekday.thursday,
    Weekday.friday,
    Weekday.saturday,
  ];
  return map[date.getDay()];
}

/** "HH:MM" → minutes since midnight, or null when unparseable. */
export function timeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** The program airing right now, if any slot matches the current weekday and time. */
export function findCurrentProgram(
  slots: ProgramSlot[],
  now: Date,
): ProgramSlot | null {
  const today = weekdayFromDate(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  for (const slot of slots) {
    if (slot.weekday !== today) continue;
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (start === null || end === null) continue;
    if (minutes >= start && minutes < end) return slot;
  }
  return null;
}
