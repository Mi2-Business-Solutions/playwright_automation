// import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout, AfterStep } from "@cucumber/cucumber"
// import { Browser, BrowserContext, request } from "@playwright/test";
// import { fixture } from "./fixture";
// import { invokeBrowser } from "../helpers/browser/browserManager";
// import { getEnv } from "../helpers/env/env";
// import { createLogger } from "winston";
// import { options } from "../helpers/util/logger";
// import DataBag from "../helpers/util/dataBag";
// import TestDataProvider from "../helpers/util/test-data/testDataProvider";
// import PageFactory from "../pages/pageFactory";
// import DataBagKeys from "../tests/steps/dataBagKeys";
// import StepDataHelper from "../tests/steps/stepDataHelper";
// import { TestDataType } from "../helpers/util/test-data/TestDataType";
// import CommonData from "../helpers/util/test-data/dataRequirements/commonData";
// import { GherkinDocument, Pickle, TableCell, TableRow } from "@cucumber/messages";

// /*eslint @typescript-eslint/no-unsafe-argument: "off" */
// /*eslint @typescript-eslint/no-unsafe-assignment: "off" */
// /*eslint @typescript-eslint/no-unsafe-call: "off" */
// /*eslint @typescript-eslint/no-unsafe-member-access: "off" */
// const fs = require("fs-extra");
// const path = require("path");

// let browser: Browser;
// let context: BrowserContext;
// const buildSignalFilePath = 'buildSignal.txt';
// //const loggedInUserAuthInfoFilePath = 'auth.json';

// interface FeatureResult {
//     name: string;
//     path: string;
//     scenarios: ScenarioResult[];
// }

// interface ScenarioResult {
//     name: string;
//     duration: number;
//     failedStep?: string;
//     retries: number;
// }

// interface Example {
//     name: string;
//     tableHeader: string[];
//     tableBody: string[][];
// }
    
// const testResultsDir = path.join(__dirname, '../../test-results'); 
// const failedScenariosDir = path.join(testResultsDir, 'failed');

// let passedFeatures: Record<string, FeatureResult> = {};

// BeforeAll(async function () {
//     getEnv();
//     browser = await invokeBrowser();
//     fixture.testDataProvider = new TestDataProvider();
    
//     // Ensure test results directories exist
//     fs.ensureDirSync(testResultsDir);
//     // Cleanup previous results
//     fs.emptyDirSync(testResultsDir);
//     fs.ensureDirSync(failedScenariosDir);
    
//     fixture.scenarioRetryCount = {};
//     fixture.maxRetryCount= parseInt(process.env.CUCUMBER_RETRY_COUNT);

//     if(fs.existsSync(buildSignalFilePath)){
//        fs.removeSync(buildSignalFilePath); 
//     }
//     /*if(fs.existsSync(loggedInUserAuthInfoFilePath)){
//         fs.removeSync(loggedInUserAuthInfoFilePath); 
//      }*/
//     initializeDataRequirements();
// });

// function initializeDataRequirements() {
//     const globalDataBag = new DataBag();
    
//     let defaultSourceLocation = process.env.DEFAULT_DATA_SOURCE_LOCATION;
//     if (defaultSourceLocation.toLowerCase() === "json") {
//         defaultSourceLocation += "://";
//     }
//     const commonReqDataLocation = defaultSourceLocation + "DATA_REQUIREMENTS_COMMON";
    
//     const commonData = StepDataHelper.getSingleTestDataRecordForType(TestDataType.CommonData, commonReqDataLocation) as CommonData;

//     globalDataBag.saveData(DataBagKeys.DATA_REQ_COMMON, commonData);
//     fixture.globalDataBag = globalDataBag;
// }

// // It will trigger for all tests/scenarios that don't have any tags
// Before(async function ({ pickle, gherkinDocument }) {
//     await runScenarioSetup(gherkinDocument, pickle);
// });

// // It will trigger for all tests/scenarios that have the tag '@my-sample-tag'
// Before("@my-sample-tag", async function ({ pickle, gherkinDocument }) {
//     setDefaultTimeout(5 * 60 * 1000); 
//     await runScenarioSetup(gherkinDocument, pickle, true);
// });
// function cleanUpLastScenarioDetails() {
//     const lastScenarioexecutionCompleted = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED) as boolean;
//     if (lastScenarioexecutionCompleted == undefined || lastScenarioexecutionCompleted == null || lastScenarioexecutionCompleted == true) {
//         return;
//     }
//     const lastScenarioArtifactsDirectoryName = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME) as string;
//     const lastScenarioRetryIndicatorKey = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY) as string;
//     if (lastScenarioArtifactsDirectoryName) {
//         //when a scenario does not execute 'After' step, we need to clean up the artifacts created for that scenario that includes logs, video and trace files
//         //NOTE: traces and screenshots are not cleaned up as they are created only when the scenario is executed successfully
//         let lastScenarioArtifactsPath = path.join(testResultsDir, 'logs', lastScenarioArtifactsDirectoryName);
//         if (fs.existsSync(lastScenarioArtifactsPath)) {
//             fs.removeSync(lastScenarioArtifactsPath);
//         }
//         lastScenarioArtifactsPath = path.join(testResultsDir, 'videos', lastScenarioArtifactsDirectoryName);
//         if (fs.existsSync(lastScenarioArtifactsPath)) {
//             fs.removeSync(lastScenarioArtifactsPath);
//         }
//     }
//     if (lastScenarioRetryIndicatorKey) {
//         if (fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]) {
//             fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]--; // Decrement retry count for the scenario
//         }
//     }
//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, null);
//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, null);
// }

// async function runScenarioSetup(gherkinDocument: GherkinDocument, pickle: Pickle, ignoreHTTPSErrors: boolean = false){
//     cleanUpLastScenarioDetails()
//     let pickleName = pickle.name;
    
//     // If it's a Scenario Outline, append the example values
//     const examples = getCurrentExampleValues(gherkinDocument, pickle);
//     console.log(`Example parameters are: ${JSON.stringify(examples)}`);
//     if(examples.length > 0) {
//         pickleName += ` [${examples.join("-")}]`;
//     }
//     const scenarioName = pickleName + "-" + Date.now().toString();
//     fixture.logger = createLogger(options(scenarioName));
//     const dataBag = new DataBag();
//     fixture.dataBag = dataBag; //we want databag to be unique for each scenario and accessible for all steps in that scenario
//     fixture.requestContext = await request.newContext();
//     if (!fixture.scenarioRetryCount[pickleName]) {
//         fixture.scenarioRetryCount[pickleName] = 1; // Initialize retry count for the scenario
//     } else {
//         fixture.scenarioRetryCount[pickleName]++; // Increment retry count on subsequent attempts
//     }

//     //const videoSize = { width: 1280, height: 720 };
//     const videoSize = { width: 1920, height: 1080 };
//     const contextOptions = {
//         viewport: null, // setting viewport to null is required to launch the browser in full-screen mode
//         //viewport: { width: 1920, height: 1080 }, //this is needed only if these sizes are mentioned in the browser LaunchOptions (check browserManager.ts)
//         recordVideo: {
//             dir: `test-results/videos/${scenarioName}`,
//             size: videoSize,
//         },
//     };

//     /*if (fs.existsSync(loggedInUserAuthInfoFilePath)) {
//         fixture.logger.info(`Auth info is available, attaching it to the context`);
//         contextOptions['storageState'] = loggedInUserAuthInfoFilePath;
//     } else {
//         fixture.logger.info(`Auth info is NOT available, not attaching it to the context`);
//     }*/

