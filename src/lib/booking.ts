const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** How long an unpaid PENDING booking holds inventory before it's ignored. */
export const PENDING_HOLD_MS = 30 * 60 * 1000;

/** Number of nights between two dates (minimum 1). */
export function computeNights(checkIn: Date, checkOut: Date): number {
  return Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY));
}

/** Half-open interval overlap: [aStart, aEnd) intersects [bStart, bEnd). */
export function datesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}
