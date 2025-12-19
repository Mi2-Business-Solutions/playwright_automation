/**
 * @file Regular Expression Pattern Constants
 * 
 * WHAT this file provides:
 * Defines constants for common regular expression patterns used in text matching and validation.
 * These constants represent regex pattern types that can be used for flexible string matching.
 * 
 * WHY this exists:
 * - Centralizes regex pattern names used in the framework
 * - Provides semantic names for pattern types
 * - Makes code more readable when using regex matching
 * - Easy to extend with new pattern types
 * - Consistent pattern naming across the framework
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer
 * - Used by: Wrapper classes, validation utilities, text matching methods
 * - Dependencies: None (pure constants)
 * - Referenced in: String validators, element matching, pattern-based searches
 * 
 * WHEN to use:
 * - When building flexible text matching logic
 * - For validating input formats
 * - When implementing "starts with" or other pattern matching
 * - In methods that support multiple matching strategies
 * 
 * Important notes:
 * - These are pattern type identifiers, not actual regex patterns
 * - Used as configuration values to determine matching behavior
 * - Can be extended with more pattern types as needed
 */

/**
 * RegExHelper class
 * 
 * RESPONSIBILITY:
 * Provides named constants for regular expression pattern types used in string matching
 * operations. Acts as a vocabulary for different text matching strategies.
 * 
 * PATTERN TYPES INCLUDED:
 * - BEGINS_WITH: Pattern type for "starts with" string matching
 * 
 * WHEN TO USE:
 * - Use as configuration values in methods that support pattern matching
 * - Reference when implementing flexible string validation
 * - Include in methods that need to distinguish between matching strategies
 */
export default class RegExHelper{
    /**
     * "Begins with" pattern type identifier
     * 
     * WHAT: Identifier for "starts with" string matching pattern
     * WHEN: Use when you need to match strings that start with a specific prefix
     * 
     * Pattern Behavior:
     *   - Matches strings that begin with specified text
     *   - Equivalent to regex: ^prefix
     *   - Case-sensitive by default (depends on implementation)
     *   - Anchored to start of string (not substring match)
     * 
     * Common Use Cases:
     *   - Validating input format (phone numbers starting with country code)
     *   - Filtering elements by prefix (IDs starting with 'user-')
     *   - URL validation (URLs starting with 'https://')
     *   - Text matching where full match not needed
     * 
     * Implementation Pattern:
     *   ```typescript
     *   if (patternType === RegExHelper.BEGINS_WITH) {
     *     return new RegExp(`^${escapeRegex(prefix)}`);
     *   }
     *   ```
     * 
     * Example Scenarios:
     *   - Match IDs starting with 'btn-': beginsWith('btn-') matches 'btn-submit', 'btn-cancel'
     *   - Match URLs starting with 'https://': beginsWith('https://') matches 'https://example.com'
     *   - Match names starting with 'Mr.': beginsWith('Mr.') matches 'Mr. Smith', 'Mr. Jones'
     * 
     * @example
     * // In validation utility
     * function matchesPattern(text: string, pattern: string, type: string) {
     *   if (type === RegExHelper.BEGINS_WITH) {
     *     return text.startsWith(pattern);
     *   }
     *   // Other pattern types...
     * }
     * 
     * @example
     * // In element filter
     * async getElementsByIdPattern(prefix: string) {
     *   return this.elements.filter(el => 
     *     matchesPattern(el.id, prefix, RegExHelper.BEGINS_WITH)
     *   );
     * }
     * 
     * @example
     * // In string validator
     * class StringValidator {
     *   static validatePrefix(text: string, prefix: string) {
     *     return this.validate(text, prefix, RegExHelper.BEGINS_WITH);
     *   }
     * }
     */
    static readonly BEGINS_WITH = 'beginsWith';
}