/**
 * @file Main Playwright Wrapper Facade - Central Entry Point for All Browser Automation
 * 
 * WHAT this file provides:
 * This is the main facade class that serves as the single entry point for all Playwright automation
 * operations. It aggregates and exposes all specialized wrapper classes (Common, PageElement, DataReader,
 * DataWriter, ElementAction, Keyboard) and provides high-level navigation methods. This facade pattern
 * simplifies the wrapper API by presenting a unified interface.
 * 
 * WHY this facade exists:
 * - Provides single instantiation point for all wrappers (one object, all functionality)
 * - Simplifies Page Object constructors (only need PlaywrightWrapper instance)
 * - Ensures consistent wrapper initialization order and dependency injection
 * - Centralizes navigation and page load operations
 * - Reduces coupling between Page Objects and individual wrapper classes
 * - Makes wrapper API discoverable through single object property access
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Wrapper Facade Layer (highest level wrapper)
 * - Used by: All Page Objects (via BasePage)
 * - Dependencies: All 6 specialized wrapper classes
 * - Position: Single entry point from Page Objects to Playwright API
 * 
 * WHEN tests should use this wrapper:
 * - Every Page Object receives this wrapper via constructor
 * - Use wrapper.pageElement for element interactions (click, fill, select)
 * - Use wrapper.dataReader for reading text, attributes, visibility checks
 * - Use wrapper.dataWriter for filling forms, uploads, multi-field operations
 * - Use wrapper.elementAction for drag-drop, hover, screenshots
 * - Use wrapper.keyBoard for Tab navigation, keyboard shortcuts
 * - Use wrapper.common for waits, delays, viewport, dialogs
 * - Use wrapper navigation methods for goto(), refresh(), URL changes
 * 
 * Architecture Pattern (Facade + Composition):
 * ```
 * PlaywrightWrapper (Facade)
 *   ├── common (PlaywrightWrapperCommon) - base utilities
 *   ├── pageElement (PlaywrightWrapperPageElement) - element location & interactions
 *   ├── dataReader (PlaywrightWrapperDataReader) - read data from page
 *   ├── dataWriter (PlaywrightWrapperDataWriter) - write data to page
 *   ├── elementAction (PlaywrightWrapperElementAction) - advanced interactions
 *   └── keyBoard (PlaywrightWrapperKeyboard) - keyboard simulation
 * ```
 * 
 * Important initialization order:
 * 1. common (base, no dependencies)
 * 2. pageElement (depends on common)
 * 3. dataReader, dataWriter, keyBoard (depend on common + pageElement)
 * 4. elementAction (depends on common + pageElement)
 */

import { Page } from "@playwright/test";
import KeyBoardItems from "./keyBoardItems";
import BrowserEvents from "./browserEvents";
import PlaywrightWrapperDataReader from "./pwWrapperDataReader";
import PlaywrightWrapperElementAction from "./pwWrapperElementAction";
import PlaywrightWrapperKeyboard from "./pwWrapperKeyboard";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import PlaywrightWrapperDataWriter from "./pwWrapperDataWriter";

/**
 * PlaywrightWrapper - Main Facade Class for All Browser Automation
 * 
 * RESPONSIBILITY:
 * Serves as the single entry point for all Playwright wrapper functionality. Instantiates and exposes
 * all specialized wrapper classes, and provides high-level navigation methods for page loading and URL changes.
 * 
 * ARCHITECTURE ROLE:
 * - Facade Pattern: Simplifies complex wrapper subsystem into single interface
 * - Composition: Aggregates all 6 specialized wrappers as public properties
 * - Dependency Injection: Receives Playwright Page, injects into all wrappers
 * - Single Responsibility: Only handles wrapper instantiation and navigation
 * 
 * PUBLIC PROPERTIES:
 * - common: Base utilities (waits, delays, viewport, dialogs)
 * - pageElement: Element location and basic interactions
 * - dataReader: Reading data from page elements
 * - dataWriter: Writing data to page elements
 * - elementAction: Advanced interactions (drag-drop, hover, screenshots)
 * - keyBoard: Keyboard simulation and Tab navigation
 * 
 * WHEN TO USE:
 * - Page Objects should receive this wrapper in constructor via BasePage
 * - Tests access wrapper methods through Page Object inheritance
 * - Never instantiate wrappers individually - always use this facade
 */
