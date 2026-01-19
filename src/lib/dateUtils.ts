/**
 * Date Utility Functions
 * 
 * These utilities ensure dates are formatted in local timezone (IST for Eassy)
 * instead of being converted to UTC, which causes timezone-related bugs.
 */

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 * 
 * ⚠️ Use this instead of date.toISOString().split('T')[0]
 * 
 * Why: toISOString() converts to UTC, causing a 5.5 hour shift for IST.
 * This results in dates being off by one day in some cases.
 * 
 * @param date - The Date object to format
 * @returns Date string in YYYY-MM-DD format (local timezone)
 * 
 * @example
 * const date = new Date(2026, 0, 1); // Jan 1, 2026 in IST
 * formatDateToYYYYMMDD(date); // "2026-01-01" ✅
 * date.toISOString().split('T')[0]; // "2025-12-31" ❌ (converted to UTC!)
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats current date to YYYY-MM-DD in local timezone
 * 
 * @returns Today's date in YYYY-MM-DD format (local timezone)
 * 
 * @example
 * getTodayYYYYMMDD(); // "2026-01-20"
 */
export const getTodayYYYYMMDD = (): string => {
    return formatDateToYYYYMMDD(new Date());
};

/**
 * Formats a Date object to ISO string in local timezone
 * Use for full datetime with time component
 * 
 * @param date - The Date object to format
 * @returns ISO-like string in local timezone
 */
export const formatDateToLocalISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
