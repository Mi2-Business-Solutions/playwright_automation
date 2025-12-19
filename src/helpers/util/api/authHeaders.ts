/**
 * **WHAT:** Data model for API authentication headers
 * 
 * **WHY:** Type-safe structure for storing and passing auth tokens to API requests
 * 
 * **WHERE USED:**
 * - ApiExecutor for HTTP request headers
 * - Stored in DataBag with DataBagKeys.AUTH_HEADERS
 * - Test steps setting up API authentication
 * 
 * **WHEN TO USE:**
 * - Making authenticated API calls
 * - Storing auth tokens for reuse
 * - Passing bearer tokens in request headers
 * 
 * @example
 * // In step definition - Store auth token
 * import AuthHeaders from './authHeaders';
 * const authHeaders = new AuthHeaders();
 * authHeaders.Token = 'Bearer eyJhbGciOiJIUzI1...';
 * fixture.dataBag.saveData(DataBagKeys.AUTH_HEADERS, authHeaders);
 * 
 * @example
 * // In ApiExecutor - Retrieve headers
 * const authHeaders = fixture.dataBag.getData(DataBagKeys.AUTH_HEADERS) as AuthHeaders;
 * const headers = { 'Authorization': authHeaders.Token };
 */
export default class AuthHeaders {
    Token: string;
}