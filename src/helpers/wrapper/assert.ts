/**
 * @file Test Assertion Wrapper for Playwright
 * 
 * WHAT this file provides:
 * This wrapper provides test assertion methods for validating page title and URL in Playwright tests.
 * It encapsulates Playwright's expect() assertions with simplified methods for common validation scenarios.
 * 
 * WHY this wrapper exists:
 * - Simplifies title and URL assertions with semantic method names
 * - Provides both exact match and partial match (contains) validations
 * - Centralizes assertion logic for consistent error messages
 * - Reduces boilerplate in test code and Page Objects
 * - Makes assertions more readable (assertTitle vs expect().toHaveTitle())
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Assertion Wrapper Layer
 * - Used by: Page Objects, Step Definitions for validation
 * - Dependencies: Playwright expect() and Page object
 * - Position: Provides higher-level assertion API on top of Playwright
 * 
 * WHEN tests should use this wrapper:
 * - When validating page title after navigation
 * - When verifying URL changes after redirects
 * - For post-login/post-action URL validations
 * - When checking if URL contains expected path segments
 * - For title-based page identification
 */

import { expect, Page } from "@playwright/test";

/**
 * Assert class - Test Assertion Wrapper
 * 
 * RESPONSIBILITY:
 * Provides simplified assertion methods for page title and URL validation. Wraps Playwright's
 * expect() API with semantic methods that improve test readability and reduce boilerplate code.
 * 
 * PLAYWRIGHT FEATURES ENCAPSULATED:
 * - expect(page).toHaveTitle() - Exact title match
 * - page.title() + expect().toContain() - Partial title match
 * - expect(page).toHaveURL() - Exact URL match
 * - page.url() + expect().toContain() - Partial URL match
 * 
 * WHEN TO USE:
 * - Use in Page Objects after navigation methods
 * - Use in Step Definitions for Then steps (validation)
 * - Use instead of direct expect() calls for title/URL checks
 */
export default class Assert {

    constructor(private page: Page) { }

    /**
     * Asserts page title exactly matches expected title
     * 
     * WHAT: Validates that the current page title is exactly the provided string.
     * WHEN: Use when you need exact title match (e.g., "Login Page", "Dashboard - MyApp").
     * HOW: Uses Playwright's expect(page).toHaveTitle() for exact string comparison.
     * 
     * @param title - Expected exact page title
     *   Parameter Type: string (required)
     *   
     *   Title Matching:
     *     - Case-sensitive exact match
     *     - No whitespace trimming
     *     - Must match complete title string
     *   
     *   Common Usage:
     *     - After navigation to specific page
     *     - After login to verify dashboard title
     *     - After form submission to verify success page
     * 
     * Return Type: Promise<void>
     * 
     * Error Handling:
     *   - Throws AssertionError if title doesn't match
     *   - Error message shows expected vs actual title
     * 
     * Use Cases:
     *   - After login:
     *     ```
     *     await loginPage.login('user@example.com', 'password');
     *     await assert.assertTitle('Dashboard - MyApp');
     *     ```
     *   - After navigation:
     *     ```
     *     await page.goto('/about');
     *     await assert.assertTitle('About Us - MyApp');
     *     ```
     * 
     * @returns Promise<void> - Resolves if title matches, throws AssertionError if not
     * 
     * @example
     * // Validate login page title
     * await assert.assertTitle('Login - MyApp');
     * 
     * @example
     * // In Page Object - verify page loaded correctly
     * class DashboardPage extends BasePage {
     *   async verifyPageLoaded() {
     *     await this.assert.assertTitle('Dashboard - MyApp');
     *   }
     * }
     */
    async assertTitle(title: string) {
        await expect(this.page).toHaveTitle(title);
    }

    /**
     * Asserts page title contains expected substring
     * 
     * WHAT: Validates that the current page title contains the provided substring.
     * WHEN: Use when you only need to verify part of title (e.g., contains "Dashboard").
     * HOW: Gets page title, then uses expect().toContain() for substring matching.
     * 
     * @param title - Expected substring within page title
     *   Parameter Type: string (required)
     *   
     *   Title Matching:
     *     - Case-sensitive substring match
     *     - Can appear anywhere in title
     *     - More flexible than exact match
     *   
     *   When to use vs assertTitle():
     *     - Use assertTitleContains() when:
     *       * Title has dynamic parts (e.g., "Dashboard - User: John")
     *       * Only specific keyword matters (e.g., "Error")
     *       * Title format may vary across environments
     *     - Use assertTitle() when:
     *       * Need exact title validation
     *       * Title is static and predictable
     * 
     * Return Type: Promise<void>
     * 
     * Use Cases:
     *   - Verify page type without exact title:
     *     ```
     *     await assert.assertTitleContains('Error'); // Any error page
     *     ```
     *   - Check for keyword in dynamic title:
     *     ```
     *     await assert.assertTitleContains('Profile'); // Profile pages
     *     ```
     * 
     * @returns Promise<void> - Resolves if title contains substring, throws AssertionError if not
     * 
     * @example
     * // Validate title contains "Dashboard"
     * await assert.assertTitleContains('Dashboard');
     * 
     * @example
     * // In test - check for error indication
     * await form.submitInvalidData();
     * await assert.assertTitleContains('Error');
     */
    async assertTitleContains(title: string) {
        const pageTitle = await this.page.title();
        expect(pageTitle).toContain(title);
    }

