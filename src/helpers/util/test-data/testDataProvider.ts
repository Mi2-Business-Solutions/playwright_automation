/**
 * **WHAT:** Central test data provider that routes data requests to appropriate handlers (local, JSON, SQL)
 * 
 * **WHY:** Single interface for fetching test data from multiple sources with caching support
 * 
 * **WHERE USED:**
 * - Test step definitions to fetch test data
 * - Page objects requiring test data
 * - Test setup/teardown for data provisioning
 * 
 * **WHEN TO USE:**
 * - Need test data from JSON files
 * - Want inline test data values
 * - Require data caching for performance
 * - Avoid hardcoding test data
 * 
 * **HOW IT WORKS:**
 * 1. Parse dataPath to identify source (local vs json)
 * 2. Route to appropriate handler
 * 3. Return typed data object or primitive
 * 
 * **CACHING:**
 * - Default cache: 120 seconds (configurable via DEFAULT_CACHE_TIMEOUT_IN_SEC)
 * - Extended cache: 600 seconds for frequently used files (EXTENDED_CACHE_TIMEOUT_IN_SEC)
 * - Extended cache files specified in EXTEND_CACHE environment variable
 * 
 * @example
 * // In test step
 * import TestDataProvider from './testDataProvider';
 * const provider = new TestDataProvider();
 * 
 * // Fetch user from JSON
 * const request = new TestDataRequest();
 * request.dataType = TestDataType.AppUser;
 * request.dataPath = "json://LOGIN_USER_DATA#users[0]";
 * const user = provider.getTestDataFromDataStore<User>(request, true);
 * 
 * @example
 * // Inline value
 * request.dataPath = "user@example.com";
 * const email = provider.getTestDataFromDataStore<string>(request, true); // "user@example.com"
 */
import { TestDataType } from './TestDataType';
import JsonTestDataRequest from './jsonTestDataRequest';
import JsonTestDataProvider from './testDataProvider.json';
import TestDataRequest from './testDataRequest';

/**
 * **TestDataProvider Class**
 * 
 * **RESPONSIBILITY:** Orchestrates test data retrieval from multiple sources with caching
 * 
 * **KEY CAPABILITIES:**
 * - Parse flexible data path formats
 * - Route requests to source-specific handlers
 * - Manage JSON data caching
 * - Resolve environment-based file paths
 */
export default class TestDataProvider {

    private readonly dataStoreType_local = "local";
    private readonly dataStoreType_json = "json";
    private jsonDataProvider: JsonTestDataProvider;

