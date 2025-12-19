/**
 * **WHAT:** Regular expression utility for pattern matching between strings
 * 
 * **WHY:** Provides flexible string matching with wildcards
 * 
 * **WHERE USED:**
 * - Validating dynamic text patterns in UI
 * - Matching messages with variable content
 * - Flexible string assertion in tests
 * 
 * **WHEN TO USE:**
 * - Need to match text with variable middle section
 * - Validating messages with dynamic data
 * - Pattern-based string validation
 * 
 * @example
 * const matcher = new RegExpMatcher();
 * matcher.matchAnythingBetween("Order", "created", "Order #12345 created");
 * // true - matches anything between "Order" and "created"
 */

/**
 * **RegExpMatcher Class**
 * 
 * **RESPONSIBILITY:** Provides regex-based string pattern matching
 */
export default class RegExpMatcher{
    /**
     * **WHAT:** Tests if string matches pattern with anything between two fixed strings
     * 
     * **WHEN TO USE:**
     * - Matching "Success: [anything] completed" patterns
     * - Validating dynamic messages
     * - Flexible string assertions
     * 
     * @param firstString - Starting fixed text
     * @param secondString - Ending fixed text
     * @param stringToTest - String to test against pattern
     * 
     * @returns true if string matches pattern ^firstString (.*) secondString$
     * 
     * @example
     * const matcher = new RegExpMatcher();
     * matcher.matchAnythingBetween("Hello", "World", "Hello Beautiful World");
     * // true - "Beautiful" matches (.*)
     * 
     * @example
     * matcher.matchAnythingBetween("Error:", "occurred", "Error: Network timeout occurred");
     * // true - "Network timeout" matches (.*)
     */
    matchAnythingBetween(firstString: string, secondString: string, stringToTest: string): boolean{
        const rs = `^${firstString} (.*) ${secondString}$`;
        const re = new RegExp(rs);
        return re.test(stringToTest);
    }
}