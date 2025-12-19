/**
 * **WHAT:** Browser launch manager that initializes Playwright browser instances with configurable options
 * 
 * **WHY:** Centralizes browser initialization logic with environment-specific settings for different test execution contexts
 * 
 * **WHERE USED:**
 * - Called by test fixtures and hooks during test setup
 * - Used to launch browser before test execution
 * - Supports multiple browsers: Chrome (Chromium), Firefox, WebKit (Safari)
 * 
 * **WHEN TO USE:**
 * - Starting browser instance for test execution
 * - Need to switch browsers based on environment configuration
 * - Configuring headless vs headed mode based on CI/local environment
 * 
 * **HOW IT WORKS:**
 * - Reads browser type from BROWSER environment variable
 * - Determines headless mode based on CI or IS_LOCAL environment flags
 * - Sets default window size for consistent viewport across tests
 * - Launches appropriate Playwright browser instance
 * 
 * @example
 * // In hooks/fixture
 * import { invokeBrowser } from './helpers/browser/browserManager';
 * const browser = await invokeBrowser();
 * 
 * @example
 * // With custom options
 * const options: LaunchOptions = { headless: false, slowMo: 100 };
 * const browser = await invokeBrowser(options);
 */

import { LaunchOptions, chromium, firefox, webkit } from "playwright-core";

/**
 * Default launch options for browser initialization
 * 
 * **headless:** Automatically determined based on environment:
 * - true if CI=true (continuous integration environment)
 * - true if IS_LOCAL≠true (remote/cloud environment)
 * - false if IS_LOCAL=true (local development with visible browser)
 * 
 * **args:** Browser arguments including default window size (1920x1080)
 */
const defaultOptions: LaunchOptions = {
    headless: process.env.CI === 'true' || (process.env.IS_LOCAL !== 'true'),
    args: ['--window-size=1920,1080'],
}

/**
 * **WHAT:** Launches a Playwright browser instance based on environment configuration
 * 
 * **WHEN TO USE:**
 * - Initializing browser for test execution
 * - Need browser type selection via environment variable
 * - Switching between browsers for cross-browser testing
 * 
 * **HOW IT WORKS:**
 * 1. Reads BROWSER environment variable (defaults to "chrome")
 * 2. Uses provided options or default options
 * 3. Launches appropriate browser: chromium, firefox, or webkit
 * 4. Returns browser instance for page creation
 * 
 * **SUPPORTED BROWSERS:**
 * - **chrome** (chromium): Google Chrome/Chromium browser
 * - **firefox**: Mozilla Firefox browser
 * - **webkit**: Safari/WebKit browser
 * 
 * @param [options=null] - Playwright launch options; if null, uses defaultOptions
 * 
 * @returns Browser instance for creating pages and contexts
 * 
 * @throws Error if BROWSER environment variable contains unsupported browser type
 * 
 * @example
 * // In fixture setup (uses environment BROWSER variable)
 * // If BROWSER=chrome or unset
 * const browser = await invokeBrowser();
 * const context = await browser.newContext();
 * const page = await context.newPage();
 * 
 * @example
 * // With custom options (force headed mode for debugging)
 * const customOptions: LaunchOptions = {
 *   headless: false,
 *   slowMo: 500,
 *   devtools: true
 * };
 * const browser = await invokeBrowser(customOptions);
 * 
 * @example
 * // Running tests with different browsers
 * // Command line: BROWSER=firefox npm test
 * // Command line: BROWSER=webkit npm test
 * // Command line: BROWSER=chrome npm test (default)
 */
export const invokeBrowser = (options: LaunchOptions = null) => {
    if(options == null){
        options = defaultOptions;
    }
    //const browserType = process.env.npm_config_BROWSER || "chrome";
    const browserType = process.env.BROWSER || "chrome";
    switch (browserType) {
        case "chrome":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!")
    }

}