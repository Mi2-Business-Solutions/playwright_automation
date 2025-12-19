/**
 * **WHAT:** Common step definitions and helper functions used across multiple feature files
 * 
 * **WHY:** DRY principle - shared steps like navigation reduce duplication
 * 
 * **WHERE USED:**
 * - Feature files requiring application navigation
 * - Login feature imports navigateToAppLandingPage()
 * - Other features needing initial app navigation
 * 
 * **WHEN TO USE:**
 * - Need to navigate to application landing page
 * - Verify page title with retry logic
 * - Common Given steps across features
 * 
 * **KEY STEPS:**
 * - 'User navigates to the application': Loads app and verifies login page title
 * 
 * **EXPORTED FUNCTIONS:**
 * - navigateToAppLandingPage(): Navigates with retry logic and title verification
 * 
 * @example
 * // In feature file
 * Given('User navigates to the application')
 * // Loads app, retries if needed, verifies title
 * 
 * @example
 * // Reusing navigation function
 * import { navigateToAppLandingPage } from './commonFeatureSteps';
 * const success = await navigateToAppLandingPage('Expected Title', true, 3);
 * expect(success).toBeTruthy();
 */
import { Given, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../hooks/fixture";
import StepPageHelper from "./stepPageHelper";

setDefaultTimeout(60 * 1000 * 5);

// Given('User navigates to the application', async function () {
//     const loginPage = await StepPageHelper.getLoginPage();
//     const expectedTitle = await loginPage.getLoginPageTitle();
//     fixture.logger.info(`expected title is: ${expectedTitle}`)
//     const result = await navigateToAppLandingPage(expectedTitle, true);
//     fixture.logger.info(`Navigated to landing page: ${result}`)
//     expect(result).toBeTruthy();
// });

/**
 * **Navigate To App Landing Page**
 * 
 * **WHAT:** Navigates to application landing page with retry logic and title verification
 * 
 * **WHY:** Handles flaky page loads by retrying until expected title appears
 * 
 * **HOW IT WORKS:**
 * 1. Get LoginPage instance
 * 2. Call navigateToAppLandingPage() with retry count
 * 3. Retry loop: check page title against expected
 * 4. Return true if title matches, false if max retries exceeded
 * 
 * @param {string} expectedTitle - Expected page title after navigation
 * @param {boolean} isNavigationForFreshLogin - Whether this is initial login navigation
 * @param {number} maxRetryCount - Max retry attempts (default from LOGIN_PAGE_CHECK_RETRY_COUNT env)
 * @returns {Promise<boolean>} true if title matches expected, false otherwise
 * 
 * @example
 * // In step definition
 * const success = await navigateToAppLandingPage('Truterra Livestock Login', true, 3);
 * expect(success).toBeTruthy();
 * 
 * @example
 * // With default retry count from environment
 * const success = await navigateToAppLandingPage('Expected Title', false);
 * // Uses process.env.LOGIN_PAGE_CHECK_RETRY_COUNT
 */