//     if (ignoreHTTPSErrors) {
//         contextOptions['ignoreHTTPSErrors'] = true;
//     }

//     context = await browser.newContext(contextOptions);
//     await context.tracing.start({
//         name: scenarioName,
//         //title: pickle.name,
//         title: pickleName,
//         sources: true, screenshots: true, snapshots: true,
//     });
//     const page = await context.newPage();
    
//     // Maximize the window and get the available screen size
//     const { innerWidth, innerHeight } = await page.evaluate(() => {
//         window.moveTo(0, 0);
//         window.resizeTo(screen.availWidth, screen.availHeight);
//         return {
//           innerWidth: window.innerWidth,
//           innerHeight: window.innerHeight
//         };
//       });

//     console.log(`Available screen size: ${innerWidth}x${innerHeight}`);

//     // Set viewport to match the available screen size
//     await page.setViewportSize({ width: innerWidth, height: innerHeight });

//     // Log the final page viewport size
//     const viewportSize = page.viewportSize();
//     console.log(`Final viewport size: ${viewportSize?.width}x${viewportSize?.height}`);

//     fixture.dataBag.saveData(DataBagKeys.SCREEN_WIDTH, innerWidth);
//     fixture.dataBag.saveData(DataBagKeys.SCREEN_HEIGHT, innerHeight);
//     fixture.page = page;
//     fixture.browserContext = context;
//     fixture.pageFactory = new PageFactory();
//     fixture.dataBag.saveData(DataBagKeys.SCENARIO_NAME, scenarioName);
//     fixture.dataBag.saveData(DataBagKeys.PICKLE_NAME, pickleName);
//     fixture.logger.info(`Scenario - ${scenarioName} - started`);
//     console.log(`Scenario - ${scenarioName} - started`);
//     fixture.logger.info(`Feature file path: ${pickle.uri}`);
//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, false);
//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, scenarioName);
//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, pickleName);
//     //fixture.dataBag.saveData(DataBagKeys.USER_AUTH_INFO_FILE_PATH, loggedInUserAuthInfoFilePath);
// }

// /**
//  * @NOTE 1: This function is used to get the current example values for a scenario outline. 
//  * It is ASSUMED that the example values are present in the gherkin document and that the pickle steps contain the example values.
//  * It is also ASSUMED that the example values are unique and do not repeat in the gherkin document.
//  * It is also ASSUMED that the example values are NOT used in the scenario steps except inside the "<>" tags.
//  * 
//  * 2: With the example data, scenario name can become too large hence ensure to have crisp and short example values so that file creations are not an issue.
//  * @param gherkinDocument 
//  * @param pickle 
//  * @returns 
//  */
// function getCurrentExampleValues(gherkinDocument: GherkinDocument, pickle: Pickle): string[] {
//     const exampleValues: string[] = [];

//     gherkinDocument.feature?.children.forEach((child) => {
//         if (child.scenario && child.scenario.examples) {
//             child.scenario.examples.forEach((example) => {
//                 example.tableBody.forEach((row: TableRow) => {
//                     const rowValues = row.cells.map((cell: TableCell) => cell.value);
//                     const isCurrentExample = rowValues.some(value =>
//                         pickle.steps.some(step => step.text.includes(value))
//                     );
//                     if (isCurrentExample) {
//                         exampleValues.push(...rowValues);
//                     }
//                 });
//             });
//         }
//     });

//     return exampleValues;
// }

// AfterStep(async function ({ pickleStep, result }) {
//     if (result?.status === Status.FAILED) {
//         fixture.dataBag.saveData(DataBagKeys.FAILED_STEP, pickleStep.text);
//     }
// });

// After(async function ({ pickle, result }) {
//     const scenarioName = fixture.dataBag.getData(DataBagKeys.SCENARIO_NAME) as string;
//     const pickleName = fixture.dataBag.getData(DataBagKeys.PICKLE_NAME) as string;
//     const currentRetry = fixture.scenarioRetryCount[pickleName] || 1;
//     const maxRetries = fixture.maxRetryCount;
//     const isFinalAttempt = result?.status === Status.PASSED || currentRetry === maxRetries + 1;
//     console.log(`isFinalAttempt: ${isFinalAttempt}, currentRetry: ${currentRetry}, maxRetries: ${maxRetries}, status: ${result?.status}`);
    
//     try {
//         await fixture.requestContext.dispose();
//         let videoPath: string;
//         let img: Buffer;
//         if (result?.status == Status.PASSED) {
//             img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickleName}.png`, type: "png" })
//             videoPath = await fixture.page.video().path();
//         }else if (result?.status == Status.FAILED) {
//             if(!fs.existsSync(buildSignalFilePath)) {
//                 const currentRetry = fixture.scenarioRetryCount[pickleName];
//                 if (currentRetry == fixture.maxRetryCount + 1) {
//                     fs.createFileSync(buildSignalFilePath);
//                     fs.writeFileSync(buildSignalFilePath, "failed");
//                 }
//             }
//         }

//         const tracePath = `./test-results/traces/${scenarioName}/${pickleName}`; 
//         await context.tracing.stop({path: tracePath});
        
//         await fixture.page.close();

//         fixture.pageFactory.clear();

//         /*if (!fs.existsSync(loggedInUserAuthInfoFilePath)) {
//             fixture.logger.info(`Auth info is not available, hence creating it`);
//             await context.storageState({ path: loggedInUserAuthInfoFilePath }); //note: this creates additional emtpy video file
//         } else {
//             fixture.logger.info(`Auth info is available`);
//         }*/
        
//         await context.close();
        
//         const featurePath = pickle.uri;
//         const featureName = getFeatureName(featurePath);
//         const duration = result?.duration ? result.duration.nanos / 1_000_000 : 0;
//         const scenarioResult: ScenarioResult = {
//             name: scenarioName,
//             duration: duration,
//             retries: fixture.scenarioRetryCount[pickleName] - 1,
//         };

//         if (result?.status === Status.PASSED) {
//             if (!passedFeatures[featurePath]) {
//                 passedFeatures[featurePath] = {
//                     name: featureName,
//                     path: featurePath,
//                     scenarios: []
//                 };
//             }
//             passedFeatures[featurePath].scenarios.push(scenarioResult);
//         } else if (result?.status === Status.FAILED && isFinalAttempt) {
//             const failedStep = fixture.dataBag.getData(DataBagKeys.FAILED_STEP) as string;
//             scenarioResult.failedStep = failedStep;

//             // Write failed scenario immediately
//             const featureResult: FeatureResult = {
//                 name: featureName,
//                 path: featurePath,
//                 scenarios: [scenarioResult]
//             };

//             writeFailedFeatureResult(featureResult);
//         }

//         fixture.dataBag = null;
//         if (result?.status == Status.PASSED) {
//             this.attach(
//                 img, "image/png"
//             );
//             this.attach(
//                 fs.readFileSync(videoPath),
//                 'video/webm'
//             );

//             fixture.logger.info(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
//             console.log(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
//         }else{
//             console.log(`Scenario - ${scenarioName} - completed WITH ERRORS`);
//             fixture.logger.error(`Scenario - ${scenarioName} - completed WITH ERRORS`);
//         }
//     } catch (error) {
//         console.log(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
//         fixture.logger.error(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
//     }

//     fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, true);
// });

// AfterAll(async function () {
//     // Write passed scenarios
//     fs.writeJsonSync(
//         path.join(testResultsDir, 'passed-scenarios.json'),
//         Object.values(passedFeatures),
//         { spaces: 2 }
//     );
//     fixture.globalDataBag = null;
//     fixture.testDataProvider.close();
//     await browser.close();
// });

