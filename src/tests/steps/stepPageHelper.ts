
/**
 * **WHAT:** Helper class providing simplified page object access for step definitions
 * 
 * **WHY:** Reduces boilerplate in test steps by wrapping PageFactory.getPage() calls
 * 
 * **WHERE USED:**
 * - Step definition files needing page objects
 * - Test steps performing UI interactions
 * - BDD Gherkin step implementations
 * 
 * **WHEN TO USE:**
 * - Get LoginPage instance
 * - Get SharedPageBehavior instance
 * - Access page objects in test steps
 * 
 * **HOW IT WORKS:**
 * - Wraps fixture.pageFactory.getPage() with simpler static methods
 * - Returns page object instances from cache or creates new ones
 * - Automatically handles page initialization and stability checks
 * 
 * @example
 * // In step definition - Get LoginPage
 * import StepPageHelper from './stepPageHelper';
 * 
 * Given('I am on the login page', async () => {
 *   const loginPage = await StepPageHelper.getLoginPage();
 *   await loginPage.navigateToAppLandingPage(3, true);
 * });
 * 
 * @example
 * // Get SharedPageBehavior for common operations
 * When('I click the {string} button', async (buttonName: string) => {
 *   const sharedBehavior = await StepPageHelper.getSharedPageBehavior();
 *   await sharedBehavior.clickButtonAndInspectSuccessMessage('Click', buttonName);
 * });
 * 
 * @example
 * // Both helpers together
 * When('I login with valid credentials', async () => {
 *   const loginPage = await StepPageHelper.getLoginPage();
 *   await loginPage.enterUserName('user@example.com');
 *   await loginPage.enterPassword('password123');
 *   await loginPage.clickLoginButton();
 *   
 *   const sharedBehavior = await StepPageHelper.getSharedPageBehavior();
 *   while (await sharedBehavior.isOperationInProgress());
 * });
 */
import { fixture } from "../../hooks/fixture";
import SharedPageBehavior from "../../pages/sharedPageBehavior";

/**
 * **StepPageHelper Class**
 * 
 * **RESPONSIBILITY:** Simplifies page object access for step definitions with static helper methods
 * 
 * **KEY CAPABILITIES:**
 * - Retrieve SharedPageBehavior instance
 * - Retrieve LoginPage instance
 * - Abstract PageFactory complexity
 * - Return cached or new page instances
 * - Future: Add methods for other page objects as needed
 */
export default class StepPageHelper {
    /**
     * **Get Shared Page Behavior**
     * 
     * **WHAT:** Retrieves SharedPageBehavior instance for cross-page operations
     * 
     * **WHY:** Access common page behaviors (spinners, toasts, dropdowns) from test steps
     * 
     * **HOW IT WORKS:**
     * - Calls fixture.pageFactory.getPage() with SharedPageBehavior class
     * - Returns cached instance if exists, otherwise creates new one
     * - SharedPageBehavior provides methods used across all pages
     * 
     * @returns {Promise<SharedPageBehavior>} SharedPageBehavior instance
     * 
     * @example
     * // Wait for spinner in step
     * const sharedBehavior = await StepPageHelper.getSharedPageBehavior();
     * while (await sharedBehavior.isOperationInProgress());
     * 
     * @example
     * // Click button and verify toast
     * const sharedBehavior = await StepPageHelper.getSharedPageBehavior();
     * const message = await sharedBehavior.clickButtonAndInspectSuccessMessage(
     *   'Save Order',
     *   'Save'
     * );
     * expect(message).toContain('Order saved successfully');
     * 
     * @example
     * // Select dropdown option
     * const sharedBehavior = await StepPageHelper.getSharedPageBehavior();
     * await sharedBehavior.selectAngularDropdownOptionByPlaceholder(
     *   'Select User',
     *   'John Doe'
     * );
     */
    static async getSharedPageBehavior()
    {
        return await fixture.pageFactory.getPage(SharedPageBehavior, fixture.page);
    }

    /**
     * **Get Login Page**
     * 
     * **WHAT:** Retrieves LoginPage instance for authentication operations
     * 
     * **WHY:** Access login page methods (navigate, enter credentials, click login) from test steps
     * 
     * **HOW IT WORKS:**
     * - Calls fixture.pageFactory.getPage() with LoginPage class
     * - Returns cached instance if exists, otherwise creates new one
     * - Automatically initializes page and waits for stability
     * 
     * @returns {Promise<LoginPage>} LoginPage instance
     * 
     * @example
     * // Navigate to login page
     * const loginPage = await StepPageHelper.getLoginPage();
     * await loginPage.navigateToAppLandingPage(3, true);
     * 
     * @example
     * // Complete login flow
     * const loginPage = await StepPageHelper.getLoginPage();
     * await loginPage.enterUserName('user@example.com');
     * await loginPage.enterPassword('password123');
     * await loginPage.clickLoginButton();
     * const isSuccess = await loginPage.isLoginSuccessful();
     * expect(isSuccess).toBeTruthy();
     * 
     * @example
     * // Verify page title
     * const loginPage = await StepPageHelper.getLoginPage();
     * const title = await loginPage.getPageCurrentTitle();
     * expect(title).toBe('Truterra Livestock Login');
     */
    // static async getLoginPage(){
    //     return await fixture.pageFactory.getPage(LoginPage, fixture.page);
    // }
}