import TestDataRequest from "./testDataRequest";

/**
 * **WHAT:** Extended TestDataRequest for JSON file data retrieval with parsed file path and JSONPath properties
 * 
 * **WHY:** Separates parsed JSON-specific properties from base request for cleaner data provider logic
 * 
 * **WHERE USED:**
 * - TestDataProvider when dataStoreType is 'json'
 * - JsonTestDataProvider to fetch data from JSON files
 * - Internally by TestDataProvider.getTestDataFromDataStore()
 * 
 * **WHEN TO USE:**
 * - Automatically created by TestDataProvider
 * - Don't create directly in tests (use TestDataRequest instead)
 * 
 * **HOW IT WORKS:**
 * 1. TestDataProvider parses dataPath from TestDataRequest
 * 2. Creates JsonTestDataRequest and populates properties:
 *    - jsonFilePath: Resolved absolute path from environment key
 *    - jsonDataNodePath: JSONPath expression for data location
 * 3. Passes to JsonTestDataProvider for data retrieval
 * 
 * @example
 * // Test code (uses TestDataRequest)
 * const request = new TestDataRequest();
 * request.dataPath = "json://LOGIN_USER_DATA#users[0]";
 * 
 * // TestDataProvider internally creates:
 * const jsonRequest = new JsonTestDataRequest();
 * jsonRequest.jsonFilePath = "./test-data-store/login/loginUser.json"; // From env
 * jsonRequest.jsonDataNodePath = "users[0]"; // Parsed from dataPath
 * // Then calls JsonTestDataProvider.getTestData(jsonRequest)
 */
export default class JsonTestDataRequest extends TestDataRequest{
    jsonFilePath: string;
    jsonDataNodePath: string;
}