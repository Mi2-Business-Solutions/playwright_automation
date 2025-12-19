/**
 * @file CSS Selector and XPath Constants
 * 
 * WHAT this file provides:
 * Defines reusable CSS pseudo-selectors and XPath attribute references used throughout the framework.
 * Centralizes common CSS patterns that are used for element selection and state checking.
 * 
 * WHY this exists:
 * - Prevents duplication of CSS selector strings across the codebase
 * - Provides semantic names for technical CSS/XPath syntax
 * - Reduces errors from typos in selector strings
 * - Makes code more readable (FOCUS vs '*:focus')
 * - Easy to extend with new common CSS patterns
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer
 * - Used by: Wrapper classes, Page Objects, Element selection methods
 * - Dependencies: None (pure constants)
 * - Referenced in: Keyboard navigation, element state checking, XPath building
 * 
 * WHEN to use:
 * - When detecting currently focused elements
 * - When building XPath expressions that check CSS classes
 * - When implementing keyboard navigation (Tab key focus tracking)
 * - When you need to find the active/focused element on the page
 */

/**
 * CssItems class
 * 
 * RESPONSIBILITY:
 * Provides named constants for commonly used CSS pseudo-selectors and XPath attribute patterns.
 * Acts as a vocabulary for element selection patterns used across the automation framework.
 * 
 * CSS/XPATH PATTERNS ENCAPSULATED:
 * - :focus pseudo-selector for finding focused elements
 * - @class XPath syntax for class attribute matching
 * 
 * WHEN TO USE:
 * - Always use these constants instead of hardcoded strings
 * - Reference in methods that need to detect focused elements
 * - Use in XPath builders that need class attribute matching
 */
export default class CssItems{
    /**
     * CSS pseudo-selector for the currently focused element
     * 
     * WHAT: CSS selector '*:focus' that matches any element with keyboard/mouse focus
     * WHEN: Use when you need to get or verify which element currently has focus
     * 
     * Selector Behavior:
     *   - Matches ANY element type (*) that has :focus state
     *   - Returns the single element that has browser focus
     *   - Returns null if no element is focused
     *   - Updates automatically as focus changes
     * 
     * Focus State Triggers:
     *   - User clicks on an element
     *   - Tab key navigation moves focus
     *   - JavaScript .focus() method called
     *   - Auto-focus attribute on page load
     * 
     * Use Cases:
     *   - Keyboard navigation testing (Tab through form fields)
     *   - Verifying focus moved after Tab key press
     *   - Accessibility testing (focus indicators)
     *   - Getting currently active input field
     *   - Focus trap validation in modals
     * 
     * Common Patterns:
     *   ```typescript
     *   // Get the focused element
     *   const focused = page.locator(CssItems.FOCUS);
     *   
     *   // Verify specific element has focus
     *   const emailInput = page.locator('#email');
     *   await expect(emailInput).toHaveAttribute('class', /focused/);
     *   
     *   // Tab to next field and get new focus
     *   await page.keyboard.press('Tab');
     *   const newFocused = page.locator(CssItems.FOCUS);
     *   ```
     * 
     * Performance:
     *   - Fast lookup (browser native :focus pseudo-selector)
     *   - No DOM traversal needed
     *   - Always returns 0 or 1 element
     * 
     * @example
     * // In keyboard wrapper - detect focused element after Tab
     * async tabOutFromCurrentAndGetFocusedElement() {
     *   await this.page.keyboard.press('Tab');
     *   return this.page.locator(CssItems.FOCUS);
     * }
     * 
     * @example
     * // In Page Object - verify focus on specific element
     * async verifyEmailFieldHasFocus() {
     *   const focusedElement = this.page.locator(CssItems.FOCUS);
     *   const emailId = await focusedElement.getAttribute('id');
     *   expect(emailId).toBe('email');
     * }
     * 
     * @example
     * // In test - accessibility check for focus indicators
     * const focused = page.locator(CssItems.FOCUS);
     * await expect(focused).toHaveCSS('outline', '2px solid blue');
     */
    static readonly FOCUS = '*:focus';
    
    /**
     * XPath attribute reference for CSS class attribute
     * 
     * WHAT: XPath syntax '@class' used in XPath expressions to reference the class attribute
     * WHEN: Use when building XPath selectors that need to match or check CSS class names
     * 
     * XPath Usage:
     *   - Used inside XPath predicates (square brackets)
     *   - Syntax: //element[@class='value'] or //element[contains(@class, 'value')]
     *   - @ symbol means "attribute" in XPath
     *   - Commonly combined with contains() function for partial class matching
     * 
     * Why use this constant:
     *   - Consistent XPath syntax across framework
     *   - Prevents typos (@clas, @Class, etc.)
     *   - Self-documenting code
     *   - Easy to change if XPath syntax needs adjustment
     * 
     * Common XPath Patterns:
     *   ```typescript
     *   // Exact class match
     *   `//button[@class='btn-primary']`
     *   `//button[${CssItems.ATTRIBUTE_CLASS}='btn-primary']`
     *   
     *   // Partial class match (class contains)
     *   `//div[contains(@class, 'alert')]`
     *   `//div[contains(${CssItems.ATTRIBUTE_CLASS}, 'alert')]`
     *   
     *   // Multiple class check
     *   `//span[contains(@class, 'icon') and contains(@class, 'large')]`
     *   ```
     * 
     * Use Cases:
     *   - Building dynamic XPath selectors with class filters
     *   - Finding elements by CSS class when CSS selectors aren't suitable
     *   - Checking if element has specific class in XPath predicates
     *   - Complex XPath expressions requiring class attribute access
     * 
     * Note:
     *   - CSS selectors (.className) are usually preferred over XPath for class matching
     *   - Use XPath class matching when you need complex boolean logic
     *   - Remember: @class gets full class string, use contains() for partial match
     * 
     * @example
     * // In XPath builder - construct path with class check
     * getButtonByClass(className: string) {
     *   return `//button[contains(${CssItems.ATTRIBUTE_CLASS}, '${className}')]`;
     * }
     * 
     * @example
     * // In wrapper - find element with multiple classes
     * const xpath = `//div[contains(${CssItems.ATTRIBUTE_CLASS}, 'alert') ` +
     *              `and contains(${CssItems.ATTRIBUTE_CLASS}, 'error')]`;
     * const errorAlert = page.locator(xpath);
     */
    static readonly ATTRIBUTE_CLASS = '@class';
}