// function getFeatureName(featurePath: string): string {
//     return path.basename(featurePath, '.feature');
// }

// function writeFailedFeatureResult(featureResult: FeatureResult) {
//     const sanitizedFeatureName = sanitizeFilename(featureResult.name);
//     const fileName = `${sanitizedFeatureName}-failed-scenarios.json`;
//     const filePath = path.join(failedScenariosDir, fileName);

//     // Merge with existing results if file exists
//     let existingData: FeatureResult = { name: '', path: '', scenarios: [] };
//     if (fs.existsSync(filePath)) {
//         existingData = fs.readJsonSync(filePath);
//     }

//     const mergedResult: FeatureResult = {
//         name: featureResult.name,
//         path: featureResult.path,
//         scenarios: [...existingData.scenarios, ...featureResult.scenarios]
//     };

//     fs.writeJsonSync(filePath, mergedResult, { spaces: 2 });
// }

// function sanitizeFilename(name: string): string {
//     return name
//         .replace(/[^a-zA-Z0-9-_]/g, '_')
//         .substring(0, 50) // Limit filename length
//         .toLowerCase();
// }

/**
 * @fileoverview Cucumber Lifecycle Hooks for Playwright Test Automation
 * 
 * WHAT THIS FILE DOES:
 * This file implements Cucumber's test lifecycle hooks (BeforeAll, Before, AfterStep, After, AfterAll) 
 * that control the setup, execution, and teardown of automated browser tests using Playwright.
 * 
 * WHY IT EXISTS:
 * - Manages the entire test lifecycle from browser initialization to cleanup
 * - Orchestrates scenario setup with unique browser contexts, video recording, and tracing
 * - Tracks test results and handles scenario retries automatically
 * - Captures test artifacts (screenshots, videos, traces) for debugging
 * - Generates JSON reports of passed and failed scenarios
 * 
 * WHERE IT'S USED:
 * - Automatically invoked by Cucumber before and after each test scenario
 * - Runs once before all tests (BeforeAll) and once after all tests (AfterAll)
 * - Executed in between each test step (AfterStep) for failure tracking
 * 
 * WHEN IT'S USED:
 * - BeforeAll: Once at test suite start to initialize browser and directories
 * - Before: Before each scenario to create fresh browser context and page
 * - AfterStep: After each test step to capture failed step information
 * - After: After each scenario to capture artifacts and write results
 * - AfterAll: Once at test suite end to close browser and write final reports
 * 
 * HOW IT WORKS:
 * 1. BeforeAll hook initializes the browser, cleans up old test results, and loads common data
 * 2. Before hook creates a new browser context with video/trace recording for each scenario
 * 3. AfterStep hook tracks which step failed if a scenario fails
 * 4. After hook captures screenshots/videos, stops recording, and writes results
 * 5. AfterAll hook generates final JSON reports and closes the browser
 * 
 * SCHOLAR EXPLANATION:
 * Think of this file as the "stage manager" for your automated tests. Before the show starts,
 * it sets up the stage (browser initialization). For each performance (test scenario), it opens
 * the curtains (new browser context), starts recording (video/trace), and takes notes (logging).
 * When a performer makes a mistake (test fails), it captures the moment (screenshot, failed step).
 * After each performance, it saves the recordings and reviews the results. When all performances
 * are done, it creates a final report card showing successes and failures.
 * 
 * KEY FEATURES:
 * - Automatic retry tracking: Scenarios can retry up to CUCUMBER_RETRY_COUNT times
 * - Artifact management: Creates organized folders for logs, videos, traces, screenshots
 * - Build signal: Creates 'buildSignal.txt' file when a scenario fails on final attempt
 * - Scenario Outline support: Handles parameterized tests with example data
 * - Full-screen browser: Maximizes viewport to available screen size
 * - Immediate result writing: Failed scenarios written immediately, passed scenarios batched
 * 
 * @example
 * // Cucumber automatically invokes these hooks:
 * // 1. BeforeAll runs once
 * // 2. Before runs for "Login should pass" scenario
 * // 3. AfterStep runs after each step
 * // 4. After runs when scenario completes
 * // 5. Before runs for next scenario
 * // 6. AfterAll runs after all scenarios
 */

import { BeforeAll, AfterAll, Before, After, Status,setDefaultTimeout,AfterStep } from "@cucumber/cucumber"
import { Browser, BrowserContext,request } from "@playwright/test";
import { fixture } from "./fixture";
import { invokeBrowser } from "../helpers/browser/browserManager";
import { getEnv } from "../helpers/env/env";
import { createLogger } from "winston";
import { options } from "../helpers/util/logger";
import DataBag from "../helpers/util/dataBag";
import TestDataProvider from "../helpers/util/test-data/testDataProvider";
import PageFactory from "../pages/pageFactory";
import DataBagKeys from "../tests/steps/dataBagKeys";
import StepDataHelper from "../tests/steps/stepDataHelper";
import { TestDataType } from "../helpers/util/test-data/TestDataType";
import { GherkinDocument, Pickle, TableCell, TableRow } from "@cucumber/messages";
import CommonData from "../helpers/util/test-data/dataRequirements/commonData";

/*eslint @typescript-eslint/no-unsafe-argument: "off" */
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-call: "off" */
/*eslint @typescript-eslint/no-unsafe-member-access: "off" */
const fs = require("fs-extra");
const path = require("path");

/** Browser instance shared across all scenarios in the test suite */
let browser: Browser;

/** Browser context instance for the current scenario (isolated cookies, storage, etc.) */
let context: BrowserContext;

/** File path to signal build failure (created when a scenario fails on final retry attempt) */
/** File path to signal build failure (created when a scenario fails on final retry attempt) */
const buildSignalFilePath = 'buildSignal.txt';

/**
 * Feature Result Interface
 * 
 * WHAT: Represents test results for an entire feature file
 * WHY: Organizes scenario results by feature for clear reporting
 * 
 * @property {string} name - Feature file name without .feature extension
 * @property {string} path - Full path to the feature file
 * @property {ScenarioResult[]} scenarios - Array of scenario results within this feature
 * 
 * @example
 * {
 *   name: "Login",
 *   path: "src/tests/features/login.feature",
 *   scenarios: [...]
 * }
 */
interface FeatureResult {
    name: string;
    path: string;
    scenarios: ScenarioResult[];
}

/**
 * Scenario Result Interface
 * 
 * WHAT: Represents test results for a single scenario execution
 * WHY: Tracks scenario performance, retries, and failure information
 * 
 * @property {string} name - Unique scenario name with timestamp (e.g., "Login should pass-1765258796889")
 * @property {number} duration - Execution time in milliseconds
 * @property {string} [failedStep] - Text of the step that failed (only present if scenario failed)
 * @property {number} retries - Number of times this scenario was retried (0 if passed on first attempt)
 * 
 * @example
 * {
 *   name: "Login should pass-1765258796889",
 *   duration: 5432,
 *   retries: 0
 * }
 */
interface ScenarioResult {
    name: string;
    duration: number;
    failedStep?: string;
    retries: number;
}

/**
 * Example Interface
 * 
 * WHAT: Represents Scenario Outline example table structure
 * WHY: Parses parameterized test data from Gherkin example tables
 * 
 * @property {string} name - Name of the examples block
 * @property {string[]} tableHeader - Column headers from the Examples table
 * @property {string[][]} tableBody - Rows of data values from the Examples table
 * 
 * @example
 * {
 *   name: "Valid credentials",
 *   tableHeader: ["username", "password"],
 *   tableBody: [["user1", "pass1"], ["user2", "pass2"]]
 * }
 */
