/**
 * @file Browser Page Load Event Constants
 * 
 * WHAT this file provides:
 * Defines constants for different browser page load states used in Playwright's waitForLoadState() method.
 * These constants abstract Playwright's load event names into readable, descriptive property names.
 * 
 * WHY this exists:
 * - Provides semantic naming for cryptic Playwright event strings ('domcontentloaded' vs 'load')
 * - Centralizes load state definitions for consistency across the framework
 * - Prevents typos in event name strings throughout the codebase
 * - Makes code more readable and self-documenting
 * - Easy to maintain if Playwright API changes
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer
 * - Used by: PlaywrightWrapper, Page Objects, Navigation methods
 * - Dependencies: None (pure constants)
 * - Referenced in: goto(), waitForPageStability(), and navigation helper methods
 * 
 * WHEN to use:
 * - When calling page.goto() with waitUntil option
 * - When using page.waitForLoadState() for page ready checks
 * - In Page Object waitForPageReady() implementations
 * - When you need to specify how "loaded" a page should be before proceeding
 * 
 * Important notes:
 * - These map directly to Playwright's LoadState type
 * - PAGE_LOADED_QUICK is faster but less complete
 * - PAGE_LOADED_FULL ensures all resources are loaded
 */

/**
 * BrowserEvents class
 * 
 * RESPONSIBILITY:
 * Provides named constants for browser page load events to be used with Playwright's
 * waitForLoadState() and goto() methods. Acts as a vocabulary layer between the framework
 * and Playwright's technical event names.
 * 
 * PLAYWRIGHT EVENTS ENCAPSULATED:
 * - 'domcontentloaded': Fired when HTML is parsed and DOM is ready (scripts may still be loading)
 * - 'load': Fired when page and all resources (images, stylesheets, scripts) are fully loaded
 * 
 * WHEN TO USE:
 * - Always use these constants instead of string literals like 'domcontentloaded' or 'load'
 * - Reference in navigation methods that need to wait for page readiness
 * - Use in Page Object methods that require specific load states
 */
export default class BrowserEvents{
    /**
     * Quick page load state - DOM content loaded event
     * 
     * WHAT: Represents the 'domcontentloaded' browser event
     * WHEN: Use when you need the DOM ready but don't need all resources loaded
     * 
     * Timing:
     *   - Fires after HTML is fully parsed
     *   - DOM tree is complete and ready for manipulation
     *   - Scripts, stylesheets, images may still be loading
     *   - Typically 1-3 seconds after navigation starts
     * 
     * Use Cases:
     *   - Fast page interactions where visuals don't matter
     *   - Form filling where elements are in DOM but may not be styled
     *   - SPA navigation where content loads dynamically after initial DOM
     *   - Quick smoke tests checking page structure
     * 
     * Performance:
     *   - Fastest load state check (resolves earlier than FULL)
     *   - Good for test speed optimization
     *   - May cause issues if interacting with elements dependent on CSS/images
     * 
     * @example
     * // In PlaywrightWrapper
     * async goto(url: string) {
     *   await this.page.goto(url, {
     *     waitUntil: BrowserEvents.PAGE_LOADED_QUICK
     *   });
     * }
     * 
     * @example
     * // In Page Object
     * async waitForPageReady() {
     *   await this.page.waitForLoadState(BrowserEvents.PAGE_LOADED_QUICK);
     * }
     */
    static readonly PAGE_LOADED_QUICK = 'domcontentloaded';
    
    /**
     * Full page load state - all resources loaded event
     * 
     * WHAT: Represents the 'load' browser event (window.onload)
     * WHEN: Use when you need all resources (images, CSS, scripts) fully loaded
     * 
     * Timing:
     *   - Fires after ALL page resources are downloaded
     *   - Images, stylesheets, scripts, fonts all loaded
     *   - DOM is ready AND fully styled
     *   - Typically 5-15 seconds after navigation (depends on page size)
     * 
     * Use Cases:
     *   - Visual testing or screenshot comparisons
     *   - Testing pages with critical images or styling
     *   - Ensuring stable page state before complex interactions
     *   - When you need guarantee of complete page load
     * 
     * Performance:
     *   - Slowest load state check (waits longest)
     *   - Most reliable for ensuring complete page readiness
     *   - May be overkill for simple form filling tests
     * 
     * Trade-offs:
     *   - Slower tests but fewer flaky failures
     *   - Better for production-like scenarios
     *   - Recommended for critical path tests
     * 
     * @example
     * // In PlaywrightWrapper for complete page load
     * async gotoFullPageLoading(url: string) {
     *   await this.page.goto(url, {
     *     waitUntil: BrowserEvents.PAGE_LOADED_FULL
     *   });
     * }
     * 
     * @example
     * // In Page Object for screenshot testing
     * async waitForCompleteLoad() {
     *   await this.page.waitForLoadState(BrowserEvents.PAGE_LOADED_FULL);
     *   // Now safe to take screenshots
     * }
     */
    static readonly PAGE_LOADED_FULL = 'load';
}