    /**
     * **Constructor**
     * 
     * **WHAT:** Initializes TestDataProvider with cache configuration from environment
     * 
     * **HOW IT WORKS:**
     * 1. Reads EXTEND_CACHE environment variable (comma-separated keys)
     * 2. Resolves file paths from each key
     * 3. Builds list of files for extended cache timeout
     * 4. Parses cache timeout values (defaults: 120s standard, 600s extended)
     * 5. Creates JsonTestDataProvider with cache configuration
     * 
     * **ENVIRONMENT VARIABLES:**
     * - EXTEND_CACHE: Comma-separated list of file path keys
     * - DEFAULT_CACHE_TIMEOUT_IN_SEC: Standard cache TTL (default 120)
     * - EXTENDED_CACHE_TIMEOUT_IN_SEC: Extended cache TTL (default 600)
     * 
     * @example
     * // .env file
     * EXTEND_CACHE=LOGIN_USER_DATA,COMMON_DATA
     * DEFAULT_CACHE_TIMEOUT_IN_SEC=120
     * EXTENDED_CACHE_TIMEOUT_IN_SEC=600
     * LOGIN_USER_DATA=./test-data-store/login/loginUser.json
     * 
     * // Result: LOGIN_USER_DATA cached for 600s, others for 120s
     */
    constructor(){
        const extendedJsonCacheFileNameKeys = process.env.EXTEND_CACHE.split(",");
        const extendedJsonCacheFileNames: string[] = [];
        extendedJsonCacheFileNameKeys.forEach(key => {
            const fileName = process.env[key];
            if(!extendedJsonCacheFileNames.includes(fileName))
                extendedJsonCacheFileNames.push(fileName);
        });
        const DEFAULT_CACHE_TIMEOUT_IN_SEC = parseInt(process.env.DEFAULT_CACHE_TIMEOUT_IN_SEC.replaceAll(",","") || '');
        const DEFAULT_CACHE_TIMEOUT_IN_SEC_Number = Number.isInteger(DEFAULT_CACHE_TIMEOUT_IN_SEC) ? DEFAULT_CACHE_TIMEOUT_IN_SEC : 120;

        const EXTENDED_CACHE_TIMEOUT_IN_SEC = parseInt(process.env.EXTENDED_CACHE_TIMEOUT_IN_SEC.replaceAll(",","") || '');
        const EXTENDED_CACHE_TIMEOUT_IN_SEC_Number = Number.isInteger(EXTENDED_CACHE_TIMEOUT_IN_SEC) ? EXTENDED_CACHE_TIMEOUT_IN_SEC : 600;
        
        this.jsonDataProvider = new JsonTestDataProvider(
            DEFAULT_CACHE_TIMEOUT_IN_SEC_Number, EXTENDED_CACHE_TIMEOUT_IN_SEC_Number, extendedJsonCacheFileNames
        );
    }
    /**
     * **Get Test Data From Data Store**
     * 
     * **WHAT:** Main method to retrieve test data from configured source (local or JSON)
     * 
     * **WHY:** Single entry point for all test data retrieval with type safety
     * 
     * **HOW IT WORKS:**
     * 1. Parse dataPath to extract dataStoreType, dataStore, location
     * 2. Route to handler based on dataStoreType:
     *    - local: Return dataPath value directly
     *    - json: Delegate to JsonTestDataProvider
     * 3. Return typed data (single object or array)
     * 
     * @param {TestDataRequest} testDataRequest - Request with dataType and dataPath
     * @param {boolean} returnSingleResult - true: return T, false: return T[]
     * @returns {T | T[]} Retrieved test data
     * @throws {Error} If dataStoreType is invalid
     * 
     * @example
     * // Fetch single user object
     * const request = new TestDataRequest();
     * request.dataType = TestDataType.AppUser;
     * request.dataPath = "json://LOGIN_USER_DATA#users[0]";
     * const user = provider.getTestDataFromDataStore<User>(request, true);
     * // Returns: { email: "user@example.com", password: "pass123" }
     * 
     * @example
     * // Fetch array of products
     * request.dataType = TestDataType.ProductData;
     * request.dataPath = "json://PRODUCT_DATA#products";
     * const products = provider.getTestDataFromDataStore<Product>(request, false);
     * // Returns: [{ id: 1, name: "Product A" }, { id: 2, name: "Product B" }]
     * 
     * @example
     * // Local inline value
     * request.dataType = TestDataType.String;
     * request.dataPath = "admin@company.com";
     * const email = provider.getTestDataFromDataStore<string>(request, true);
     * // Returns: "admin@company.com"
     */
    public getTestDataFromDataStore<T>(testDataRequest: TestDataRequest, returnSingleResult: boolean) {
        const parsedDataRefs = this.parseDataPath(testDataRequest.dataPath);

        const dataStoreType = parsedDataRefs[0];

        switch(dataStoreType){
            case this.dataStoreType_local:{
                //local data store means required data is mentioned in the feature file itself
                //hence return dataPath as the needed data
                return parsedDataRefs[2];
            }
            case this.dataStoreType_json:
                {
                    const jsonDataRequest = testDataRequest as JsonTestDataRequest;
                    jsonDataRequest.jsonFilePath = this.getTestDataFromKeyStore(parsedDataRefs[1]);
                    jsonDataRequest.jsonDataNodePath = parsedDataRefs[2];

                    if(jsonDataRequest.dataType == TestDataType.String)
                        return this.jsonDataProvider.getTestPrimitiveData(jsonDataRequest, returnSingleResult);
                    else
                        return this.jsonDataProvider.getTestData<T>(jsonDataRequest, returnSingleResult);
                }
            default:
                throw new Error("invalid data store type - " + dataStoreType);
        }
    }

