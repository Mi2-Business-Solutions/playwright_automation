/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-call: "off" */
/*eslint @typescript-eslint/no-unsafe-member-access: "off" */
/**
 * **WHAT:** JSON-specific test data provider with caching and JSONPath query support
 * 
 * **WHY:** Efficient test data retrieval from JSON files with intelligent caching and flexible querying
 * 
 * **WHERE USED:**
 * - TestDataProvider delegates JSON requests here
 * - Internally manages NodeCache for JSON file caching
 * - Executes JSONPath queries to extract specific data
 * 
 * **WHEN TO USE:**
 * - Fetching data from JSON test data files
 * - Need caching to avoid repeated file reads
 * - Require JSONPath expressions for data extraction
 * 
 * **HOW IT WORKS:**
 * 1. Check if JSON file is cached
 * 2. If not cached: read file, parse JSON, cache with TTL
 * 3. Execute JSONPath query on cached data
 * 4. Return typed result (single object or array)
 * 
 * **CACHING STRATEGY:**
 * - Standard TTL: For regular test data files
 * - Extended TTL: For frequently accessed files (login data, common data)
 * - Automatic cache invalidation after TTL expires
 * 
 * @example
 * // Used internally by TestDataProvider
 * const jsonProvider = new JsonTestDataProvider(120, 600, ["loginUser.json"]);
 * const request = new JsonTestDataRequest();
 * request.jsonFilePath = "./test-data-store/login/loginUser.json";
 * request.jsonDataNodePath = "users[0]";
 * const user = jsonProvider.getTestData<User>(request, true);
 */
import * as fs from 'fs';
const jp = require('jsonpath');
const NodeCache = require('node-cache');

import { TestDataType } from "./TestDataType";
import JsonTestDataRequest from "./jsonTestDataRequest";
import { fixture } from '../../../hooks/fixture';

/**
 * **JsonTestDataProvider Class**
 * 
 * **RESPONSIBILITY:** Manages JSON test data retrieval with caching and JSONPath querying
 * 
 * **KEY CAPABILITIES:**
 * - In-memory caching with configurable TTL
 * - JSONPath query execution
 * - Type-safe data retrieval
 * - Extended cache for frequently used files
 * - Error handling for missing/malformed files
 */
export default class JsonTestDataProvider {