export default class PlaywrightWrapper {
    /**
     * Common wrapper instance - Base utilities for waits, delays, viewport management
     */
    common: PlaywrightWrapperCommon;
    
    /**
     * Data reader wrapper instance - Methods for reading text, attributes, visibility state
     */
    dataReader: PlaywrightWrapperDataReader;
    
    /**
     * Data writer wrapper instance - Methods for filling forms, file uploads, multi-field operations
     */
    dataWriter: PlaywrightWrapperDataWriter;
    
    /**
     * Element action wrapper instance - Advanced interactions like drag-drop, hover, screenshots
     */
    elementAction: PlaywrightWrapperElementAction;
    
    /**
     * Keyboard wrapper instance - Keyboard simulation and Tab navigation
     */
    keyBoard: PlaywrightWrapperKeyboard;
    
    /**
     * Page element wrapper instance - Element location and basic interactions (click, fill, select)
     */
    pageElement: PlaywrightWrapperPageElement;

    /**
     * Constructor - Initializes all wrapper instances with proper dependency injection
     * 
     * WHAT: Creates facade instance and initializes all 6 specialized wrappers in correct order.
     * WHEN: Called by BasePage constructor, which receives Page object from Playwright fixture.
     * HOW: Instantiates wrappers with dependency injection (common first, then dependent wrappers).
     * 
     * @param page - Playwright Page object from test context
     *   Parameter Type: Page (from @playwright/test)
     *   
     *   Source: Provided by Playwright test fixture in hooks/fixture.ts
     *   Usage: Injected into all wrapper instances for browser automation
     *   
     *   Initialization Order:
     *     1. common (no dependencies)
     *     2. pageElement (needs common)
     *     3. dataReader, dataWriter, keyBoard (need common + pageElement)
     *     4. elementAction (needs common + pageElement)
     * 
     * @example
     * // In BasePage constructor
     * export class BasePage {
     *   protected wrapper: PlaywrightWrapper;
     *   
     *   constructor(page: Page) {
     *     this.wrapper = new PlaywrightWrapper(page);
     *   }
     * }
     * 
     * @example
     * // In Page Object - accessing wrapper properties
     * class LoginPage extends BasePage {
     *   async clickLoginButton() {
     *     await this.wrapper.pageElement.clickElement(this.loginButtonLocator);
     *   }
     * }
     */
    constructor(private page: Page) { 
        this.common = new PlaywrightWrapperCommon(this.page);

        this.pageElement = new PlaywrightWrapperPageElement(this.page, this.common);
        this.dataReader = new PlaywrightWrapperDataReader(this.page, this.common, this.pageElement);
        this.dataWriter = new PlaywrightWrapperDataWriter(this.page, this.common, this.pageElement);
        this.keyBoard = new PlaywrightWrapperKeyboard(this.page, this.common);
        
        this.elementAction = new PlaywrightWrapperElementAction(this.page, this.common, this.pageElement);
    }

