/**
 * **WHAT:** Base common wrapper providing utility methods, selector builders, delays, and browser context operations for Playwright automation
 * 
 * **WHY:** Centralizes commonly used helper functions that don't fit into specific wrapper categories (data, element, keyboard, etc.)
 * 
 * **WHERE USED:**
 * - Called by other wrapper classes (PageElement, DataWriter, etc.) for utility functions
 * - Used for delay/wait operations throughout the framework
 * - Provides selector construction methods for consistent element location
 * - Manages browser context creation for advanced scenarios
 * 
 * **WHEN TO USE:**
 * - Need to add delays between actions
 * - Building CSS selectors or XPath from element attributes
 * - Creating new browser contexts with custom options
 * - Working with test IDs, placeholders, or ID-based selectors
 * 
 * **HOW IT WORKS:**
 * - Provides selector string builders for common patterns (test ID, placeholder, ID)
 * - Implements delay function using Promise-based setTimeout
 * - Offers browser context creation for isolated test scenarios
 * - Includes HTTPS ignore options for testing environments
 * 
 * @example
 * // In wrapper classes
 * await this.common.delay(1000); // Wait 1 second
 * const xpath = this.common.getXPathWithId("submit-btn");
 * 
 * @example
 * // Creating new context
 * const options = this.common.getHttpsIgnoredBrowserContextOptions();
 * const newPage = await this.common.getNewPageWithNewContext(options);
 */

import { BrowserContextOptions, Page } from "@playwright/test";
import HtmlElementProperties from "./htmlElementProperties";
import HtmlRoles from "./htmlRoles";

/**
 * **PlaywrightWrapperCommon Class**
 * 
 * **RESPONSIBILITY:** Provides foundational utility methods used across all wrapper classes
 * 
 * **KEY CAPABILITIES:**
 * - Delay/wait operations for timing control
 * - Selector string construction (XPath, CSS selectors)
 * - Test ID-based selector building (exact and partial matching)
 * - Browser context creation with custom options
 * - HTTPS error handling configuration
 */
export default class PlaywrightWrapperCommon {
    constructor(private page: Page) { }
    /**
     * **WHAT:** Pauses test execution for the specified number of milliseconds
     * 
     * **WHEN TO USE:**
     * - Need explicit wait between actions
     * - Waiting for animations or transitions
     * - Giving time for asynchronous operations
     * - Debugging and observation during test development
     * 
     * **HOW IT WORKS:**
     * - Uses Promise with setTimeout to pause execution
     * - Non-blocking delay that works with async/await
     * 
     * **CAUTION:** Prefer explicit waits (waitForSelector, waitForVisible) over arbitrary delays when possible
     * 
     * @param ms - Milliseconds to delay (e.g., 1000 for 1 second)
     * 
     * @returns Promise<void> - Resolves after the delay period
     * 
     * @example
     * // In wrapper method (wait for dropdown animation)
     * await dropdown.click();
     * await this.common.delay(500); // Wait 0.5 seconds for animation
     * await this.page.getByRole('option', {name: optionText}).click();
     * 
     * @example
     * // In Page Object (wait after form submission)
     * await submitButton.click();
     * await this.common.delay(2000); // Wait 2 seconds for processing
     */
    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * **WHAT:** Constructs a CSS attribute selector for elements with a specific placeholder attribute value
     * 
     * **WHEN TO USE:**
     * - Building CSS selectors dynamically
     * - Need attribute-based selector for placeholder
     * - Used internally by other wrapper methods
     * 
     * @param placeholderText - The placeholder attribute value
     * 
     * @returns string - CSS selector string (e.g., `[placeholder="Enter email"]`)
     * 
     * @example
     * // Used internally
     * const selector = this.common.getSelectorWithPlaceholderText("Search...");
     * // Returns: '[placeholder="Search..."]'
     */
    getSelectorWithPlaceholderText(placeholderText: string): string{
        return `[${HtmlElementProperties.PLACEHOLDER}="${placeholderText}"]`;
    }

    /**
     * **WHAT:** Constructs a CSS attribute selector for elements with a specific data-testid attribute value
     * 
     * **WHEN TO USE:**
     * - Building test ID-based selectors dynamically
     * - Need exact match for data-testid attribute
     * - Used internally by wrapper methods
     * 
     * @param testIdValue - The data-testid attribute value
     * 
     * @returns string - CSS selector string (e.g., `[data-testid="submit-btn"]`)
     * 
     * @example
     * // Used internally
     * const selector = this.common.getSelectorWithTestId("login-button");
     * // Returns: '[data-testid="login-button"]'
     */
    getSelectorWithTestId(testIdValue: string): string{
        return `[${HtmlElementProperties.TEST_ID}="${testIdValue}"]`;
    }

