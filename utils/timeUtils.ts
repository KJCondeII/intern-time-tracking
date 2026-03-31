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
 * Calculates hours worked between two time strings
 * Handles cases where times might cross midnight
 */
export function calculateHours(
  startTime: string,
  endTime: string
): number {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return 0;
  }

  const startMinutes = timeToMinutes(startTime);
  let endMinutes = timeToMinutes(endTime);

  // If end time is less than start time, assume it's next day
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return diffMinutes / 60;
}

/**
 * Validates complete time record form
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
  } else if (amIn && timeToMinutes(amOut) <= timeToMinutes(amIn)) {
    errors.am_out = "AM Out time must be after AM In time";
  }

  // Validate PM times
  if (!pmIn) {
    errors.pm_in = "PM In time is required";
  } else if (!isValidTime(pmIn)) {
    errors.pm_in = "Invalid time format (use HH:MM)";
  } else if (amOut && timeToMinutes(pmIn) < timeToMinutes(amOut)) {
    errors.pm_in = "PM In time should be after AM Out time";
  }

  if (!pmOut) {
    errors.pm_out = "PM Out time is required";
  } else if (!isValidTime(pmOut)) {
    errors.pm_out = "Invalid time format (use HH:MM)";
  } else if (pmIn && timeToMinutes(pmOut) <= timeToMinutes(pmIn)) {
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
