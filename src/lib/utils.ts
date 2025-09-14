import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date using the provided format string
 * Handles Date objects, valid date strings, and invalid dates gracefully
 */
export function formatDateSafe(
  date: Date | string | null | undefined, 
  formatString: string = 'PPP',
  fallback: string = 'Invalid date'
): string {
  try {
    if (!date) return fallback
    
    const dateObj = date instanceof Date ? date : new Date(date)
    
    if (!isValid(dateObj)) {
      return fallback
    }
    
    return format(dateObj, formatString)
  } catch (error) {
    console.warn('Error formatting date:', error)
    return fallback
  }
}

/**
 * Formats a date in a short format (e.g., "Jan 15, 2024")
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDateSafe(date, 'MMM d, yyyy')
}

/**
 * Formats a date using Intl.DateTimeFormat for consistency with JobCard
 */
export function formatDateIntl(
  date: Date | string | null | undefined,
  locale: string = 'en-US'
): string {
  try {
    if (!date) return 'Invalid date'
    
    const dateObj = date instanceof Date ? date : new Date(date)
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj)
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid date'
  }
}
