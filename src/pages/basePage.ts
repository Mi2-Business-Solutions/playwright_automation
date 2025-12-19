/**
 * **WHAT:** Abstract base class for all page objects providing common page functionality
 * 
 * **WHY:** DRY principle - shared page methods, PlaywrightWrapper access, and lifecycle management
 * 
 * **WHERE USED:**
 * - Extended by all page objects (LoginPage, OrderPage, etc.)
 * - PageFactory creates instances of BasePage subclasses
 * - Test step definitions interact via concrete page objects
 * 
 * **WHEN TO USE:**
 * - Creating new page object (extend BasePage)
 * - Need common page functionality (waiting, navigation, URL retrieval)
 * - Accessing PlaywrightWrapper methods
 * 
 * **HOW IT WORKS:**
 * - Concrete pages extend BasePage
 * - Override abstract methods: isPageStable(), canNavigateWithUrl()
 * - Access pwWrapper for element interactions
 * - Use sharedBehavior for cross-page operations
 * 
 * **ABSTRACT METHODS:**
 * - isPageStable(): Check if page loading complete
 * - canNavigateWithUrl(): Determine if page can be cached
 * 
 * @example
 * // Creating page object
 * export default class LoginPage extends BasePage {
 *   Elements = { loginBtn: 'Sign In' };
 *   
 *   async isPageStable(): Promise<boolean> {
 *     return await this.pwWrapper.pageElement.isButtonDisplayed(this.Elements.loginBtn);
 *   }
 * }
 * 
 * @example
 * // Using in test
 * const loginPage = await pageFactory.getPage(LoginPage, page);
 * await loginPage.enterUserName('user@example.com');
 */
import PlaywrightWrapper from "../helpers/wrapper/playwrightWrappers";
import HtmlRoles from "../helpers/wrapper/htmlRoles";
import SharedPageBehavior from "./sharedPageBehavior";
import StepPageHelper from "../tests/steps/stepPageHelper";
import { Page } from "@playwright/test";

/**
 * **BasePage Abstract Class**
 * 
 * **RESPONSIBILITY:** Provides foundation for all page objects with shared behavior and wrapper access
 * 
 * **KEY CAPABILITIES:**
 * - PlaywrightWrapper instance for element interactions
 * - SharedPageBehavior access for cross-page operations
 * - Wait utilities for buttons, links, placeholders
 * - URL retrieval
 * - Resource cleanup
 */
export default abstract class BasePage{
    protected Elements = {};
    protected pwWrapper: PlaywrightWrapper;
    protected sharedBehavior: SharedPageBehavior;

    /**
     * **Constructor**
     * 
     * **WHAT:** Initializes BasePage with Playwright page and wrapper
     * 
     * @param {Page} page - Playwright page instance
     */
    constructor(protected page: Page) {
        this.pwWrapper = new PlaywrightWrapper(page);
    }

    /**
     * **Can Navigate With URL**
     * 
     * **WHAT:** Determines if page can be navigated to via URL (used for caching decision)
     * 
     * **WHY:** PageFactory caches only "real" pages that can be navigated directly
     * 
     * **DEFAULT:** Returns true (most pages are real pages)
     * 
     * **OVERRIDE:** Return false for dialogs, popups, or transient pages
     * 
     * @returns {Promise<boolean>} true if page can be navigated with URL
     * 
     * @example
     * // In dialog page object
     * async canNavigateWithUrl(): Promise<boolean> {
     *   return false; // Don't cache dialogs
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async canNavigateWithUrl(): Promise<boolean>{
        return true;
    }
    
    /**
     * **Initialize**
     * 
     * **WHAT:** Initializes page object by loading SharedPageBehavior
     * 
     * **WHY:** Provides access to cross-page operations (spinners, toasts, dropdowns)
     * 
     * **WHEN CALLED:** By PageFactory before returning page instance
     * 
     * @returns {Promise<boolean>} true on successful initialization
     * 
     * @example
     * // Called automatically by PageFactory
     * const newPage = new LoginPage(page);
     * await newPage.initialize(); // Loads sharedBehavior
     */
    async initialize(): Promise<boolean>{
        this.sharedBehavior = await StepPageHelper.getSharedPageBehavior();
        return true;
    }
    
    /**
     * **Is Page Stable**
     * 
     * **WHAT:** Abstract method to verify page has fully loaded and is ready for interaction
     * 
     * **WHY:** Different pages have different stability criteria (specific elements, no spinners, etc.)
     * 
     * **MUST IMPLEMENT:** Every concrete page object must override this method
     * 
     * @returns {Promise<boolean>} true when page is stable and ready
     * 
     * @example
     * // In LoginPage
     * async isPageStable(): Promise<boolean> {
     *   return await this.pwWrapper.pageElement.isButtonDisplayed('Sign In');
     * }
     * 
     * @example
     * // In OrderPage
     * async isPageStable(): Promise<boolean> {
     *   while (await this.sharedBehavior.isOperationInProgress());
     *   return await this.pwWrapper.pageElement.isButtonDisplayed('Create Order');
     * }
     */
    abstract isPageStable(): Promise<boolean>;

    /**
     * **Get Current Page URL**
     * 
     * **WHAT:** Retrieves current page URL
     * 
     * **WHY:** Verify navigation, assert URL patterns, debug routing issues
     * 
     * @returns {string} Current page URL
     * 
     * @example
     * const url = this.getCurrentPageURL();
     * expect(url).toContain('/dashboard');
     */
    getCurrentPageURL(): string{
        return this.page.url();
    }
    
