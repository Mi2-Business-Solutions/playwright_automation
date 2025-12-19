/**
 * **WHAT:** Helper class providing simplified test data retrieval methods for step definitions
 * 
 * **WHY:** Reduces boilerplate code in test steps when fetching test data from various sources
 * 
 * **WHERE USED:**
 * - Step definition files (loginSteps.ts, orderSteps.ts, etc.)
 * - Test steps needing data from JSON files or inline values
 * - BDD Gherkin steps requiring parameterized data
 * 
 * **WHEN TO USE:**
 * - Fetch single test data record (user, order, product)
 * - Retrieve multiple records (list of users, products)
 * - Get string values from JSON (URLs, error messages)
 * - Extract data store name from data path
 * 
 * **HOW IT WORKS:**
 * - Wraps TestDataProvider with simpler static methods
 * - Creates TestDataRequest internally
 * - Returns typed data directly
 * - Uses fixture.testDataProvider singleton
 * 
 * @example
 * // In step definition - Get single user object
 * import StepDataHelper from './stepDataHelper';
 * const user = StepDataHelper.getSingleTestDataRecordForType(
 *   TestDataType.AppUser,
 *   'json://LOGIN_USER_DATA#users[0]'
 * );
 * await loginPage.enterUserName(user.email);
 * 
 * @example
 * // Get string value
 * const errorMsg = StepDataHelper.getSingleStringNodeData(
 *   'json://COMMON_DATA#errorMessages.invalidLogin'
 * );
 * expect(actualError).toContain(errorMsg);
 * 
 * @example
 * // Get multiple records
 * const products = StepDataHelper.getMultipleTestDataRecordsForType(
 *   TestDataType.ProductData,
 *   'json://PRODUCT_DATA#products[?(@.inStock == true)]'
 * );
 * // Returns: [Product, Product, Product]
 */
import { TestDataType } from "../../helpers/util/test-data/TestDataType";
import TestDataRequest from "../../helpers/util/test-data/testDataRequest";
import { fixture } from "../../hooks/fixture";

/**
 * **StepDataHelper Class**
 * 
 * **RESPONSIBILITY:** Simplifies test data retrieval for step definitions with static helper methods
 * 
 * **KEY CAPABILITIES:**
 * - Single/multiple record retrieval
 * - String data extraction
 * - Data store name parsing
 * - Type-safe data fetching
 * - Automatic TestDataRequest creation
 */
export default class StepDataHelper {
    
    /**
     * **Get Data Store Name**
     * 
     * **WHAT:** Extracts data store identifier from data path
     * 
     * **WHY:** Useful for logging, debugging, or conditional logic based on data source
     * 
     * **HOW IT WORKS:**
     * - Parses dataPath using TestDataProvider.parseDataPath()
     * - Returns second element (data store name)
     * 
     * @param {string} dataPath - Data path (format: dataStoreType://dataStore#location)
     * @returns {string} Data store name (environment key for JSON, '.' for local)
     * 
     * @example
     * const storeName = StepDataHelper.getDataStoreName('json://LOGIN_USER_DATA#users[0]');
     * // Returns: "LOGIN_USER_DATA"
     * 
     * @example
     * const storeName = StepDataHelper.getDataStoreName('user@example.com');
     * // Returns: "." (local data)
     */
    static getDataStoreName(dataPath: string){
        const parsedDataRefs = fixture.testDataProvider.parseDataPath(dataPath);
        return parsedDataRefs[1];
    }
    /**
     * **Get Single Test Data Record For Type**
     * 
     * **WHAT:** Retrieves single test data record of specified type
     * 
     * **WHY:** Most common use case - fetch one user, one order, one product
     * 
     * **HOW IT WORKS:**
     * - Creates TestDataRequest with specified type and path
     * - Calls TestDataProvider with returnSingleResult=true
     * - Returns first matching record
     * 
     * @param {TestDataType} type - Data type (AppUser, ProductData, CommonData)
     * @param {string} dataPath - Data path to record
     * @returns {any} Single test data record of specified type
     * 
     * @example
     * // Fetch login user
     * const user = StepDataHelper.getSingleTestDataRecordForType(
     *   TestDataType.AppUser,
     *   'json://LOGIN_USER_DATA#users[0]'
     * );
     * // Returns: { email: "user@example.com", password: "pass123" }
     */
    static getSingleTestDataRecordForType(type: TestDataType, dataPath: string) {
        return this.getTestDataRecordForType(type, dataPath, true);
    }