    /**
     * **Parse Data Path**
     * 
     * **WHAT:** Parses flexible dataPath format into components (storeType, store, location)
     * 
     * **WHY:** Supports multiple data path formats while maintaining consistent parsing logic
     * 
     * **HOW IT WORKS:**
     * 1. Split by "://" to extract dataStoreType
     * 2. If no "://" found, treat as local with direct value
     * 3. Split remainder by "#" to separate dataStore and location
     * 4. Validate format and component presence
     * 5. Return tuple: [dataStoreType, dataStore, location]
     * 
     * **SUPPORTED FORMATS:**
     * - `local://.#value` - Full local format
     * - `value` - Shorthand local (no protocol)
     * - `json://FILE_KEY#jsonPath` - JSON with location
     * - `json://FILE_KEY` - Entire JSON file
     * 
     * @param {string} dataPath - Data path string to parse
     * @returns {[string, string, string]} Tuple [dataStoreType, dataStore, location]
     * @throws {Error} If dataStoreType is invalid
     * @throws {Error} If format is malformed (missing data after :// or #)
     * 
     * @example
     * // Local shorthand
     * const parsed = provider.parseDataPath("user@example.com");
     * // Returns: ["local", ".", "user@example.com"]
     * 
     * @example
     * // JSON with JSONPath
     * const parsed = provider.parseDataPath("json://LOGIN_USER_DATA#users[0].email");
     * // Returns: ["json", "LOGIN_USER_DATA", "users[0].email"]
     * 
     * @example
     * // Entire JSON file
     * const parsed = provider.parseDataPath("json://PRODUCT_DATA");
     * // Returns: ["json", "PRODUCT_DATA", ""]
     */
    /**
     * 
     * @param dataPath 
     * @returns [string, string, string] where first item is dataStoreType, second item is dataStore and third item is data field location
     */
    public parseDataPath(dataPath: string):[string, string, string]{
        let dataStoreType = "";
        let dataStore = "";
        let location = "";

        const firstSplit = "://";
        const secondSplit = "#";

        const val1: string[] = dataPath.split(firstSplit);
        if(val1.length == 1){
            //if we are here means, dataPath does not contain dataStoreType hence treat it as local
            dataStoreType = this.dataStoreType_local;
            dataStore = ".";
            location = val1[0];
        }else{
            if(val1[0].toLowerCase() != this.dataStoreType_local && val1[0].toLowerCase() != this.dataStoreType_json)
                throw new Error("invalid data store type specified in parseDataPath method- " + val1[0]);

            dataStoreType = val1[0];

            if(val1[1].length == 0)
                throw new Error("invalid data format - missing data after " + firstSplit);

            const val2: string[] = val1[1].split(secondSplit);

            if(val2.length == 1){
                //if we are here means, dataPath does not contain dataLocation hence retrieve entire data from dataStore
                dataStore = val2[0];
                location = "";
            }else{
                if(val2[1].length == 0)
                    throw new Error("invalid data format - missing data after " + secondSplit);
                
                dataStore = val2[0];
                location = val2[1];
            }
        }

        return [dataStoreType, dataStore, location];
    }
    /**
     * **Get Test Data From Key Store**
     * 
     * **WHAT:** Resolves environment variable key to its value (typically file path)
     * 
     * **WHY:** Centralizes environment variable resolution for test data file paths
     * 
     * **HOW IT WORKS:**
     * - Retrieves value from process.env using provided key
     * - Used to resolve JSON file paths from environment configuration
     * 
     * @param {string} key - Environment variable key
     * @returns {string} Environment variable value
     * 
     * @example
     * // .env: LOGIN_USER_DATA=./test-data-store/login/loginUser.json
     * const filePath = provider.getTestDataFromKeyStore("LOGIN_USER_DATA");
     * // Returns: "./test-data-store/login/loginUser.json"
     */
    public getTestDataFromKeyStore(key:string) : string{
        //keystore is environment
        return process.env[key];
    }

    /**
     * **Close**
     * 
     * **WHAT:** Cleanup method to flush and close JSON data provider cache
     * 
     * **WHY:** Releases memory and ensures clean shutdown
     * 
     * **WHEN TO USE:**
     * - After test execution completes
     * - Before test process exits
     * - In test teardown/cleanup hooks
     * 
     * @example
     * // In test hooks
     * After(() => {
     *   testDataProvider.close();
     * });
     */
    public close(){
        if(this.jsonDataProvider != null)
            this.jsonDataProvider.close();
    }
}