    /**
     * **Wait Until Button Is Displayed**
     * 
     * **WHAT:** Waits for button to appear with retry logic and optional page refresh
     * 
     * **WHY:** Handles slow-loading pages or buttons appearing after operations complete
     * 
     * **HOW IT WORKS:**
     * 1. Wait for any in-progress operations to complete
     * 2. Check button count up to retryCount times
     * 3. Optionally refresh page between retries
     * 4. Wait for at least one button to be visible
     * 5. Wait for operations to complete again
     * 
     * @param {string} btnName - Button accessible name/text
     * @param {boolean} shouldRefreshPageOnRetry - Refresh page between retries (default false)
     * @param {number} retryCount - Number of retry attempts (default 3)
     * 
     * @example
     * // Wait for Save button
     * await this.waitUntilButtonIsDisplayed('Save');
     * 
     * @example
     * // Wait with page refresh on retry
     * await this.waitUntilButtonIsDisplayed('Submit', true, 5);
     */
    /**
     * This method checks if the button is displayed and visible
     * @param btnName 
     * @param shouldRefreshPageOnRetry 
     * @param retryCount 
     */
    protected async waitUntilButtonIsDisplayed(btnName: string, shouldRefreshPageOnRetry: boolean = false, retryCount: number = 3){
        while (await this.sharedBehavior.isOperationInProgress());
        let btnCount = 0;
        for(let index=0; index<retryCount; index++){
            btnCount = await this.pwWrapper.pageElement.getAvailableElementCountByRole(HtmlRoles.BUTTON, btnName);
            if(btnCount > 0)
                break;
            if(shouldRefreshPageOnRetry)
                await this.pwWrapper.refreshCurrentPage(2000);
        }
        if(btnCount == 1)
            await this.pwWrapper.pageElement.getButton(btnName); //wait until at least one button is displayed
        else if(btnCount > 1)
            (await this.pwWrapper.pageElement.getButton(btnName)).nth(1); //wait until at least one button is displayed

        while (await this.sharedBehavior.isOperationInProgress());
    } 

    /**
     * **Wait Until Placeholder Is Displayed**
     * 
     * **WHAT:** Waits for input with specific placeholder text to appear
     * 
     * **WHY:** Ensures form fields are ready before data entry
     * 
     * **HOW IT WORKS:**
     * 1. Wait for any operations to complete
     * 2. Poll until at least one element with placeholder exists
     * 3. Wait for operations to complete again
     * 
     * @param {string} placeholderTxt - Placeholder text to search for
     * 
     * @example
     * await this.waitUntilPlaceholderIsDisplayed('Username');
     * await this.pwWrapper.dataWriter.enterValueIntoTextboxByPlaceholder('Username', 'user@example.com');
     */
    protected async waitUntilPlaceholderIsDisplayed(placeholderTxt: string){
        while (await this.sharedBehavior.isOperationInProgress());
        while(await this.pwWrapper.pageElement.getAvailableElementCountByPlaceholder(placeholderTxt) < 1);
        while (await this.sharedBehavior.isOperationInProgress());
    } 

    /**
     * **Wait Until Link Is Displayed**
     * 
     * **WHAT:** Waits for link with specific text to appear
     * 
     * **WHY:** Ensures navigation links are ready before clicking
     * 
     * **HOW IT WORKS:**
     * 1. Wait for any operations to complete
     * 2. Poll until at least one link with text exists
     * 3. Wait for operations to complete again
     * 
     * @param {string} linkTxt - Link text to search for
     * 
     * @example
     * await this.waitUntilLinkIsDisplayed('Go to Dashboard');
     * await this.pwWrapper.elementAction.clickElementByRole(HtmlRoles.LINK, 'Go to Dashboard');
     */
    protected async waitUntilLinkIsDisplayed(linkTxt: string){
        while (await this.sharedBehavior.isOperationInProgress());
        while(await this.pwWrapper.pageElement.getAvailableElementCountByRole(HtmlRoles.LINK, linkTxt) < 1);
        while (await this.sharedBehavior.isOperationInProgress());
    } 
    
    /**
     * **Wait Until Toast Message Is Closed**
     * 
     * **WHAT:** Waits for toast notification to disappear
     * 
     * **WHY:** Ensures toast doesn't interfere with subsequent operations
     * 
     * **HOW IT WORKS:**
     * 1. Poll sharedBehavior.isToastMsgVisible() until false
     * 2. Add 2-second delay for UI stabilization
     * 
     * @example
     * await this.sharedBehavior.clickButtonAndInspectSuccessMessage('Save Order', 'Save');
     * await this.waitUntilToastMessageIsClosed();
     * // Now safe to proceed with next operation
     */
    async waitUntilToastMessageIsClosed(){
        while(await this.sharedBehavior.isToastMsgVisible());
        await this.pwWrapper.common.delay(2000);
    }
    
    /**
     * **Clear**
     * 
     * **WHAT:** Cleanup method to release Elements object
     * 
     * **WHY:** Prevents memory leaks by nullifying page-specific data
     * 
     * **WHEN CALLED:** By PageFactory.clear() during test cleanup
     * 
     * @example
     * // Called automatically by PageFactory
     * pageFactory.clear(); // Clears all cached pages
     */
    clear(): void {
        this.Elements = null;
    }
}