import { fromZonedTime as zonedTimeToUtc, toZonedTime as utcToZonedTime } from "date-fns-tz";
import { addMinutes, isBefore } from "date-fns";

export function toUtc(date: Date, tz: string) {
  return zonedTimeToUtc(date, tz);
}

export function toZoned(date: Date, tz: string) {
  return utcToZonedTime(date, tz);
}

export function generateSlots(
  startUtc: Date,
  endUtc: Date,
  durationMinutes: number,
  stepMinutes: number
) {
  const slots: { start: Date; end: Date }[] = [];
  for (let t = new Date(startUtc); isBefore(t, endUtc); t = addMinutes(t, stepMinutes)) {
    const end = addMinutes(t, durationMinutes);
    if (isBefore(end, endUtc) || end.getTime() === endUtc.getTime()) {
      slots.push({ start: new Date(t), end });
    }
  }
  return slots;
}