    /**
     * **Get Multiple Test Data Records For Type**
     * 
     * **WHAT:** Retrieves array of test data records of specified type
     * 
     * **WHY:** Data-driven testing - iterate over multiple users, products, orders
     * 
     * **HOW IT WORKS:**
     * - Creates TestDataRequest with specified type and path
     * - Calls TestDataProvider with returnSingleResult=false
     * - Returns array of matching records
     * 
     * @param {TestDataType} type - Data type (AppUser, ProductData, CommonData)
     * @param {string} dataPath - Data path to records (JSONPath can return multiple)
     * @returns {any[]} Array of test data records
     * 
     * @example
     * // Fetch all active users
     * const users = StepDataHelper.getMultipleTestDataRecordsForType(
     *   TestDataType.AppUser,
     *   'json://LOGIN_USER_DATA#users[?(@.active == true)]'
     * );
     * // Returns: [{ email: "user1@...", ... }, { email: "user2@...", ... }]
     * 
     * @example
     * // Use in data-driven test
     * const products = StepDataHelper.getMultipleTestDataRecordsForType(
     *   TestDataType.ProductData,
     *   'json://PRODUCT_DATA#products'
     * );
     * products.forEach(product => {
     *   // Test each product
     * });
     */
    static getMultipleTestDataRecordsForType(type: TestDataType, dataPath: string) {
        return this.getTestDataRecordForType(type, dataPath, false);
    }

    private static getTestDataRecordForType(type: TestDataType, dataPath: string, returnSingleResult: boolean) {
        const dataRequest = new TestDataRequest();
        dataRequest.dataType = type;
        dataRequest.dataPath = dataPath;

        return fixture.testDataProvider.getTestDataFromDataStore(dataRequest, returnSingleResult);
    }
    /**
     * **Get Single String Node Data**
     * 
     * **WHAT:** Retrieves single string value from test data
     * 
     * **WHY:** Common need for URLs, error messages, labels, validation text
     * 
     * **HOW IT WORKS:**
     * - Creates TestDataRequest with TestDataType.String
     * - Returns single string value
     * 
     * @param {string} dataPath - Data path to string value
     * @returns {string} Single string value
     * 
     * @example
     * // Get base URL
     * const baseUrl = StepDataHelper.getSingleStringNodeData(
     *   'json://COMMON_DATA#baseUrl'
     * );
     * // Returns: "https://example.com"
     * 
     * @example
     * // Get error message
     * const expectedError = StepDataHelper.getSingleStringNodeData(
     *   'json://COMMON_DATA#errors.invalidCredentials'
     * );
     * expect(actualError).toBe(expectedError);
     */
    static getSingleStringNodeData(dataPath: string): string{
        return StepDataHelper.getStringData(dataPath, true) as string;
    }

    /**
     * **Get String Node List Data**
     * 
     * **WHAT:** Retrieves array of string values from test data
     * 
     * **WHY:** Lists of options, multiple error messages, validation rules
     * 
     * **HOW IT WORKS:**
     * - Creates TestDataRequest with TestDataType.String
     * - Returns array of string values
     * 
     * @param {string} dataPath - Data path to string array
     * @returns {string[]} Array of strings
     * 
     * @example
     * // Get list of valid statuses
     * const statuses = StepDataHelper.getStringNodeListData(
     *   'json://COMMON_DATA#validStatuses'
     * );
     * // Returns: ["Active", "Pending", "Completed"]
     * 
     * @example
     * // Verify dropdown options
     * const expectedOptions = StepDataHelper.getStringNodeListData(
     *   'json://COMMON_DATA#dropdownOptions.userTypes'
     * );
     * const actualOptions = await page.getDropdownOptions();
     * expect(actualOptions).toEqual(expectedOptions);
     */
    static getStringNodeListData(dataPath: string): string[]{
        return StepDataHelper.getStringData(dataPath, false) as string[];
    }

    private static getStringData(dataPath: string, returnSingleResult: boolean): string | string[]{
        //const testDataProvider = pf.getTestDataProvider();
        const dataRequest = new TestDataRequest();
    
        dataRequest.dataType = TestDataType.String;
        dataRequest.dataPath = dataPath;
    
        const result = fixture.testDataProvider.getTestDataFromDataStore<TestDataType.String>(dataRequest, returnSingleResult);

        if(returnSingleResult)
            return result as string;
        else
            return result as string[];
    }
}