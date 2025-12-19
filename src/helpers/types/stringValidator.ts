/**
 * **WHAT:** String validation utility for checking string validity and length
 * 
 * **WHY:** Provides reusable string validation logic across test suite
 * 
 * **WHERE USED:**
 * - Validating test data before processing
 * - Checking extracted values from UI
 * - Input validation in step definitions
 * 
 * **WHEN TO USE:**
 * - Need to verify string is not undefined/null
 * - Check minimum string length requirements
 * - Validate user inputs or extracted data
 * 
 * @example
 * // Check if string is valid
 * const isValid = StringValidator.isValidString(username);
 * if (isValid) await loginPage.enterUsername(username);
 */

/**
 * **StringValidator Class**
 * 
 * **RESPONSIBILITY:** Provides static methods for string validation
 */
export default abstract class StringValidator {
    /**
     * **WHAT:** Validates that string is defined and meets minimum length requirement
     * 
     * @param strToCheck - String to validate
     * @param [strMinimumLengthToVerify=1] - Minimum required length
     * 
     * @returns true if string is defined and length >= minimum, false otherwise
     * 
     * @example
     * StringValidator.isValidString("test"); // true
     * StringValidator.isValidString(""); // false
     * StringValidator.isValidString("ab", 3); // false (length 2 < 3)
     * StringValidator.isValidString(undefined); // false
     */
    static isValidString(strToCheck: string, strMinimumLengthToVerify: number = 1): boolean{
        return (strToCheck != undefined && strToCheck.length >= strMinimumLengthToVerify);
    }
}