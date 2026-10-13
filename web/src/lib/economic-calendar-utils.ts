import type { EconomicCalendarEvent } from "@/lib/economic-calendar";

/**
 * Determine if an economic calendar catalyst is already out/released.
 * Returns true if actual data is present or the scheduled release time has elapsed.
 */
export function isEventReleased(event: EconomicCalendarEvent): boolean {
  if (event.actual && event.actual.trim() !== "" && event.actual !== "—" && event.actual !== "-") {
    return true;
  }
  if (event.rawDate) {
    const time = new Date(event.rawDate).getTime();
    if (!isNaN(time) && time < Date.now()) {
      return true;
    }
  }
  return false;
}
