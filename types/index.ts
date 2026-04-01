/**
 * Time Record Interface - Represents a daily time tracking record
 */
export interface TimeRecord {
  id?: string;
  date: string;
  am_in: string;
  am_out: string;
  pm_in: string;
  pm_out: string;
  total_hours: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Form state interface - Tracks user input
 */
export interface TimeFormState {
  date: string;
  am_in: string;
  am_out: string;
  pm_in: string;
  pm_out: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * API Response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * User Quota Interface - Stores user's monthly hours quota
 */
export interface UserQuota {
  id?: string;
  user_id?: string;
  monthly_hours_quota: number;
  created_at?: string;
  updated_at?: string;
}