    /**
     * Waits for browser to navigate to expected URL
     * 
     * WHAT: Waits until the browser URL matches the provided URL pattern.
     * WHEN: Use after actions that trigger navigation (button clicks, form submissions, redirects).
     * HOW: Uses Playwright's waitForURL() with timeout, supports URL patterns and regex.
     * 
     * @param navigationUrl - Expected URL or URL pattern to wait for
     *   Parameter Type: string | RegExp (required)
     *   
     *   URL Format Options:
     *     - Exact URL: 'https://example.com/dashboard'
     *     - Glob pattern: 'https://example.com/user/*'
     *     - RegExp: /\/dashboard\/\d+/
     *   
     *   Common Patterns:
     *     - Wait for specific page: 'https://app.com/home'
     *     - Wait for any user profile: 'https://app.com/profile/*'
     *     - Wait for dashboard section: '**\'/dashboard/**'
     * 
     * @param timeout - Maximum wait time in milliseconds
     *   Parameter Type: number (default: 90000)
     *   Default: 90000ms (90 seconds)
     *   
     *   When to adjust timeout:
     *     - Slow redirects: Increase to 120000ms
     *     - Fast SPAs: Decrease to 30000ms
     *     - Known slow backend: Increase to 180000ms
     * 
     * Return Type: Promise<void>
     * 
     * Error Handling:
     *   - Throws TimeoutError if URL doesn't match within timeout
     *   - Error message includes expected vs actual URL
     * 
     * Use Cases:
     *   - After login submission:
     *     ```
     *     await this.wrapper.pageElement.clickElement(loginButton);
     *     await this.wrapper.waitForNavigation('**\'/dashboard');
     *     ```
     *   - After logout:
     *     ```
     *     await logoutLink.click();
     *     await this.wrapper.waitForNavigation('https://example.com/login');
     *     ```
     * 
     * @returns Promise<void> - Resolves when URL matches, rejects on timeout
     * 
     * @example
     * // Wait for exact URL after login
     * await wrapper.waitForNavigation('https://app.com/dashboard');
     * 
     * @example
     * // Wait for any profile page
     * await wrapper.waitForNavigation('https://app.com/profile/*');
     * 
     * @example
     * // Wait with custom timeout for slow redirect
     * await wrapper.waitForNavigation('**'/success', 120000);
     */
    async waitForNavigation(navigationUrl: string, timeout:number = 90000){
        await this.page.waitForURL(navigationUrl, {timeout: timeout});
    }
    /**
     * Waits for page to reach stable state after navigation or dynamic updates
     * 
     * WHAT: Waits for DOM to be fully parsed and ready for interactions (DOMContentLoaded event).
     * WHEN: Use after navigation, page updates, or before interacting with dynamically loaded elements.
     * HOW: Waits for 'domcontentloaded' event, indicating DOM ready but images/stylesheets may still load.
     * 
     * @param timeout - Maximum wait time in milliseconds
     *   Parameter Type: number (default: 90000)
     *   Default: 90000ms (90 seconds)
     *   
     *   Load State Behavior:
     *     - PAGE_LOADED_QUICK ('domcontentloaded'): DOM parsed, scripts executed
     *     - Does NOT wait for: Images, stylesheets, fonts to finish loading
     *     - Good for: Form interactions, button clicks, text reading
     *   
     *   When to use:
     *     - After page navigation before interacting with elements
     *     - After AJAX updates that modify DOM
     *     - Before reading text from dynamically loaded content
     *   
     *   Alternative: Use gotoFullPageLoading() if you need ALL resources loaded
     * 
     * Return Type: Promise<void>
     * 
     * Performance Note:
     *   Faster than waiting for 'load' event (used by gotoFullPageLoading)
     *   Suitable for most test scenarios where visual completeness not critical
     * 
     * Use Cases:
     *   - After SPA route change:
     *     ```
     *     await this.wrapper.pageElement.clickElement(navLink);
     *     await this.wrapper.waitForPageStability();
     *     ```
     *   - After form submission with page update:
     *     ```
     *     await submitButton.click();
     *     await this.wrapper.waitForPageStability();
     *     ```
     * 
     * @returns Promise<void> - Resolves when DOM ready, rejects on timeout
     * 
     * @example
     * // Wait for page stability after clicking navigation link
     * await wrapper.pageElement.clickElement(dashboardLink);
     * await wrapper.waitForPageStability();
     * 
     * @example
     * // Custom timeout for slow-loading SPA
     * await wrapper.waitForPageStability(120000);
     */
    async waitForPageStability(timeout:number = 90000){
        //await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState(BrowserEvents.PAGE_LOADED_QUICK, {timeout: timeout});
    }
    