interface Example {
    name: string;
    tableHeader: string[];
    tableBody: string[][];
}

/** Directory path for all test results (screenshots, videos, traces, logs) */
const testResultsDir = path.join(__dirname, '../../test-results'); 

/** Directory path for failed scenario JSON reports */
const failedScenariosDir = path.join(testResultsDir, 'failed');

/** 
 * Dictionary of passed feature results, keyed by feature file path
 * Accumulates passed scenarios during test execution, written to JSON at end
 */
/** 
 * Dictionary of passed feature results, keyed by feature file path
 * Accumulates passed scenarios during test execution, written to JSON at end
 */
let passedFeatures: Record<string, FeatureResult> = {};

/**
 * BeforeAll Hook - Test Suite Initialization
 * 
 * WHAT: Runs once before all scenarios in the test suite
 * WHY: Initializes shared resources and cleans up previous test artifacts
 * WHERE: Invoked automatically by Cucumber at test suite start
 * WHEN: Before any scenarios execute
 * 
 * HOW IT WORKS:
 * 1. Loads environment variables from .env file (getEnv)
 * 2. Launches the browser instance (Chrome, Firefox, etc.)
 * 3. Creates TestDataProvider for accessing test data (JSON/database)
 * 4. Ensures test-results directories exist, empties them from previous runs
 * 5. Initializes retry tracking dictionary (fixture.scenarioRetryCount)
 * 6. Reads max retry count from CUCUMBER_RETRY_COUNT env variable
 * 7. Removes build signal file if it exists from previous run
 * 8. Loads common test data requirements into global data bag
 * 
 * SCHOLAR EXPLANATION:
 * This is like preparing a science lab before experiments. You turn on the equipment (browser),
 * clean up old results (empty directories), prepare your data sheets (test data provider),
 * and set up your experiment log (retry tracking). Everything is ready for the experiments to begin.
 * 
 * @example
 * // Automatically invoked by Cucumber:
 * // 1. Launches Chrome browser in headless mode
 * // 2. Clears test-results/ folder
 * // 3. Creates test-results/failed/ folder
 * // 4. Sets max retries to 2 (from CUCUMBER_RETRY_COUNT)
 * // 5. Loads common data from DATA_REQUIREMENTS_COMMON
 */
BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
    fixture.testDataProvider = new TestDataProvider();
    // Ensure test results directories exist
    fs.ensureDirSync(testResultsDir);
    // Cleanup previous results
    fs.emptyDirSync(testResultsDir);
    fs.ensureDirSync(failedScenariosDir);
    fixture.scenarioRetryCount = {};
    fixture.maxRetryCount= parseInt(process.env.CUCUMBER_RETRY_COUNT);
    if(fs.existsSync(buildSignalFilePath)){
        fs.removeSync(buildSignalFilePath); 
     }
     initializeDataRequirements();
});

/**
 * Initialize Data Requirements
 * 
 * WHAT: Loads common test data into the global data bag
 * WHY: Makes shared data available to all scenarios without reloading
 * WHERE: Called by BeforeAll hook
 * WHEN: Once at test suite start
 * 
 * HOW IT WORKS:
 * 1. Creates a new global DataBag instance
 * 2. Reads DEFAULT_DATA_SOURCE_LOCATION from environment (e.g., "json")
 * 3. Constructs data location URI (e.g., "json://DATA_REQUIREMENTS_COMMON")
 * 4. Loads CommonData from the specified location (URLs, credentials, etc.)
 * 5. Saves common data to global data bag with key DATA_REQ_COMMON
 * 6. Stores global data bag in fixture for cross-scenario access
 * 
 * SCHOLAR EXPLANATION:
 * This is like setting up a shared reference book for all students in a class. Instead of
 * every student fetching the same information individually, you place it on a central desk
 * (global data bag) where everyone can access it. This saves time and ensures consistency.
 * 
 * @example
 * // If DEFAULT_DATA_SOURCE_LOCATION = "json":
 * // Loads: test-data-store/dataRequirements/common.json
 * // Contains: { "appUrl": "https://example.com", "timeout": 30000, ... }
 * // Accessible in steps via: fixture.globalDataBag.getData(DataBagKeys.DATA_REQ_COMMON)
 */
function initializeDataRequirements() {
    const globalDataBag = new DataBag();
    
    let defaultSourceLocation = process.env.DEFAULT_DATA_SOURCE_LOCATION;
    if (defaultSourceLocation.toLowerCase() === "json") {
        defaultSourceLocation += "://";
    }
    const commonReqDataLocation = defaultSourceLocation + "DATA_REQUIREMENTS_COMMON";
    
    const commonData = StepDataHelper.getSingleTestDataRecordForType(TestDataType.CommonData, commonReqDataLocation) as CommonData;

    globalDataBag.saveData(DataBagKeys.DATA_REQ_COMMON, commonData);
    fixture.globalDataBag = globalDataBag;
}

/**
 * Before Hook - Default Scenario Setup
 * 
 * WHAT: Runs before each scenario that has no tags
 * WHY: Creates isolated browser context and initializes scenario-specific resources
 * WHERE: Invoked automatically by Cucumber before each untagged scenario
 * WHEN: Before scenario steps execute
 * 
 * HOW IT WORKS:
 * Delegates to runScenarioSetup() with default settings (HTTPS errors not ignored)
 * 
 * SCHOLAR EXPLANATION:
 * This is the default preparation for each test. Like setting up a clean workspace
 * for each experiment using standard equipment and safety protocols.
 * 
 * @param {Object} context - Cucumber context
 * @param {Pickle} context.pickle - Scenario information (name, steps, location)
 * @param {GherkinDocument} context.gherkinDocument - Full feature file AST
 * 
 * @example
 * // For scenario: "Login should pass"
 * // Creates new browser context with video recording
 * // Initializes logger, dataBag, pageFactory
 * // Sets up full-screen viewport
 */
// It will trigger for all tests/scenarios that don't have any tags
Before(async function ({ pickle, gherkinDocument }) {
    await runScenarioSetup(gherkinDocument, pickle);
});

/**
 * Before Hook - Tagged Scenario Setup
 * 
 * WHAT: Runs before scenarios with the '@my-sample-tag' tag
 * WHY: Provides custom configuration for specific scenarios (extended timeout, ignore HTTPS errors)
 * WHERE: Invoked automatically by Cucumber before tagged scenarios
 * WHEN: Before scenario steps execute
 * 
 * HOW IT WORKS:
 * 1. Sets Cucumber timeout to 5 minutes (300,000 ms)
 * 2. Delegates to runScenarioSetup() with ignoreHTTPSErrors = true
 * 
 * SCHOLAR EXPLANATION:
 * This is like preparing for a special experiment that needs extra time and relaxed
 * security rules. You might need this when testing against development servers with
 * self-signed certificates.
 * 
 * @param {Object} context - Cucumber context
 * @param {Pickle} context.pickle - Scenario information
 * @param {GherkinDocument} context.gherkinDocument - Full feature file AST
 * 
 * @example
 * // For scenario with @my-sample-tag:
 * // @my-sample-tag
 * // Scenario: Test against dev server
 * //   Given I navigate to https://dev.example.com (self-signed cert ignored)
 */
