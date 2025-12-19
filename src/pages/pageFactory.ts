/**
 * **WHAT:** Factory class for creating and caching page object instances
 * 
 * **WHY:** Single instance pattern for page objects, automatic initialization and stability checking
 * 
 * **WHERE USED:**
 * - StepPageHelper to provide page instances to test steps
 * - Test hooks for page object management
 * - Test teardown for cleanup
 * 
 * **WHEN TO USE:**
 * - Need page object instance in test step
 * - Switching between pages
 * - Test cleanup (clear cache)
 * 
 * **HOW IT WORKS:**
 * 1. Check if page instance exists in cache
 * 2. If cached: return existing instance
 * 3. If not cached:
 *    a. Create new page instance
 *    b. Initialize page (load sharedBehavior)
 *    c. Wait for page stability
 *    d. Cache page (if canNavigateWithUrl is true)
 * 4. Return page instance
 * 
 * **CACHING STRATEGY:**
 * - Only one page cached at a time
 * - New page clears previous cache
 * - Dialogs/popups not cached (canNavigateWithUrl = false)
 * 
 * @example
 * // In test step
 * import PageFactory from '../pages/pageFactory';
 * const factory = new PageFactory();
 * const loginPage = await factory.getPage(LoginPage, page);
 * // If LoginPage already cached, returns existing instance
 * 
 * @example
 * // Cleanup in hooks
 * After(() => {
 *   pageFactory.clear(); // Releases all cached pages
 * });
 */
import { Page } from "@playwright/test";
import BasePage from "./basePage";

/**
 * **PageFactory Class**
 * 
 * **RESPONSIBILITY:** Manages page object lifecycle with caching and automatic initialization
 * 
 * **KEY CAPABILITIES:**
 * - Create page instances on demand
 * - Cache single current page
 * - Automatic page initialization
 * - Stability verification
 * - Resource cleanup
 */
export default class PageFactory {
    // we will have a collection of page objects in 'pages' whose type is a map where
    //      key is constructor function matching BasePage class
    //      value is an instance of BasePage 
    // NOTE 1: this map will always have only one current page
    // NOTE 2: only "real" page will be cached
    private pages: Map<new (p: Page) => BasePage, BasePage> = new Map();
    
    /**
     * **Get Page**
     * 
     * **WHAT:** Retrieves or creates page object instance with automatic initialization
     * 
     * **WHY:** Centralizes page instantiation, caching, and stability verification
     * 
     * **HOW IT WORKS:**
     * 1. Check cache for existing page instance by class type
     * 2. If found: return cached instance (no re-initialization)
     * 3. If not found:
     *    a. Instantiate page class
     *    b. Call initialize() to load dependencies
     *    c. Wait for isPageStable() if checkPageStability=true
     *    d. If canNavigateWithUrl()=true: clear cache and store new page
     * 4. Return page instance
     * 
     * @param {new (p: Page) => T} pageClass - Page object constructor
     * @param {Page} page - Playwright page instance
     * @param {boolean} checkPageStability - Wait for page stability (default true)
     * @returns {Promise<T>} Page object instance
     * 
     * @example
     * // Get LoginPage (cached if exists)
     * const loginPage = await factory.getPage(LoginPage, page);
     * await loginPage.enterUserName('user@example.com');
     * 
     * @example
     * // Get page without stability check (for fast-loading pages)
     * const dialogPage = await factory.getPage(DialogPage, page, false);
     */
    public async getPage<T extends BasePage>(pageClass: new (p: Page) => T, page: Page, checkPageStability: boolean = true): Promise<T> {
        const existingPage = this.pages.get(pageClass);
        if (existingPage) {
          return existingPage as T;
        }
    
        const newPage = new pageClass(page);

        await newPage.initialize();
        
        if(checkPageStability)
            while(!await newPage.isPageStable());

        if(await newPage.canNavigateWithUrl())//we will cache only "real" page
        {
            this.pages.clear();//remove current cached page
            this.pages.set(pageClass, newPage);
        }
        return newPage;
    }
    
    /**
     * **Clear**
     * 
     * **WHAT:** Clears all cached page instances and releases resources
     * 
     * **WHY:** Prevents memory leaks, ensures clean state between tests
     * 
     * **WHEN CALLED:**
     * - After test execution completes
     * - In test teardown hooks
     * - Before starting new test scenario
     * 
     * @example
     * // In Cucumber hooks
     * After(() => {
     *   pageFactory.clear();
     * });
     */
    clear(){
        this.pages.forEach((value) => value.clear());
        this.pages.clear();
    }
} 