    /**
     * Asserts page URL exactly matches expected URL
     * 
     * WHAT: Validates that the current page URL is exactly the provided URL or pattern.
     * WHEN: Use to verify navigation resulted in expected URL.
     * HOW: Uses Playwright's expect(page).toHaveURL() for URL comparison (supports regex and glob patterns).
     * 
     * @param url - Expected URL, URL pattern, or regex
     *   Parameter Type: string | RegExp (required)
     *   
     *   URL Matching Options:
     *     - Exact URL: 'https://example.com/dashboard'
     *     - Glob pattern: 'https://example.com/user/*'
     *     - RegExp: /\\/profile\\/\\d+/
     *   
     *   Common Patterns:
     *     - Exact page: 'https://app.com/login'
     *     - Any profile: 'https://app.com/profile/*'
     *     - ID-based pages: /\\/order\\/\\d+/
     * 
     * Return Type: Promise<void>
     * 
     * Error Handling:
     *   - Throws AssertionError if URL doesn't match
     *   - Error message shows expected vs actual URL
     * 
     * Use Cases:
     *   - After login redirect:
     *     ```
     *     await loginPage.login('user', 'pass');
     *     await assert.assertURL('https://app.com/dashboard');
     *     ```
     *   - After navigation:
     *     ```
     *     await page.goto('/profile');
     *     await assert.assertURL(process.env.BASE_URL + '/profile');
     *     ```
     * 
     * @returns Promise<void> - Resolves if URL matches, throws AssertionError if not
     * 
     * @example
     * // Validate exact URL after navigation
     * await assert.assertURL('https://example.com/dashboard');
     * 
     * @example
     * // Using glob pattern for dynamic ID
     * await assert.assertURL('https://example.com/order/*');
     * 
     * @example
     * // In Page Object - verify login redirect
     * class LoginPage extends BasePage {
     *   async verifyLoginSuccess() {
     *     await this.assert.assertURL(process.env.BASE_URL + '/dashboard');
     *   }
     * }
     */
    async assertURL(url: string) {
        await expect(this.page).toHaveURL(url);
    }

    /**
     * Asserts page URL contains expected substring
     * 
     * WHAT: Validates that the current page URL contains the provided substring.
     * WHEN: Use when you only need to verify URL contains certain path or parameter.
     * HOW: Gets current URL, then uses expect().toContain() for substring matching.
     * 
     * @param title - Expected substring within page URL
     *   Parameter Type: string (required)
     *   Note: Parameter name 'title' is misleading - actually checks URL substring
     *   
     *   URL Matching:
     *     - Case-sensitive substring match
     *     - Can match path, query params, or hash
     *     - More flexible than exact URL match
     *   
     *   When to use vs assertURL():
     *     - Use assertURLContains() when:
     *       * Only care about specific path segment (e.g., '/dashboard')
     *       * URL has dynamic query parameters
     *       * Base URL varies across environments
     *     - Use assertURL() when:
     *       * Need exact URL validation
     *       * Using glob patterns or regex
     * 
     * Return Type: Promise<void>
     * 
     * Use Cases:
     *   - Verify URL contains path segment:
     *     ```
     *     await assert.assertURLContains('/profile');
     *     ```
     *   - Check for query parameter:
     *     ```
     *     await assert.assertURLContains('?status=success');
     *     ```
     *   - Verify hash fragment:
     *     ```
     *     await assert.assertURLContains('#section-2');
     *     ```
     * 
     * @returns Promise<void> - Resolves if URL contains substring, throws AssertionError if not
     * 
     * @example
     * // Validate URL contains "/dashboard" path
     * await assert.assertURLContains('/dashboard');
     * 
     * @example
     * // Check for success parameter
     * await form.submit();
     * await assert.assertURLContains('status=success');
     * 
     * @example
     * // In test - verify section navigation
     * await page.click('#section-link');
     * await assert.assertURLContains('#section-2');
     */
    async assertURLContains(title: string) {
        const pageURL = this.page.url();
        expect(pageURL).toContain(title);
    }

}