// It will trigger for all tests/scenarios that have the tag '@my-sample-tag'
Before("@my-sample-tag", async function ({ pickle, gherkinDocument }) {
    setDefaultTimeout(5 * 60 * 1000); 
    await runScenarioSetup(gherkinDocument, pickle, true);
});

/**
 * Clean Up Last Scenario Details
 * 
 * WHAT: Removes artifacts and resets retry count for incomplete scenarios
 * WHY: Prevents orphaned files when a scenario crashes without executing After hook
 * WHERE: Called by runScenarioSetup() before each scenario
 * WHEN: At the start of each scenario setup
 * 
 * HOW IT WORKS:
 * 1. Checks if last scenario completed execution (LAST_SCENARIO_EXECUTION_COMPLETED flag)
 * 2. If completed (true) or undefined, does nothing
 * 3. If incomplete (false):
 *    a. Retrieves last scenario's artifact directory name
 *    b. Removes logs directory (test-results/logs/[scenario-name])
 *    c. Removes videos directory (test-results/videos/[scenario-name])
 *    d. Decrements retry count for the incomplete scenario
 *    e. Resets global data bag tracking keys to null
 * 
 * SCHOLAR EXPLANATION:
 * This is like a janitor checking if the previous class left the room messy. If the
 * students left suddenly without cleaning up (scenario crashed), the janitor removes
 * leftover materials (logs, videos) and updates the attendance sheet (retry count).
 * This prevents clutter and ensures accurate tracking.
 * 
 * @example
 * // If scenario "Login should fail" crashes during execution:
 * // - LAST_SCENARIO_EXECUTION_COMPLETED = false
 * // - Removes: test-results/logs/Login should fail-1765258742353/
 * // - Removes: test-results/videos/Login should fail-1765258742353/
 * // - Decrements scenarioRetryCount["Login should fail"] from 2 to 1
 */
function cleanUpLastScenarioDetails() {
    const lastScenarioexecutionCompleted = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED) as boolean;
    if (lastScenarioexecutionCompleted == undefined || lastScenarioexecutionCompleted == null || lastScenarioexecutionCompleted == true) {
        return;
    }
    const lastScenarioArtifactsDirectoryName = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME) as string;
    const lastScenarioRetryIndicatorKey = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY) as string;
    if (lastScenarioArtifactsDirectoryName) {
        //when a scenario does not execute 'After' step, we need to clean up the artifacts created for that scenario that includes logs, video and trace files
        //NOTE: traces and screenshots are not cleaned up as they are created only when the scenario is executed successfully
        let lastScenarioArtifactsPath = path.join(testResultsDir, 'logs', lastScenarioArtifactsDirectoryName);
        if (fs.existsSync(lastScenarioArtifactsPath)) {
            fs.removeSync(lastScenarioArtifactsPath);
        }
        lastScenarioArtifactsPath = path.join(testResultsDir, 'videos', lastScenarioArtifactsDirectoryName);
        if (fs.existsSync(lastScenarioArtifactsPath)) {
            fs.removeSync(lastScenarioArtifactsPath);
        }
    }
    if (lastScenarioRetryIndicatorKey) {
        if (fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]) {
            fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]--; // Decrement retry count for the scenario
        }
    }
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, null);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, null);
    }

/**
 * Run Scenario Setup
 * 
 * WHAT: Comprehensive setup for each scenario execution
 * WHY: Creates isolated browser context with recording, logging, and tracking
 * WHERE: Called by Before hooks (default and tagged)
 * WHEN: Before each scenario's steps execute
 * 
 * HOW IT WORKS:
 * 1. **Cleanup**: Calls cleanUpLastScenarioDetails() to handle incomplete scenarios
 * 2. **Name Construction**: 
 *    - Uses pickle.name (scenario name from feature file)
 *    - For Scenario Outlines, appends example values: "Login [user1-pass1]"
 *    - Adds timestamp: "Login [user1-pass1]-1765258796889"
 * 3. **Logger Setup**: Creates Winston logger with scenario-specific log file
 * 4. **Data Bag**: Creates fresh DataBag instance for scenario-specific data
 * 5. **Request Context**: Initializes Playwright API request context
 * 6. **Retry Tracking**: Initializes or increments retry count for this scenario
 * 7. **Browser Context**: Creates new context with:
 *    - Full-screen viewport (null viewport for maximized browser)
 *    - Video recording (1920x1080, saved to test-results/videos/[scenario-name]/)
 *    - HTTP credentials (username: "520864", empty password)
 *    - Optional HTTPS error ignoring (for tagged scenarios)
 * 8. **Tracing**: Starts Playwright tracing (screenshots, snapshots, sources)
 * 9. **Page Creation**: Creates new page in the context
 * 10. **Viewport Maximization**: 
 *     - Moves window to (0,0) and resizes to screen.availWidth/availHeight
 *     - Sets Playwright viewport to match actual window size
 *     - Stores screen dimensions in data bag
 * 11. **Fixture Population**: Stores page, context, pageFactory, dataBag in fixture
 * 12. **Tracking Setup**: Records scenario name, pickle name, and incomplete execution status
 * 
 * SCHOLAR EXPLANATION:
 * This is like preparing a photography studio for a photo shoot. You clean up from the last
 * shoot (cleanup), set up new lighting and cameras (browser context), start recording video
 * (video recording), turn on the backdrop (page), adjust the camera position (viewport),
 * and create a new shot list (data bag). Everything is documented in a logbook (logger).
 * 
 * @param {GherkinDocument} gherkinDocument - Full feature file abstract syntax tree
 * @param {Pickle} pickle - Scenario information (name, steps, tags, location)
 * @param {boolean} [ignoreHTTPSErrors=false] - Whether to ignore HTTPS certificate errors
 * 
 * @example
 * // For Scenario Outline with examples:
 * // Scenario Outline: Login with credentials
 * //   Given I login with <username> and <password>
 * //   Examples:
 * //     | username | password |
 * //     | user1    | pass1    |
 * // 
 * // Creates scenario name: "Login with credentials [user1-pass1]-1765258796889"
 * // Video saved to: test-results/videos/Login with credentials [user1-pass1]-1765258796889/
 * // Logs saved to: test-results/logs/Login with credentials [user1-pass1]-1765258796889/
 */
