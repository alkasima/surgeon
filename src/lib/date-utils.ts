// src/lib/date-utils.ts
import type { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a Firebase Timestamp or Date to a JavaScript Date
 * Handles both Firebase Timestamp objects and regular Date objects/strings
 */
export function toDate(timestamp: Timestamp | Date | string | null | undefined): Date | null {
  if (!timestamp) return null;
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a string
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // If it's a Firebase Timestamp with toDate method
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a plain object with seconds and nanoseconds (Firebase Timestamp-like)
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as any).seconds * 1000);
  }
  
  // Fallback: try to create a Date from whatever we have
  try {
    return new Date(timestamp as any);
  } catch {
    return null;
  }
}

/**
 * Safely formats a Firebase Timestamp or Date to a localized date string
 */
export function formatDate(timestamp: Timestamp | Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = toDate(timestamp);
  if (!date) return 'Never';
  
  try {
    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Safely formats a Firebase Timestamp or Date to a localized date and time string
 */
export function formatDateTime(timestamp: Timestamp | Date | string | null | undefined): string {
  const date = toDate(timestamp);
  if (!date) return 'Never';
  
  try {
    return date.toLocaleString('en-US');
  } catch {
    return 'Invalid Date';
  }
}