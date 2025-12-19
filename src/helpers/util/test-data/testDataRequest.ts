import { TestDataType } from "./TestDataType";

/**
 * **WHAT:** Base class for test data retrieval requests with flexible data path specification
 * 
 * **WHY:** Unified interface for requesting test data from multiple sources (local values, JSON files, databases)
 * 
 * **WHERE USED:**
 * - Test step definitions requesting test data
 * - TestDataProvider to process data requests
 * - Extended by JsonTestDataRequest for JSON-specific requests
 * 
 * **WHEN TO USE:**
 * - Need to fetch test data from configured sources
 * - Want flexible data paths (local values or JSON files)
 * - Avoid hardcoding test data in step definitions
 * 
 * **DATA PATH FORMAT:**
 * 
 * Format: `dataStoreType://dataStore#dataLocation`
 * 
 * **Local Data (inline values):**
 * - `local://.#user@company.com` - Full format
 * - `user@company.com` - Shorthand (no protocol needed)
 * 
 * **JSON Data:**
 * - `json://GROWER_ORDER_DATA#orders[0].id` - Specific field
 * - `json://GROWER_ORDER_DATA` - Entire JSON object
 * 
 * **Components:**
 * - dataStoreType: `local` or `json`
 * - dataStore: `.` for local, environment key for JSON file path
 * - dataLocation: Direct value (local) or JSONPath expression (json)
 * 
 * @example
 * // Local inline value
 * const request = new TestDataRequest();
 * request.dataType = TestDataType.String;
 * request.dataPath = "user@example.com"; // Returns directly
 * 
 * @example
 * // JSON file data
 * const request = new TestDataRequest();
 * request.dataType = TestDataType.AppUser;
 * request.dataPath = "json://LOGIN_USER_DATA#users[0]"; // Fetches from JSON
 * // Environment: LOGIN_USER_DATA = "./test-data-store/login/loginUser.json"
 * 
 * @example
 * // Entire JSON object
 * request.dataPath = "json://PRODUCT_DATA"; // Returns full JSON
 */
/**Base class for Test Data Request */
export default class TestDataRequest {
    dataType: TestDataType;

    /** dataStore can be a file in the case of JSON data, table name in the case of SQL data, etc., */
    //dataStore: string;

    /** dataPath will be exact location where data is available in the store */
    /** dataPath contains location of data in the following format
     * dataStoreType://dataStore#dataLocation where
     * dataStoreType can be any supported protocol (for now local or json)
     * dataStore should be '.' for local, file-path-identifier for JSON file. Note: file-path-identifier must be a Key in the environment file
     * dataLocation should be the exact path; for 'local', it will be the direct value
     * Note 1: for local, both dataStoreType and dataStore can be ignored. For example, for a login user email, below are considered equal
     *      local://.#user@company.com
     *      user@company.com
     * However, these are NOT a valid formats: .#user@company.com, local://#user@company.com, local://user@company.com, local://., local://.#
     * 
     * Note 2: to retrieve entire data, value after '#' can be omitted. For example,
     * json://GROWER_ORDER_DATA will retrieve an entire JSON object available in the file pointed by GROWER_ORDER_DATA
     */
    dataPath: string;
}