async function runScenarioSetup(gherkinDocument: GherkinDocument, pickle: Pickle, ignoreHTTPSErrors: boolean = false){
    cleanUpLastScenarioDetails()
    let pickleName = pickle.name;
    
    // If it's a Scenario Outline, append the example values
    const examples = getCurrentExampleValues(gherkinDocument, pickle);
    console.log(`Example parameters are: ${JSON.stringify(examples)}`);
    if(examples.length > 0) {
        pickleName += ` [${examples.join("-")}]`;
    }
    const scenarioName = pickleName + "-" + Date.now().toString();
    fixture.logger = createLogger(options(scenarioName));
    const dataBag = new DataBag();
    fixture.dataBag = dataBag; //we want databag to be unique for each scenario and accessible for all steps in that scenario
    fixture.requestContext = await request.newContext();
    if (!fixture.scenarioRetryCount[pickleName]) {
        fixture.scenarioRetryCount[pickleName] = 1; // Initialize retry count for the scenario
    } else {
        fixture.scenarioRetryCount[pickleName]++; // Increment retry count on subsequent attempts
    }

    //const videoSize = { width: 1280, height: 720 };
    const videoSize = { width: 1920, height: 1080 };
    const contextOptions = {
        viewport: null, // setting viewport to null is required to launch the browser in full-screen mode
        //viewport: { width: 1920, height: 1080 }, //this is needed only if these sizes are mentioned in the browser LaunchOptions (check browserManager.ts)
        recordVideo: {
            dir: `test-results/videos/${scenarioName}`,
            size: videoSize,
        },
        httpCredentials:{
            username:"520864",
            password:""
        }
    };

    /*if (fs.existsSync(loggedInUserAuthInfoFilePath)) {
        fixture.logger.info(`Auth info is available, attaching it to the context`);
        contextOptions['storageState'] = loggedInUserAuthInfoFilePath;
    } else {
        fixture.logger.info(`Auth info is NOT available, not attaching it to the context`);
    }*/

    if (ignoreHTTPSErrors) {
        contextOptions['ignoreHTTPSErrors'] = true;
    }

    context = await browser.newContext(contextOptions);
    await context.tracing.start({
        name: scenarioName,
        //title: pickle.name,
        title: pickleName,
        sources: true, screenshots: true, snapshots: true,
    });
    const page = await context.newPage();
    
    // Maximize the window and get the available screen size
    const { innerWidth, innerHeight } = await page.evaluate(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        };
      });

    console.log(`Available screen size: ${innerWidth}x${innerHeight}`);

    // Set viewport to match the available screen size
    await page.setViewportSize({ width: innerWidth, height: innerHeight });

    // Log the final page viewport size
    const viewportSize = page.viewportSize();
    console.log(`Final viewport size: ${viewportSize?.width}x${viewportSize?.height}`);

    fixture.dataBag.saveData(DataBagKeys.SCREEN_WIDTH, innerWidth);
    fixture.dataBag.saveData(DataBagKeys.SCREEN_HEIGHT, innerHeight);
    fixture.page = page;
    fixture.browserContext = context;
    fixture.pageFactory = new PageFactory();
    fixture.dataBag.saveData(DataBagKeys.SCENARIO_NAME, scenarioName);
    fixture.dataBag.saveData(DataBagKeys.PICKLE_NAME, pickleName);
    fixture.logger.info(`Scenario - ${scenarioName} - started`);
    console.log(`Scenario - ${scenarioName} - started`);
    fixture.logger.info(`Feature file path: ${pickle.uri}`);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, false);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, scenarioName);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, pickleName);
    //fixture.dataBag.saveData(DataBagKeys.USER_AUTH_INFO_FILE_PATH, loggedInUserAuthInfoFilePath);
}

/**
 * Get Current Example Values
 * 
 * WHAT: Extracts parameter values from Scenario Outline examples for the current scenario
 * WHY: Appends example data to scenario names for unique identification in reports/artifacts
 * WHERE: Called by runScenarioSetup() for Scenario Outlines
 * WHEN: During scenario setup, before creating logger and context
 * 
 * HOW IT WORKS:
 * 1. Iterates through all children of the feature (scenarios)
 * 2. For each child with examples (Scenario Outline):
 *    a. Loops through example tables
 *    b. For each table row, extracts cell values
 *    c. Checks if any value appears in pickle.steps (current scenario)
 *    d. If match found, adds all row values to exampleValues array
 * 3. Returns array of example values (e.g., ["user1", "pass1"])
 * 
 * SCHOLAR EXPLANATION:
 * Imagine a teacher with a question template and multiple answer keys. This function
 * finds which answer key the student is currently using by checking which answers
 * appear in the student's test paper (pickle.steps). It then returns all values
 * from that answer key to label the test paper uniquely.
 * 
 * IMPORTANT ASSUMPTIONS (from code comments):
 * - Example values are present in the gherkin document
 * - Pickle steps contain the example values
 * - Example values are unique and don't repeat in the document
 * - Example values are NOT used in steps except inside "<>" tags
 * - Example values should be short to avoid file system path length issues
 * 
 * @param {GherkinDocument} gherkinDocument - Full feature file AST containing examples
 * @param {Pickle} pickle - Current scenario with resolved step text (e.g., "I login with user1")
 * @returns {string[]} Array of example values for current scenario (e.g., ["user1", "pass1"])
 * 
 * @example
 * // Given Scenario Outline:
 * // Scenario Outline: Login
 * //   Given I login with <username> and <password>
 * //   Examples:
 * //     | username | password |
 * //     | admin    | admin123 |
 * //     | user     | user123  |
 * //
 * // When pickle.steps contains "I login with admin and admin123"
 * // Returns: ["admin", "admin123"]
 * //
 * // Resulting scenario name: "Login [admin-admin123]-1765258796889"
 */
function getCurrentExampleValues(gherkinDocument: GherkinDocument, pickle: Pickle): string[] {
    const exampleValues: string[] = [];

    gherkinDocument.feature?.children.forEach((child) => {
        if (child.scenario && child.scenario.examples) {
            child.scenario.examples.forEach((example) => {
                example.tableBody.forEach((row: TableRow) => {
                    const rowValues = row.cells.map((cell: TableCell) => cell.value);
                    const isCurrentExample = rowValues.some(value =>
                        pickle.steps.some(step => step.text.includes(value))
                    );
                    if (isCurrentExample) {
                        exampleValues.push(...rowValues);
                    }
                });
            });
        }
    });

    return exampleValues;
}

/**
 * AfterStep Hook - Failed Step Tracking
 * 
 * WHAT: Captures the text of failed steps for reporting
 * WHY: Provides specific failure information in scenario results
 * WHERE: Invoked automatically by Cucumber after each step
 * WHEN: After every step execution
 * 
 * HOW IT WORKS:
 * - Checks if step result status is FAILED
 * - If failed, saves step text to data bag with key FAILED_STEP
 * - This value is later retrieved in After hook for result reporting
 * 
 * SCHOLAR EXPLANATION:
 * This is like a teacher marking which question a student got wrong. When grading
 * an exam (scenario), if a question (step) is incorrect, the teacher circles it
 * (saves to data bag) so they can reference it in the final grade report.
 * 
 * @param {Object} context - Cucumber step context
 * @param {PickleStep} context.pickleStep - Step information (text, location)
 * @param {TestStepResult} context.result - Step execution result (status, duration, error)
 * 
 * @example
 * // If step fails: When I click the login button
 * // Saves to dataBag: FAILED_STEP = "When I click the login button"
 * // Later retrieved in After hook for JSON report:
 * // { name: "Login-123", failedStep: "When I click the login button", ... }
 */
AfterStep(async function ({ pickleStep, result }) {
    if (result?.status === Status.FAILED) {
        fixture.dataBag.saveData(DataBagKeys.FAILED_STEP, pickleStep.text);
    }
});

