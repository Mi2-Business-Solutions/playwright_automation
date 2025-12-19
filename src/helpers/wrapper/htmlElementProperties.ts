/**
 * @file HTML Element Property and State Constants
 * 
 * WHAT this file provides:
 * Defines constants for HTML element attributes and Playwright element states.
 * These constants represent common element properties used for identification and state checking.
 * 
 * WHY this exists:
 * - Centralizes HTML attribute names used across the framework
 * - Provides semantic names for Playwright element states
 * - Prevents typos in attribute and state strings
 * - Makes code more readable and maintainable
 * - Easy reference for supported element properties
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer
 * - Used by: All wrapper classes, Page Objects, Element selection methods
 * - Dependencies: None (pure constants)
 * - Referenced in: Element waiting, attribute reading, test ID lookups
 * 
 * WHEN to use:
 * - When building element locators by ID or test ID
 * - When waiting for element state changes (visible, hidden, etc.)
 * - When reading element attributes
 * - When constructing XPath expressions with attribute filters
 */

/**
 * HtmlElementProperties class
 * 
 * RESPONSIBILITY:
 * Provides named constants for HTML element attributes (id, data-testid, placeholder)
 * and Playwright element states (visible). Acts as vocabulary for element property access.
 * 
 * HTML ATTRIBUTES ENCAPSULATED:
 * - id: Standard HTML element identifier
 * - data-testid: Test automation identifier attribute
 * - placeholder: Input field placeholder text
 * 
 * PLAYWRIGHT STATES ENCAPSULATED:
 * - visible: Element visibility state for waitFor() method
 * 
 * WHEN TO USE:
 * - Always use these constants instead of string literals
 * - Reference in methods that build selectors or check element states
 * - Use when reading attributes or waiting for element conditions
 */
export default class HtmlElementProperties{
    /**
     * HTML 'id' attribute constant
     * 
     * WHAT: Standard HTML element ID attribute name
     * WHEN: Use when building selectors, reading IDs, or constructing XPath with ID filters
     * 
     * HTML ID Attribute:
     *   - Unique identifier for an element within the page
     *   - Format: <element id="uniqueId">...</element>
     *   - Should be unique per page (though HTML allows duplicates)
     *   - Case-sensitive in HTML
     * 
     * Use Cases:
     *   - Building XPath: `//*[@id='${elementId}']`
     *   - CSS selectors: `#${elementId}`
     *   - Reading element's ID: `element.getAttribute('id')`
     *   - Verifying element identity
     * 
     * @example
     * // In XPath builder
     * getXPathWithId(id: string) {
     *   return `//*[@${HtmlElementProperties.ID}='${id}']`;
     * }
     * 
     * @example
     * // Reading element ID
     * const elementId = await element.getAttribute(HtmlElementProperties.ID);
     */
    static readonly ID = 'id';
    
    /**
     * Playwright 'visible' element state constant
     * 
     * WHAT: Playwright element state representing visibility
     * WHEN: Use with waitFor() to wait for elements to become visible
     * 
     * Visibility Rules:
     *   - Element must have non-zero bounding box
     *   - Element must not have 'display: none'
     *   - Element must not have 'visibility: hidden'
     *   - Element must not have 'opacity: 0'
     *   - Parent elements must also be visible
     * 
     * Use Cases:
     *   - Waiting for element to appear before interaction
     *   - Ensuring element is ready for click/fill operations
     *   - Validating element visibility in assertions
     * 
     * @example
     * // In wrapper - wait for element visibility
     * async waitUtilElementIsVisible(element: Locator) {
     *   await element.waitFor({
     *     state: HtmlElementProperties.STATE_VISIBLE,
     *     timeout: 30000
     *   });
     * }
     * 
     * @example
     * // In Page Object - ensure button visible before click
     * async clickSubmit() {
     *   const btn = this.page.locator('#submit');
     *   await btn.waitFor({ state: HtmlElementProperties.STATE_VISIBLE });
     *   await btn.click();
     * }
     */
    static readonly STATE_VISIBLE = 'visible';
    
    /**
     * HTML 'data-testid' attribute constant
     * 
     * WHAT: Test automation-specific attribute name for element identification
     * WHEN: Use when selecting elements by test ID or building test ID selectors
     * 
     * data-testid Attribute:
     *   - Custom HTML5 data attribute for test automation
     *   - Format: <element data-testid="unique-test-id">...</element>
     *   - Best practice for stable test selectors
     *   - Not affected by UI changes (text, styling, structure)
     * 
     * Why use data-testid:
     *   - More stable than text or CSS class selectors
     *   - Explicitly marks elements for testing
     *   - Survives UI refactoring and redesigns
     *   - Recommended by testing best practices
     * 
     * Use Cases:
     *   - Building CSS selectors: `[data-testid='${testId}']`
     *   - Playwright getByTestId(): `page.getByTestId(testId)`
     *   - XPath: `//*[@data-testid='${testId}']`
     *   - Reading test ID: `element.getAttribute('data-testid')`
     * 
     * @example
     * // In wrapper - build test ID selector
     * getSelectorWithTestId(testId: string) {
     *   return `[${HtmlElementProperties.TEST_ID}='${testId}']`;
     * }
     * 
     * @example
     * // In Page Object - find by test ID
     * async getSubmitButton() {
     *   return this.page.getByTestId('submit-button');
     * }
     * 
     * @example
     * // Building XPath with test ID
     * const xpath = `//*[@${HtmlElementProperties.TEST_ID}='login-form']`;
     */
    static readonly TEST_ID = 'data-testid';
    
    /**
     * HTML 'placeholder' attribute constant
     * 
     * WHAT: Input field placeholder text attribute name
     * WHEN: Use when selecting inputs by placeholder or reading placeholder text
     * 
     * Placeholder Attribute:
     *   - Provides hint text inside input fields
     *   - Format: <input placeholder="Enter your email">
     *   - Visible when input is empty
     *   - Disappears when user types
     * 
     * Use Cases:
     *   - Finding inputs by placeholder: `page.getByPlaceholder('Email')`
     *   - Reading placeholder: `element.getAttribute('placeholder')`
     *   - Building selectors: `input[placeholder='Search']`
     *   - Validating accessibility (placeholder as label)
     * 
     * @example
     * // In wrapper - find input by placeholder
     * async getElementByPlaceholder(text: string) {
     *   return this.page.getByPlaceholder(text);
     * }
     * 
     * @example
     * // In Page Object - verify placeholder text
     * async verifyEmailPlaceholder() {
     *   const input = this.page.locator('#email');
     *   const placeholder = await input.getAttribute(HtmlElementProperties.PLACEHOLDER);
     *   expect(placeholder).toBe('Enter your email address');
     * }
     */
    static readonly PLACEHOLDER = 'placeholder';
}