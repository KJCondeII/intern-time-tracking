import { ValidationResult } from "@/types";

/**
 * Validates if a time string is in valid HH:MM format
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validates if a date string is in valid YYYY-MM-DD format
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Converts time string (HH:MM) to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Checks if timeB is after timeA (same day, handles noon correctly)
 */
export function isTimeAfter(timeB: string, timeA: string): boolean {
  return timeToMinutes(timeB) > timeToMinutes(timeA);
}

/**
 * Calculates hours worked between two time strings (same day)
 * Properly handles times including noon (12:00)
 * Using 24-hour format internally: 08:00=8AM, 12:00=noon, 13:00=1PM, 17:00=5PM
 * But displayed to user as: 8:00 AM, 12:00 PM, 1:00 PM, 5:00 PM
 */
export function calculateHours(
  startTime: string,
  endTime: string
): number {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return 0;
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // For same-day calculation (normal work hours)
  // This handles 08:00 to 12:00 (4 hours) or 13:00 to 17:00 (4 hours)
  if (endMinutes > startMinutes) {
    const diffMinutes = endMinutes - startMinutes;
    return diffMinutes / 60;
  }

  // If end time is less than start time, assume it's next day (rare edge case)
  if (endMinutes < startMinutes) {
    const diffMinutes = (24 * 60 - startMinutes) + endMinutes;
    return diffMinutes / 60;
  }

  // Times are equal
  return 0;
}

/**
 * Validates complete time record form
 * Handles 12:00 as noon correctly
 */
export function validateTimeRecord(
  date: string,
  amIn: string,
  amOut: string,
  pmIn: string,
  pmOut: string
): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate date
  if (!date) {
    errors.date = "Date is required";
  } else if (!isValidDate(date)) {
    errors.date = "Invalid date format (use YYYY-MM-DD)";
  }

  // Validate AM times
  if (!amIn) {
    errors.am_in = "AM In time is required";
  } else if (!isValidTime(amIn)) {
    errors.am_in = "Invalid time format (use HH:MM)";
  }

  if (!amOut) {
    errors.am_out = "AM Out time is required";
  } else if (!isValidTime(amOut)) {
    errors.am_out = "Invalid time format (use HH:MM)";
  } else if (amIn && !isTimeAfter(amOut, amIn)) {
    errors.am_out = "AM Out time must be after AM In time";
  }

  // Validate PM times
  if (!pmIn) {
    errors.pm_in = "PM In time is required";
  } else if (!isValidTime(pmIn)) {
    errors.pm_in = "Invalid time format (use HH:MM)";
  } else if (amOut && !isTimeAfter(pmIn, amOut)) {
    errors.pm_in = "PM In time should be after AM Out time";
  }

  if (!pmOut) {
    errors.pm_out = "PM Out time is required";
  } else if (!isValidTime(pmOut)) {
    errors.pm_out = "Invalid time format (use HH:MM)";
  } else if (pmIn && !isTimeAfter(pmOut, pmIn)) {
    errors.pm_out = "PM Out time must be after PM In time";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates total hours for a day (AM + PM)
 */
export function calculateDailyHours(
  amIn: string,
  amOut: string,
  pmIn: string,
  pmOut: string
): string {
  const amHours = calculateHours(amIn, amOut);
  const pmHours = calculateHours(pmIn, pmOut);

  const totalHours = amHours + pmHours;
  return totalHours.toFixed(2);
}