/**
 * After Hook - Scenario Cleanup and Result Reporting
 * 
 * WHAT: Comprehensive cleanup after each scenario with artifact capture and result writing
 * WHY: Captures test evidence, manages resources, and generates JSON reports
 * WHERE: Invoked automatically by Cucumber after each scenario
 * WHEN: After all scenario steps complete (pass or fail)
 * 
 * HOW IT WORKS:
 * 
 * **Phase 1: Determine Final Attempt**
 * - Retrieves current retry count and max retries
 * - Calculates if this is final attempt (passed OR reached max retries)
 * - Example: If maxRetries=2 and currentRetry=3, it's final attempt
 * 
 * **Phase 2: Cleanup Resources (in try-catch block)**
 * - Disposes request context to free API resources
 * - Initializes videoPath and screenshot buffer variables
 * 
 * **Phase 3: Artifact Capture (based on status)**
 * 
 * If PASSED:
 * - Takes screenshot: test-results/screenshots/[pickle.name].png
 * - Gets video path (video recording stops automatically on page close)
 * 
 * If FAILED:
 * - Takes screenshot: test-results/screenshots/[pickle.name].png
 * - Checks if build signal file doesn't exist
 * - If this is final retry attempt (currentRetry == maxRetryCount + 1):
 *   * Creates buildSignal.txt file with content "failed"
 *   * This signals CI/CD pipeline that build should fail
 * 
 * **Phase 4: Tracing and Page Cleanup**
 * - Stops Playwright tracing: test-results/traces/[scenario-name]/[pickle.name]
 * - Closes page (also stops video recording)
 * - Clears pageFactory cache
 * - Closes browser context
 * 
 * **Phase 5: Result Object Creation**
 * - Extracts feature name from pickle.uri
 * - Calculates duration in milliseconds (from nanoseconds)
 * - Creates ScenarioResult object with name, duration, retries
 * 
 * **Phase 6: Result Writing (based on status)**
 * 
 * If PASSED:
 * - Adds scenario to passedFeatures dictionary (keyed by feature path)
 * - Results written to JSON at end (AfterAll hook)
 * 
 * If FAILED and isFinalAttempt:
 * - Retrieves failedStep from data bag
 * - Adds failedStep to ScenarioResult
 * - Creates FeatureResult with this scenario
 * - Immediately writes to: test-results/failed/[feature-name]-failed-scenarios.json
 * - Merges with existing failed scenarios in the file
 * 
 * **Phase 7: Attachment and Logging**
 * - Nullifies dataBag (garbage collection)
 * - If PASSED:
 *   * Attaches screenshot to Cucumber report
 *   * Attaches video to Cucumber report
 *   * Logs success message
 * - If FAILED:
 *   * Logs error message
 * 
 * **Phase 8: Completion Tracking**
 * - Sets LAST_SCENARIO_EXECUTION_COMPLETED = true in global data bag
 * - Prevents cleanUpLastScenarioDetails() from running for this scenario
 * 
 * **Error Handling:**
 * - Entire After logic wrapped in try-catch
 * - Any error logged to console and logger
 * - Ensures LAST_SCENARIO_EXECUTION_COMPLETED always set even on failure
 * 
 * SCHOLAR EXPLANATION:
 * This is like a photographer finishing a photo shoot. They check if this was the last
 * attempt (final retry), turn off the lights and camera (close page/context), develop
 * the photos (capture screenshots/videos), sort them into albums (passed/failed folders),
 * write notes about what went wrong (failedStep), and mark the shoot as complete
 * (LAST_SCENARIO_EXECUTION_COMPLETED). If something goes really wrong on the final try,
 * they put up a "closed" sign (buildSignal.txt) so others know not to proceed.
 * 
 * @param {Object} context - Cucumber scenario context
 * @param {Pickle} context.pickle - Scenario information (name, uri)
 * @param {TestCaseResult} context.result - Scenario execution result (status, duration)
 * 
 * @example
 * // For passed scenario:
 * // - Screenshot saved to: test-results/screenshots/Login should pass.png
 * // - Video saved to: test-results/videos/Login should pass-1765258796889/
 * // - Trace saved to: test-results/traces/Login should pass-1765258796889/Login should pass
 * // - Added to passedFeatures for later JSON writing
 * 
 * @example
 * // For failed scenario on final attempt:
 * // - Screenshot saved to: test-results/screenshots/Login should fail.png
 * // - Immediately written to: test-results/failed/Login-failed-scenarios.json
 * // - Contains: { name: "Login", path: "...", scenarios: [{ name: "...", failedStep: "When I click login", retries: 2 }] }
 * // - buildSignal.txt created if first final failure
 */
