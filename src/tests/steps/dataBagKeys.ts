/**
 * **WHAT:** Constant key definitions for DataBag storage to prevent typos and ensure consistency
 * 
 * **WHY:** Type-safe keys for storing/retrieving data between test steps and hooks
 * 
 * **WHERE USED:**
 * - Test step definitions storing data in DataBag
 * - Hooks accessing scenario-specific data
 * - Test steps sharing data across multiple steps
 * 
 * **WHEN TO USE:**
 * - Store data that needs to be accessed in later steps
 * - Share data between Given/When/Then steps
 * - Track scenario execution state
 * - Store authentication tokens
 * - Track failed steps for reporting
 * 
 * **HOW IT WORKS:**
 * - Define constant keys as static readonly strings
 * - Use keys with fixture.dataBag.saveData() and getData()
 * - Prevents misspelling key names
 * 
 * **KEY CATEGORIES:**
 * - Scenario tracking: SCENARIO_NAME, FAILED_STEP, ERROR
 * - Authentication: OAUTH_TOKEN, AUTH_HEADERS
 * - Screen info: SCREEN_WIDTH, SCREEN_HEIGHT
 * - Test artifacts: LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME
 * - Data requirements: DATA_REQ_COMMON
 * 
 * @example
 * // In step definition - Store failed step
 * import DataBagKeys from './dataBagKeys';
 * fixture.dataBag.saveData(DataBagKeys.FAILED_STEP, 'Login button click failed');
 * 
 * @example
 * // Retrieve stored data
 * const failedStep = fixture.dataBag.getData(DataBagKeys.FAILED_STEP);
 * fixture.logger.error(`Previous failure: ${failedStep}`);
 * 
 * @example
 * // Store auth token
 * fixture.dataBag.saveData(DataBagKeys.OAUTH_TOKEN, authResponse.token);
 * // Later step retrieves it
 * const token = fixture.dataBag.getData(DataBagKeys.OAUTH_TOKEN);
 */
export default abstract class DataBagKeys{
    static readonly FAILED_STEP = "failedStep";
    static readonly ERROR = "error";
    static readonly USER_AUTH_INFO_FILE_PATH = "userAuthInfoFilePath";
    static readonly SCREEN_WIDTH = "availWidth";
    static readonly SCREEN_HEIGHT = "availHeight";
    static readonly OAUTH_TOKEN = "oauthToken";
    static readonly QUERY_PARAMETERS = "queryParams";
    static readonly AUTH_HEADERS = "authHeaders";
    static readonly ADDITIONAL_HEADERS = "additionalHeaders";
    static readonly REQUEST_BODY = "requestBody";
    static readonly SCENARIO_NAME = "scenarioName";
    static readonly LAST_SCENARIO_EXECUTION_COMPLETED = "lastScenarioexecutionCompleted";
    static readonly LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME = "lastScenarioArtifactsDirectoryName";
    static readonly LAST_SCENARIO_RETRY_INDICATOR_KEY = "lastScenarioRetryIndicatorKey";
    static readonly PICKLE_NAME = "pickleName";
    static readonly OPERATION_COMPLETION_MESSAGE = "operationCompletionMsg";
    static readonly DATA_REQ_COMMON = "dataReqCommon";
}