    /**
     * Navigates to URL and waits for DOM to be ready (fast loading)
     * 
     * WHAT: Navigates to URL and waits for DOM to be parsed (DOMContentLoaded), but NOT for all resources.
     * WHEN: Use for standard page navigation where you don't need images/fonts fully loaded.
     * HOW: Uses page.goto() with 'domcontentloaded' wait strategy for faster page loads.
     * 
     * @param url - Target URL to navigate to
     *   Parameter Type: string (required)
     *   
     *   URL Format:
     *     - Absolute URLs: 'https://example.com/page'
     *     - Relative URLs: '/dashboard' (relative to current domain)
     *     - Must include protocol for absolute URLs (http:// or https://)
     *   
     *   Navigation Behavior:
     *     - Navigates to URL
     *     - Waits for DOMContentLoaded event (DOM ready)
     *     - Does NOT wait for images, stylesheets, fonts to load
     *     - Returns when page interactive and ready for element interactions
     * 
     * @param timeout - Maximum navigation wait time in milliseconds
     *   Parameter Type: number (default: 90000)
     *   Default: 90000ms (90 seconds)
     *   
     *   When to adjust:
     *     - Fast networks: Decrease to 30000ms
     *     - Slow servers: Increase to 120000ms
     *     - CI/CD environments: Increase to 180000ms
     * 
     * Return Type: Promise<void>
     * 
     * Loading Strategy Comparison:
     *   - goto(): PAGE_LOADED_QUICK (domcontentloaded) - Fast, good for most cases
     *   - gotoFullPageLoading(): PAGE_LOADED_FULL (load) - Slower, waits for all resources
     * 
     * When to use goto() vs gotoFullPageLoading():
     *   - Use goto() when:
     *     * You need to interact with forms/buttons immediately
     *     * Page content loads dynamically via JavaScript
     *     * You want faster test execution
     *   - Use gotoFullPageLoading() when:
     *     * Taking screenshots (need visual completeness)
     *     * Testing image-heavy pages
     *     * Validating CSS rendering
     * 
     * Error Handling:
     *   - Throws TimeoutError if navigation doesn't complete within timeout
     *   - Throws NavigationError for DNS failures, SSL errors, or HTTP errors
     * 
     * @returns Promise<void> - Resolves when DOM ready, rejects on timeout or navigation error
     * 
     * @example
     * // Standard page navigation
     * await wrapper.goto('https://example.com/login');
     * await wrapper.dataWriter.fillElement(emailField, 'user@example.com');
     * 
     * @example
     * // Navigate with custom timeout for slow server
     * await wrapper.goto('https://slow-server.com', 120000);
     * 
     * @example
     * // In Page Object - navigating to login page
     * class LoginPage extends BasePage {
     *   async navigate() {
     *     await this.wrapper.goto(process.env.BASE_URL + '/login');
     *   }
     * }
     */
    async goto(url: string, timeout: number = 90000) {
        await this.page.goto(url, {
            waitUntil: BrowserEvents.PAGE_LOADED_QUICK,
            timeout: timeout
        });
    }