    /**
     * **WHAT:** Constructs an XPath expression to find elements with data-testid containing the specified value (partial match)
     * 
     * **WHEN TO USE:**
     * - Test IDs follow naming patterns (e.g., "user-row-1", "user-row-2")
     * - Need to find elements with similar test IDs
     * - Partial matching is acceptable (not exact match required)
     * 
     * **HOW IT WORKS:**
     * - Uses XPath `contains()` function for substring matching
     * - Finds any element where data-testid contains the provided value
     * 
     * @param testIdValue - Partial test ID value to search for
     * 
     * @returns string - XPath expression (e.g., `//*[contains(@data-testid, "user-row")]`)
     * 
     * @example
     * // Find all elements with test IDs containing "product"
     * const xpath = this.common.getSelectorWithSimilarTestId("product");
     * // Returns: '//*[contains(@data-testid, "product")]'
     * // Matches: data-testid="product-1", "product-card", "my-product"
     */
    getSelectorWithSimilarTestId(testIdValue: string): string{
        return `//*[contains(@${HtmlElementProperties.TEST_ID}, "${testIdValue}")]`;
    }

    /**
     * **WHAT:** Constructs a CSS attribute selector for elements with a specific id attribute value
     * 
     * **WHEN TO USE:**
     * - Building selectors dynamically based on element ID
     * - Used internally by getElementById wrapper method
     * - Standard element identification pattern
     * 
     * @param id - The id attribute value
     * 
     * @returns string - CSS selector string (e.g., `[id='submit-button']`)
     * 
     * @example
     * // Used in PageElement wrapper
     * const selector = this.common.getXPathWithId("username");
     * // Returns: '[id='username']'
     * // Can be used with: this.page.locator(selector)
     */
    getXPathWithId(id: string) {
        return `[${HtmlElementProperties.ID}='${id}']`;
    }

    /**
     * **WHAT:** Constructs a selector for input elements with a specific name attribute value
     * 
     * **WHEN TO USE:**
     * - Finding form input elements by name attribute
     * - Working with standard HTML forms
     * - Legacy selector patterns
     * 
     * @param inputId - The name attribute value (note: parameter name is misleading, it uses 'name' not 'id')
     * 
     * @returns string - Element selector string (e.g., `input[name="email"]`)
     * 
     * @example
     * // Find input with name="username"
     * const selector = this.common.getInputXPathWithId("username");
     * // Returns: 'input[name="username"]'
     */
    getInputXPathWithId(inputId: string) {
        return `${HtmlRoles.INPUT}[name="${inputId}"]`
    }

    /**
     * **WHAT:** Creates a new browser page within a new browser context using specified context options
     * 
     * **WHEN TO USE:**
     * - Need isolated test environment (separate cookies, storage, etc.)
     * - Testing multi-user scenarios
     * - Requiring specific browser context settings (geolocation, permissions, viewport)
     * - Parallel test execution with separate sessions
     * 
     * **HOW IT WORKS:**
     * 1. Gets the browser instance from current page's context
     * 2. Creates new browser context with provided options
     * 3. Opens new page in that context
     * 4. Returns the new page for interaction
     * 
     * @param contextOptions - Browser context configuration (viewport, permissions, geolocation, etc.)
     * 
     * @returns Promise<Page> - New Playwright page in isolated context
     * 
     * @example
     * // Create page with HTTPS errors ignored
     * const options = this.common.getHttpsIgnoredBrowserContextOptions();
     * const newPage = await this.common.getNewPageWithNewContext(options);
     * await newPage.goto("https://test-environment.com");
     * 
     * @example
     * // Create page with custom viewport
     * const options: BrowserContextOptions = { viewport: { width: 1280, height: 720 } };
     * const mobilePage = await this.common.getNewPageWithNewContext(options);
     */
    async getNewPageWithNewContext(contextOptions: BrowserContextOptions): Promise<Page> {
        const newCtx = await this.page.context().browser()?.newContext(contextOptions);
        return await newCtx?.newPage();
    }

    /**
     * **WHAT:** Returns browser context options configured to ignore HTTPS certificate errors
     * 
     * **WHEN TO USE:**
     * - Testing against environments with self-signed certificates
     * - Working with local development servers
     * - Internal test environments without valid SSL certificates
     * 
     * **SECURITY NOTE:** Only use in test environments, never in production
     * 
     * @returns BrowserContextOptions - Configuration object with ignoreHTTPSErrors set to true
     * 
     * @example
     * // Create context that ignores certificate errors
     * const options = this.common.getHttpsIgnoredBrowserContextOptions();
     * const page = await this.common.getNewPageWithNewContext(options);
     * await page.goto("https://localhost:8443"); // Works despite self-signed cert
     */
    getHttpsIgnoredBrowserContextOptions(): BrowserContextOptions {
        const contextOptions: BrowserContextOptions = {
            ignoreHTTPSErrors: true,
        };
        return contextOptions;
    }
}