After(async function ({ pickle, result }) {
    const scenarioName = fixture.dataBag.getData(DataBagKeys.SCENARIO_NAME) as string;
     const pickleName = fixture.dataBag.getData(DataBagKeys.PICKLE_NAME) as string;
    const currentRetry = fixture.scenarioRetryCount[pickleName] || 1;
    const maxRetries = fixture.maxRetryCount;
    const isFinalAttempt = result?.status === Status.PASSED || currentRetry === maxRetries + 1;
    console.log(`isFinalAttempt: ${isFinalAttempt}, currentRetry: ${currentRetry}, maxRetries: ${maxRetries}, status: ${result?.status}`);
    try {
        //scenarioName = pickle.name + " - " + pickle.id
        await fixture.requestContext.dispose();
        let videoPath: string;
        let img: Buffer;
        let downloadPath: string;
        if (result?.status == Status.PASSED) {
            img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png" })
            // img = await fixture.page.screenshot({ path: `./test-results/screenshots/${scenarioName}/${pickle.name}.png`, type: "png" })
            // const video = fixture.page.video();
            // if (video) {
            //     videoPath = await video.path();
            // }
            videoPath = await fixture.page.video().path();
        }else if (result?.status == Status.FAILED) {
            img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png" })
            if(!fs.existsSync(buildSignalFilePath)) {
                const currentRetry = fixture.scenarioRetryCount[pickle.name];
                //fixture.logger.info(`currentRetry for ${pickle.name} is ${currentRetry}`);
                //fixture.logger.info(`maxRetryCount is ${fixture.maxRetryCount}`);
                if (currentRetry == fixture.maxRetryCount + 1) {
                    fs.createFileSync(buildSignalFilePath);
                    fs.writeFileSync(buildSignalFilePath, "failed");
                }
            }
        }

        const tracePath = `./test-results/traces/${scenarioName}/${pickle.name}`;
        await context.tracing.stop({path: tracePath});
        await fixture.page.close();
        fixture.pageFactory.clear();
        await context.close();
        const featurePath = pickle.uri;
        const featureName = getFeatureName(featurePath);
        const duration = result?.duration ? result.duration.nanos / 1_000_000 : 0;
        const scenarioResult: ScenarioResult = {
            name: scenarioName,
            duration: duration,
            retries: fixture.scenarioRetryCount[pickleName] - 1,
        };
        if (result?.status === Status.PASSED) {
            if (!passedFeatures[featurePath]) {
                passedFeatures[featurePath] = {
                    name: featureName,
                    path: featurePath,
                    scenarios: []
                };
            }
            passedFeatures[featurePath].scenarios.push(scenarioResult);
        } else if (result?.status === Status.FAILED && isFinalAttempt) {
            const failedStep = fixture.dataBag.getData(DataBagKeys.FAILED_STEP) as string;
            scenarioResult.failedStep = failedStep;

            // Write failed scenario immediately
            const featureResult: FeatureResult = {
                name: featureName,
                path: featurePath,
                scenarios: [scenarioResult]
            };

            writeFailedFeatureResult(featureResult);
        }
        fixture.dataBag = null;
        if (result?.status == Status.PASSED) {
            this.attach(
                img, "image/png"
            );
            this.attach(
                fs.readFileSync(videoPath),
                'video/webm'
            );
            fixture.logger.info(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
            console.log(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
        //     if (videoPath) {
        //         this.attach(fs.readFileSync(videoPath), 'video/webm');
        //     }
        //     fixture.logger.info(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
         }else{
            console.log(`Scenario - ${scenarioName} - completed WITH ERRORS`);
            fixture.logger.error(`Scenario - ${scenarioName} - completed WITH ERRORS`);
        }
        // fixture.dataBag = null;
    } catch (error) {
        console.log(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
        fixture.logger.error(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
    }
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, true);
});

/**
 * AfterAll Hook - Test Suite Cleanup and Final Reporting
 * 
 * WHAT: Runs once after all scenarios complete
 * WHY: Writes final passed scenario results and releases shared resources
 * WHERE: Invoked automatically by Cucumber at test suite end
 * WHEN: After all scenarios have executed
 * 
 * HOW IT WORKS:
 * 1. Writes passedFeatures dictionary to JSON file:
 *    - Path: test-results/passed-scenarios.json
 *    - Format: Array of FeatureResult objects with scenarios
 *    - Pretty-printed with 2-space indentation
 * 2. Nullifies global data bag (garbage collection)
 * 3. Closes TestDataProvider (releases database connections if used)
 * 4. Closes browser instance (releases browser process)
 * 
 * SCHOLAR EXPLANATION:
 * This is like the end of a school day. The teacher writes the final grade summary
 * for successful students (passed-scenarios.json), cleans the blackboard (nullify
 * globalDataBag), closes the resource library (testDataProvider), and turns off
 * the projector (browser). Everything is ready for tomorrow's tests.
 * 
 * NOTE: Failed scenarios are already written during After hook (immediate writing).
 * This hook only writes passed scenarios to avoid data loss if test suite crashes.
 * 
 * @example
 * // Generated passed-scenarios.json:
 * // [
 * //   {
 * //     "name": "Login",
 * //     "path": "src/tests/features/login.feature",
 * //     "scenarios": [
 * //       { "name": "Login should pass-1765258796889", "duration": 5432, "retries": 0 }
 * //     ]
 * //   }
 * // ]
 */
AfterAll(async function () {
    // Write passed scenarios
    fs.writeJsonSync(
        path.join(testResultsDir, 'passed-scenarios.json'),
        Object.values(passedFeatures),
        { spaces: 2 }
    );
    fixture.globalDataBag = null;
    fixture.testDataProvider.close();
    await browser.close();
});

/**
 * Get Feature Name
 * 
 * WHAT: Extracts feature file name without extension from file path
 * WHY: Creates clean feature names for JSON reports
 * WHERE: Called by After hook when generating scenario results
 * WHEN: After each scenario completes
 * 
 * HOW IT WORKS:
 * - Uses path.basename() to extract filename from full path
 * - Removes '.feature' extension
 * - Returns just the feature name
 * 
 * SCHOLAR EXPLANATION:
 * This is like extracting a book title from its full library address. Given
 * "shelf/row/section/Harry-Potter.book", it returns just "Harry-Potter".
 * 
 * @param {string} featurePath - Full path to feature file
 * @returns {string} Feature file name without extension
 * 
 * @example
 * getFeatureName("src/tests/features/login.feature")
 * // Returns: "login"
 * 
 * getFeatureName("C:/project/tests/features/user-registration.feature")
 * // Returns: "user-registration"
 */
function getFeatureName(featurePath: string): string {
    return path.basename(featurePath, '.feature');
}

/**
 * Write Failed Feature Result
 * 
 * WHAT: Writes or appends failed scenario result to feature-specific JSON file
 * WHY: Immediate failure reporting (doesn't wait for AfterAll) with merge support
 * WHERE: Called by After hook when scenario fails on final attempt
 * WHEN: After failed scenario completes (and isFinalAttempt is true)
 * 
 * HOW IT WORKS:
 * 1. Sanitizes feature name for safe filename (replaces special chars with '_')
 * 2. Constructs filename: [sanitized-feature-name]-failed-scenarios.json
 * 3. Constructs full path: test-results/failed/[filename]
 * 4. Checks if file already exists:
 *    - If exists: Reads existing FeatureResult
 *    - If not exists: Creates empty FeatureResult with empty scenarios array
 * 5. Merges new scenario(s) with existing scenarios
 * 6. Writes merged result to JSON file with 2-space indentation
 * 
 * SCHOLAR EXPLANATION:
 * This is like maintaining a class incident report book. Each feature (class) has
 * its own page. When a student (scenario) misbehaves (fails), you open the book
 * to that feature's page, add the new incident to existing incidents, and update
 * the page. If it's the first incident for that feature, you create a new page.
 * 
 * WHY IMMEDIATE WRITING:
 * Failed scenarios written immediately (not batched) because test runs might crash
 * or terminate unexpectedly. This ensures failure information is never lost.
 * 
 * @param {FeatureResult} featureResult - Feature result containing failed scenario(s)
 * 
 * @example
 * // First failure for "login" feature:
 * // Creates: test-results/failed/login-failed-scenarios.json
 * // {
 * //   "name": "Login",
 * //   "path": "src/tests/features/login.feature",
 * //   "scenarios": [
 * //     { "name": "Login should fail-1765258742353", "duration": 3210, "failedStep": "When I click login", "retries": 2 }
 * //   ]
 * // }
 * 
 * @example
 * // Second failure for same feature (merges):
 * // {
 * //   "name": "Login",
 * //   "path": "src/tests/features/login.feature",
 * //   "scenarios": [
 * //     { "name": "Login should fail-1765258742353", "duration": 3210, "failedStep": "When I click login", "retries": 2 },
 * //     { "name": "Login with invalid email-1765258808309", "duration": 2890, "failedStep": "Then I should see error", "retries": 0 }
 * //   ]
 * // }
 */
function writeFailedFeatureResult(featureResult: FeatureResult) {
    const sanitizedFeatureName = sanitizeFilename(featureResult.name);
    const fileName = `${sanitizedFeatureName}-failed-scenarios.json`;
    const filePath = path.join(failedScenariosDir, fileName);

    // Merge with existing results if file exists
    let existingData: FeatureResult = { name: '', path: '', scenarios: [] };
    if (fs.existsSync(filePath)) {
        existingData = fs.readJsonSync(filePath);
    }

    const mergedResult: FeatureResult = {
        name: featureResult.name,
        path: featureResult.path,
        scenarios: [...existingData.scenarios, ...featureResult.scenarios]
    };

    fs.writeJsonSync(filePath, mergedResult, { spaces: 2 });
}

/**
 * Sanitize Filename
 * 
 * WHAT: Converts unsafe feature names into filesystem-safe filenames
 * WHY: Prevents file system errors from special characters in feature names
 * WHERE: Called by writeFailedFeatureResult() when creating JSON file
 * WHEN: Before writing failed scenario results to disk
 * 
 * HOW IT WORKS:
 * 1. Replaces all non-alphanumeric characters (except hyphens and underscores) with '_'
 * 2. Truncates to 50 characters maximum (prevents path length issues)
 * 3. Converts to lowercase for consistency
 * 
 * SCHOLAR EXPLANATION:
 * This is like creating a safe label for a file folder. If the feature name has
 * special characters that the filing cabinet (file system) doesn't allow (/, \, ?, *),
 * you replace them with underscores. You also keep labels short so they fit on the tab.
 * 
 * EXAMPLES OF TRANSFORMATIONS:
 * - "User Login" → "user_login"
 * - "Login/Logout Flow" → "login_logout_flow"
 * - "Test @Special #Feature!" → "test__special__feature_"
 * - "Very-Long-Feature-Name-That-Exceeds-Fifty-Characters" → "very_long_feature_name_that_exceeds_fifty_charact"
 * 
 * @param {string} name - Original feature name (possibly with special chars)
 * @returns {string} Sanitized filename (safe for all file systems)
 * 
 * @example
 * sanitizeFilename("User Login & Registration")
 * // Returns: "user_login___registration"
 * 
 * sanitizeFilename("Feature: Test/Debug Mode")
 * // Returns: "feature__test_debug_mode"
 */
function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .substring(0, 50) // Limit filename length
        .toLowerCase();
}
