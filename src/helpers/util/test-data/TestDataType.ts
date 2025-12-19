/**
 * **WHAT:** Enum defining supported test data types for data retrieval system
 * 
 * **WHY:** Type-safe identification of data types when fetching test data from various sources
 * 
 * **WHERE USED:**
 * - TestDataRequest.dataType property
 * - TestDataProvider routing logic
 * - Test step definitions specifying expected data type
 * 
 * **WHEN TO USE:**
 * - Specify data type in TestDataRequest
 * - Route data retrieval to appropriate handler
 * - Validate retrieved data format
 * 
 * **DATA TYPES:**
 * - String: Primitive string values from JSON
 * - AppUser: User objects (login credentials, profiles)
 * - CommonData: Shared data across tests
 * - ProductData: Product-specific test data
 * 
 * @example
 * // In test step
 * const request = new TestDataRequest();
 * request.dataType = TestDataType.AppUser; // Fetch user object
 * const user = testDataProvider.getTestDataFromDataStore<User>(request, true);
 * 
 * @example
 * // String data type
 * request.dataType = TestDataType.String;
 * const email = testDataProvider.getTestDataFromDataStore<string>(request, true);
 */
export enum TestDataType {
    String,
    AppUser,
    CommonData,
    ProductData,
}