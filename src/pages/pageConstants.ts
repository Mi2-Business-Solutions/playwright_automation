/**
 * **WHAT:** Constant definitions for page-related error messages and shared values
 * 
 * **WHY:** Centralized constants for consistent error handling across page objects
 * 
 * **WHERE USED:**
 * - Page objects checking error types
 * - SharedPageBehavior for timeout detection
 * - BasePage error handling
 * 
 * **WHEN TO USE:**
 * - Check if error is timeout-related
 * - Need consistent error message strings
 * 
 * @example
 * // In page object
 * try {
 *   await this.pwWrapper.pageElement.getVisibleElementById(id, timeout);
 * } catch (err) {
 *   if (err.name === PageConstants.TIMEOUT_ERROR) {
 *     // Handle timeout specifically
 *   }
 * }
 */
export default abstract class PageConstants{
    static TIMEOUT_ERROR: string = 'TimeoutError';
}