    /**
     * **Constructor**
     * 
     * **WHAT:** Initializes JSON data provider with NodeCache and cache timeout configuration
     * 
     * **WHY:** Configures cache behavior to balance performance and data freshness
     * 
     * **HOW IT WORKS:**
     * - Creates NodeCache instance with default TTL
     * - Stores extended cache configuration for specific files
     * - Sets checkperiod for automatic cache cleanup (120 seconds)
     * 
     * @param {number} defaultCacheTimeoutInSec - Standard cache TTL for most files
     * @param {number} extendedCacheTimeoutInSec - Extended TTL for frequently used files
     * @param {string[]} extendedCacheFileNames - File paths eligible for extended cache
     * 
     * @example
     * // Typical usage
     * const provider = new JsonTestDataProvider(
     *   120,  // Standard files cached 120 seconds
     *   600,  // Frequent files cached 600 seconds
     *   ["./test-data-store/login/loginUser.json"]  // Login data gets extended cache
     * );
     */
    // stdTTL is the default time-to-live for each cache entry
    private jsonObjectCache: typeof NodeCache;
    constructor(defaultCacheTimeoutInSec: number, private extendedCacheTimeoutInSec: number, private extendedCacheFileNames: string[]){
        this.jsonObjectCache = new NodeCache({ stdTTL: defaultCacheTimeoutInSec, checkperiod: 120 });
    }
    /**
     * **Get Test Data**
     * 
     * **WHAT:** Retrieves typed test data from JSON file using JSONPath query with caching
     * 
     * **WHY:** Provides efficient, type-safe access to JSON test data without repeated file I/O
     * 
     * **HOW IT WORKS:**
     * 1. Check cache for JSON file (by file path)
     * 2. If not cached:
     *    a. Read file from disk
     *    b. Parse JSON
     *    c. Cache with appropriate TTL (standard or extended)
     * 3. If jsonDataNodePath empty: return entire JSON
     * 4. Else: execute JSONPath query ($.{jsonDataNodePath})
     * 5. Return first result as T or T[] based on returnSingleResult
     * 
     * **ERROR HANDLING:**
     * - Throws error if file doesn't exist
     * - Throws error if JSON is malformed
     * - Throws error if TestDataType.String without jsonDataNodePath
     * - Logs error details via fixture.logger
     * 
     * **TYPE SAFETY WARNING:**
     * - No runtime type validation
     * - Type conversion succeeds even if data doesn't match T
     * - Responsibility is on caller to ensure correct type
     * 
     * @param {JsonTestDataRequest} testDataRequest - Request with file path and JSONPath
     * @param {boolean} returnSingleResult - true: return T, false: return T[]
     * @returns {T | T[]} Retrieved test data
     * @throws {Error} If file missing, malformed, or invalid path for String type
     * 
     * @example
     * // Fetch single user object
     * const request = new JsonTestDataRequest();
     * request.jsonFilePath = "./test-data-store/login/loginUser.json";
     * request.jsonDataNodePath = "users[0]";
     * request.dataType = TestDataType.AppUser;
     * const user = provider.getTestData<User>(request, true);
     * // Returns: { email: "user@example.com", password: "pass123" }
     * 
     * @example
     * // Fetch array of products
     * request.jsonFilePath = "./test-data-store/products.json";
     * request.jsonDataNodePath = "products[?(@.inStock == true)]";
     * const products = provider.getTestData<Product>(request, false);
     * // Returns: [{ id: 1, name: "Product A", inStock: true }, ...]
     * 
     * @example
     * // Entire JSON file
     * request.jsonFilePath = "./test-data-store/common.json";
     * request.jsonDataNodePath = ""; // Empty path
     * const data = provider.getTestData<CommonData>(request, true);
     * // Returns entire JSON object
     */
    /**
     * Returns test data object as per the parameter testDataRequest
     * @param testDataRequest 
     * @param returnSingleResult 
     * @returns test data
     * @description this method throws error only if either the test data file does not exist or contains malformed data. However, it does not throw error
     * even if T does not correspond to the data available inside the test data file. 
     */
    public getTestData<T>(testDataRequest: JsonTestDataRequest, returnSingleResult: boolean): T | T[] {
        
        let jsonString: string;
        /* eslint @typescript-eslint/no-explicit-any: "off" */
        let data: any;
    
        try{
            // try to get the data from the cache
            data = this.jsonObjectCache.get(testDataRequest.jsonFilePath);
            if(data == undefined || data == null)
            {
                //fixture.logger.info(`${testDataRequest.jsonFilePath} is not cached yet`);
                jsonString = fs.readFileSync(testDataRequest.jsonFilePath, 'utf-8');
                data = JSON.parse(jsonString);

                //store the data in the cache
                if(this.extendedCacheFileNames.includes(testDataRequest.jsonFilePath))
                    this.jsonObjectCache.set(testDataRequest.jsonFilePath, data, this.extendedCacheTimeoutInSec);
                else
                    this.jsonObjectCache.set(testDataRequest.jsonFilePath, data);
                
                //fixture.logger.info(`${testDataRequest.jsonFilePath} is cached now`);
            }
            // else{
            //     fixture.logger.info(`${testDataRequest.jsonFilePath} is retrieved from cached`);
            // }
        }catch(error){
            fixture.logger.error(`failed to get JSON data from ${testDataRequest.jsonFilePath}. Either file does not exist or it contains malformed data. Error: `);
            throw error;
        }

        if(testDataRequest.dataType == TestDataType.String && testDataRequest.jsonDataNodePath.length == 0)
            throw new Error("invalid json path for TestDataType.String type");

        if (testDataRequest.jsonDataNodePath.length == 0)
                return data as T; // Return entire data from the JSON file

        const records = jp.query(data, `$.${testDataRequest.jsonDataNodePath}`);
        if (returnSingleResult)
            return records[0] as T; //warning: no type conversion safety. Even if the JSON contains some data other than T, this conversion succeeds 
        else
            return records[0] as T[]; //warning: no type conversion safety. Even if the JSON contains some data other than T[], this conversion succeeds
    }

    /**
     * **Get Test Primitive Data**
     * 
     * **WHAT:** Retrieves primitive string data from JSON using getTestData with String type
     * 
     * **WHY:** Type-specific method for fetching string values from JSON
     * 
     * **HOW IT WORKS:**
     * - Validates dataType is TestDataType.String
     * - Delegates to getTestData<string>
     * 
     * @param {JsonTestDataRequest} testDataRequest - Request with String dataType
     * @param {boolean} returnSingleResult - true: return string, false: return string[]
     * @returns {string | string[]} Retrieved string data
     * 
     * @example
     * const request = new JsonTestDataRequest();
     * request.dataType = TestDataType.String;
     * request.jsonFilePath = "./test-data-store/config.json";
     * request.jsonDataNodePath = "baseUrl";
     * const url = provider.getTestPrimitiveData(request, true);
     * // Returns: "https://example.com"
     */
    public getTestPrimitiveData(testDataRequest: JsonTestDataRequest, returnSingleResult: boolean) {
        if(testDataRequest.dataType == TestDataType.String)
            return this.getTestData<string>(testDataRequest, returnSingleResult); 
    }

    /**
     * **Close**
     * 
     * **WHAT:** Flushes and closes JSON object cache, releasing memory
     * 
     * **WHY:** Ensures clean shutdown and memory cleanup
     * 
     * **WHEN TO USE:**
     * - After all tests complete
     * - In test suite teardown
     * - Before process exit
     * 
     * **HOW IT WORKS:**
     * - Clears all cached JSON data
     * - Closes NodeCache instance
     * 
     * @example
     * // In test hooks
     * After(() => {
     *   jsonProvider.close();
     * });
     */
    public close(){
        if(this.jsonObjectCache != null)
        {
            this.jsonObjectCache.flushAll();
            this.jsonObjectCache.close();
        }
    }
}