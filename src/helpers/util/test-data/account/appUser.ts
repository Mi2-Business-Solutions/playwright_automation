/**
 * **WHAT:** Data model representing application user credentials and information
 * 
 * **WHY:** Type-safe structure for user data from JSON files or test data sources
 * 
 * **WHERE USED:**
 * - Login step definitions
 * - Test data JSON files (loginUser.json)
 * - StepDataHelper.getSingleTestDataRecordForType(TestDataType.AppUser, ...)
 * 
 * **WHEN TO USE:**
 * - Fetch user credentials from test data
 * - Pass user info to login methods
 * - Store user information in DataBag
 * 
 * **PROPERTIES:**
 * - userName: User's login username/email
 * - password: User's password
 * - fullUserName: User's full display name
 * 
 * @example
 * // In test data JSON (loginUser.json)
 * {
 *   "users": [
 *     {
 *       "userName": "user@example.com",
 *       "password": "password123",
 *       "fullUserName": "John Doe"
 *     }
 *   ]
 * }
 * 
 * @example
 * // In step definition
 * import AppUser from '../../helpers/util/test-data/account/appUser';
 * const user = StepDataHelper.getSingleTestDataRecordForType(
 *   TestDataType.AppUser,
 *   'json://LOGIN_USER_DATA#users[0]'
 * ) as AppUser;
 * await loginPage.enterUserName(user.userName);
 * await loginPage.enterPassword(user.password);
 */
export default class AppUser{
    userName: string;
    password: string;
    fullUserName: string;
}