    /**
     * Navigates to URL and waits for ALL resources to load (complete loading)
     * 
     * WHAT: Navigates to URL and waits for the 'load' event, ensuring all resources (images, CSS, fonts) are fully loaded.
     * WHEN: Use when you need visual completeness - screenshots, visual testing, or verifying rendered appearance.
     * HOW: Uses page.goto() with 'load' wait strategy for complete page rendering.
     * 
     * @param url - Target URL to navigate to
     *   Parameter Type: string (required)
     *   
     *   URL Format: Same as goto() method
     *   
     *   Navigation Behavior:
     *     - Navigates to URL
     *     - Waits for 'load' event (all resources loaded)
     *     - Waits for: Images, CSS, fonts, iframes, scripts
     *     - Returns when page fully rendered and visually complete
     * 
     * @param timeout - Maximum navigation wait time in milliseconds
     *   Parameter Type: number (default: 90000)
     *   Default: 90000ms (90 seconds)
     *   
     *   Consideration:
     *     - Usually needs longer timeout than goto() due to resource loading
     *     - Image-heavy pages may need 120000-180000ms
     * 
     * Return Type: Promise<void>
     * 
     * Performance Impact:
     *   Slower than goto() by 2-10 seconds typically
     *   Trade-off: Visual completeness vs test execution speed
     * 
     * When to use gotoFullPageLoading():
     *   - Taking full-page screenshots
     *   - Visual regression testing
     *   - Verifying CSS styling and layout
     *   - Testing image galleries or media-heavy pages
     *   - When page appearance matters for test assertions
     * 
     * When NOT to use:
     *   - Form filling tests (use goto() instead)
     *   - API testing with UI validation (use goto())
     *   - Most functional tests where visuals don't matter
     * 
     * @returns Promise<void> - Resolves when all resources loaded, rejects on timeout
     * 
     * @example
     * // Navigate with full page loading for screenshot
     * await wrapper.gotoFullPageLoading('https://example.com/gallery');
     * await wrapper.elementAction.takeScreenshot('gallery-page.png');
     * 
     * @example
     * // Visual regression test
     * await wrapper.gotoFullPageLoading('https://example.com/homepage');
     * // Now safe to compare visual appearance
     * 
     * @example
     * // In Page Object - for image-heavy page
     * class GalleryPage extends BasePage {
     *   async navigateAndWaitForImages() {
     *     await this.wrapper.gotoFullPageLoading(this.galleryUrl, 120000);
     *   }
     * }
     */
    async gotoFullPageLoading(url: string, timeout: number = 90000) {
        await this.page.goto(url, {
            waitUntil: BrowserEvents.PAGE_LOADED_FULL,
            timeout: timeout
        });
    }
    /**
     * Refreshes current page and reloads the same content
     * 
     * WHAT: Simulates pressing F5 to refresh the page, then waits for reload to complete.
     * WHEN: Use when testing data refresh, clearing cached state, or verifying page updates.
     * HOW: Presses F5 key, calls page.reload() with timeout, optionally delays after reload.
     * 
     * @param delayOrTimeoutInMillSec - Timeout for page reload to complete
     *   Parameter Type: number (required)
     *   
     *   Purpose:
     *     - Maximum time to wait for page reload to complete
     *     - NOT a delay before refresh (refresh happens immediately)
     *     - Used as timeout parameter for page.reload()
     *   
     *   Typical Values:
     *     - Standard pages: 30000ms (30 seconds)
     *     - Slow loading: 90000ms (90 seconds)
     *     - Fast SPAs: 15000ms (15 seconds)
     * 
     * @param delayAfterRefresh - Additional delay after reload completes
     *   Parameter Type: number (default: 0)
     *   Default: 0ms (no delay)
     *   
     *   Purpose:
     *     - Waits for dynamic content to load after page reload
     *     - Useful for pages with post-load JavaScript execution
     *     - Gives time for AJAX requests or animations after page load
     *   
     *   When to use:
     *     - Page has post-load data fetching: 2000-5000ms
     *     - Dashboard with real-time updates: 3000-10000ms
     *     - Animations or transitions: 1000-2000ms
     * 
     * Return Type: Promise<void>
     * 
     * Refresh Mechanism:
     *   1. Presses F5 key (triggers browser refresh)
     *   2. Calls page.reload() with timeout (waits for reload)
     *   3. Optionally delays after reload (waits for dynamic content)
     * 
     * Use Cases:
     *   - Testing data refresh:
     *     ```
     *     await wrapper.refreshCurrentPage(30000);
     *     await wrapper.dataReader.getElementText(updatedTimestamp);
     *     ```
     *   - Clearing form state:
     *     ```
     *     await wrapper.dataWriter.fillElement(field, 'wrong value');
     *     await wrapper.refreshCurrentPage(30000); // Resets form
     *     ```
     *   - Verifying persistent data:
     *     ```
     *     await wrapper.refreshCurrentPage(30000);
     *     // Check if data still present after refresh
     *     ```
     * 
     * @returns Promise<void> - Resolves when refresh complete and delay elapsed
     * 
     * @example
     * // Simple page refresh with standard timeout
     * await wrapper.refreshCurrentPage(30000);
     * 
     * @example
     * // Refresh with post-load delay for AJAX content
     * await wrapper.refreshCurrentPage(30000, 5000);
     * // Waits 5 seconds after reload for dynamic content
     * 
     * @example
     * // In test - verify data persists after refresh
     * await loginPage.login('user@example.com', 'password');
     * await wrapper.refreshCurrentPage(30000, 2000);
     * await expect(page.locator('#username')).toContainText('user@example.com');
     */
    async refreshCurrentPage(delayOrTimeoutInMillSec: number, delayAfterRefresh: number = 0){
        //await this.keyBoard.pressKeyBoard(null, KeyBoardItems.F5, delayOrTimeoutInMillSec);
        await this.keyBoard.pressKeyBoard(null, KeyBoardItems.F5);
        await this.page.reload({timeout: delayOrTimeoutInMillSec});
        if(delayAfterRefresh > 0)
            await this.common.delay(delayAfterRefresh);
    }
}