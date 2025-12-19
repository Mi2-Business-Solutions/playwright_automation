/**
 * **WHAT:** Global fixture object providing shared instances across test execution
 * 
 * **WHY:** Singleton pattern - single instances of page, logger, dataBag, providers shared by all steps/hooks
 * 
 * **WHERE USED:**
 * - All step definitions (via import { fixture })
 * - Hooks (BeforeAll, Before, After, AfterAll)
 * - Page objects accessing logger, dataBag
 * - Wrapper classes logging operations
 * 
 * **WHEN TO USE:**
 * - Access Playwright page: fixture.page
 * - Log messages: fixture.logger
 * - Store/retrieve step data: fixture.dataBag
 * - Get page objects: fixture.pageFactory
 * - Fetch test data: fixture.testDataProvider
 * - Make API requests: fixture.requestContext
 * 
 * **HOW IT WORKS:**
 * - Initialized in BeforeAll hook (browser, context, page)
 * - Scenario-specific instances created in Before hook (dataBag)
 * - Cleaned up in After/AfterAll hooks
 * - Shared across all steps within scenario
 * 
 * **FIXTURE PROPERTIES:**
 * - page: Playwright Page instance for UI interactions
 * - browserContext: Browser context for page isolation
 * - requestContext: API request context for HTTP calls
 * - logger: Winston logger for test execution logs
 * - dataBag: Scenario-specific data storage
 * - globalDataBag: Cross-scenario data storage
 * - testDataProvider: Test data retrieval system
 * - pageFactory: Page object cache and factory
 * - scenarioRetryCount: Track retry attempts per scenario
 * - maxRetryCount: Max retries from environment
 * 
 * @example
 * // In step definition
 * import { fixture } from '../../hooks/fixture';
 * fixture.logger.info('Executing login step');
 * await fixture.page.goto('https://example.com');
 * fixture.dataBag.saveData('username', 'user@example.com');
 * 
 * @example
 * // In page object
 * fixture.logger.error(`Failed to click button: ${error}`);
 * const data = fixture.dataBag.getData(DataBagKeys.OAUTH_TOKEN);
 * 
 * @example
 * // Get page object
 * const loginPage = await fixture.pageFactory.getPage(LoginPage, fixture.page);
 */
import { Page, APIRequestContext, BrowserContext } from "@playwright/test";
import { Logger } from "winston";
import DataBag from "../helpers/util/dataBag";
import TestDataProvider from "../helpers/util/test-data/testDataProvider";
import PageFactory from "../pages/pageFactory";

/**
 * **Fixture Object**
 * 
 * Global singleton containing shared test infrastructure instances
 */
export const fixture = {
    /* eslint @typescript-eslint/ban-ts-comment: "off" */
    //@ts-ignore"
    requestContext: undefined as APIRequestContext,
    scenarioRetryCount: undefined as { [key: string]: number },// Global object to store retry attempts
    maxRetryCount: undefined as number, // Max retry count from environment variable or default value
    browserContext: undefined as BrowserContext,
    page: undefined as Page,
    logger: undefined as Logger,
    dataBag: undefined as DataBag,//local which is specific to each scenario
    globalDataBag: undefined as DataBag,//global which is common to all scenarios
    testDataProvider: undefined as TestDataProvider,
    pageFactory: undefined as PageFactory,
}