/**
 * **WHAT:** Date and time utility helper providing date formatting, timezone conversion, and timestamp generation
 * 
 * **WHY:** Centralizes date/time operations for consistent handling across test suite
 * 
 * **WHERE USED:**
 * - Test data generation with unique timestamps
 * - Date formatting for form inputs and validations
 * - UTC to CST timezone conversions
 * - Creating unique identifiers based on date/time
 * 
 * **WHEN TO USE:**
 * - Need formatted dates for test data
 * - Generate unique timestamps or IDs
 * - Convert between timezones
 * - Get current date with offset (future/past dates)
 * 
 * @example
 * // Generate unique ID
 * const uniqueId = DateHelper.getUniqueNumberBasedOnDate();
 * // "202512091530456789123"
 * 
 * @example
 * // Format date for input fields
 * const formattedDate = DateHelper.formatDate_MM_DD_YYYY(new Date());
 * // "12/09/2025"
 */

import { fixture } from "../../hooks/fixture";
import { toZonedTime } from 'date-fns-tz';

const { format } = require('date-fns');

/**
 * **DateHelper Class**
 * 
 * **RESPONSIBILITY:** Provides static utility methods for date/time operations
 * 
 * **KEY CAPABILITIES:**
 * - Get weekday names from numbers
 * - Generate timestamps in various formats
 * - Create unique date-based identifiers
 * - Convert UTC to CST timezone
 * - Format dates for specific patterns
 */
export default abstract class DateHelper {
    /**
     * **WHAT:** Converts weekday number (0-6) to weekday name
     * 
     * @param weekDayNumber - Day number (0=Sunday, 1=Monday, ..., 6=Saturday)
     * 
     * @returns Weekday name as string
     * 
     * @example
     * const day = DateHelper.getWeekDayName(0); // "Sunday"
     * const day = DateHelper.getWeekDayName(5); // "Friday"
     */
    static getWeekDayName(weekDayNumber: number): string {
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekday[weekDayNumber];
    }

    /**
     * **WHAT:** Generates current timestamp in specified format
     * 
     * @param [dateFormat=""] - date-fns format string; defaults to 'yyyy-MM-dd HH:mm:ss.SSS'
     * 
     * @returns Formatted timestamp string
     * 
     * @example
     * const timestamp = DateHelper.getTimeStamp();
     * // "2025-12-09 15:30:45.123"
     * 
     * @example
     * const customFormat = DateHelper.getTimeStamp('MM/dd/yyyy');
     * // "12/09/2025"
     */
    static getTimeStamp(dateFormat: string = ""): string {
        if (dateFormat.length === 0)
            dateFormat = 'yyyy-MM-dd HH:mm:ss.SSS';

        let td = Date.now();
        return format(td, dateFormat);
    }

    /**
     * 
     * @param daysToAdd 
     * @returns returns current date in UTC as YYYY-MM-DD
     */
    static getDateTimeUTC(daysToAdd: number = 0): string {
        var date = new Date();

        // Add the specified number of days to the date
        date.setDate(date.getDate() + daysToAdd);

        var isoString = date.toISOString();

        // Split the isoString at 'T' and return the date part
        return isoString.split('T')[0];
    }

    /**
     * **WHAT:** Generates unique identifier combining current date (YYYYMMDD) and millisecond timestamp
     * 
     * **WHEN TO USE:**
     * - Creating unique test data (usernames, order IDs, etc.)
     * - Need guaranteed unique identifiers within test execution
     * - Generating scenario-specific identifiers
     * 
     * @returns Unique string starting with YYYYMMDD followed by timestamp
     * 
     * @example
     * const uniqueId = DateHelper.getUniqueNumberBasedOnDate();
     * // "202512091702345678901"
     * // First 8 chars: 20251209 (YYYYMMDD)
     * // Remaining: 1702345678901 (milliseconds since epoch)
     * 
     * @example
     * // In test data generation
     * const username = `testuser_${DateHelper.getUniqueNumberBasedOnDate()}`;
     * // "testuser_202512091702345678901"
     */
    static getUniqueNumberBasedOnDate(): string {
        let result = DateHelper.getDateTimeUTC();
        result = result.replaceAll("-", "");
        result += (new Date()).getTime().toString();
        return result;
    }

    /**
     * **WHAT:** Converts UTC date string to CST (Central Standard Time) timezone
     * 
     * **WHEN TO USE:**
     * - Working with timestamps from servers in different timezones
     * - Need to display/validate dates in Central time
     * - Converting API response dates for comparison
     * 
     * @param dateStrVal - Date string in UTC format
     * 
     * @returns Date object converted to CST timezone
     * 
     * @example
     * const utcDateStr = "2025-12-09T20:30:00Z";
     * const cstDate = DateHelper.getCSTDate(utcDateStr);
     * // Returns CST equivalent (6 hours behind UTC in winter)
     */
    static getCSTDate(dateStrVal: string): Date {
        const utcDate = new Date(dateStrVal);

        // Define the CST timezone
        const timeZone = 'America/Chicago';

        // Convert the UTC date to CST
        const cstDate = toZonedTime(utcDate, timeZone);

        fixture.logger.info(`converted CST date is - ${cstDate}`);
        return cstDate;
    }

    /**
     * 
     * @param date - date object
     * @returns returns date in MM/DD/YYYY format
     * @example 04/13/2025
     */
    static formatDate_MM_DD_YYYY(date: Date): string {
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

}