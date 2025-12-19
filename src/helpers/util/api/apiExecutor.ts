/**
 * **WHAT:** Low-level API executor providing generic HTTP methods (GET, POST) with auth and headers
 * 
 * **WHY:** Centralizes HTTP request logic with authentication, headers, and error handling
 * 
 * **WHERE USED:**
 * - ApiManager delegates HTTP calls here
 * - Any code needing raw HTTP requests
 * - Test steps making direct API calls
 * 
 * **WHEN TO USE:**
 * - Make GET requests
 * - Make POST requests
 * - Add query parameters
 * - Add custom headers
 * 
 * **HOW IT WORKS:**
 * - Retrieves auth headers from DataBag
 * - Merges additional headers
 * - Uses fixture.requestContext for HTTP calls
 * - Returns Playwright APIResponse
 * 
 * @example
 * // In test step - GET request
 * const url = 'https://api.example.com/users';
 * const response = await ApiExecutor.callGetMethod(url);
 * const data = await response.json();
 * 
 * @example
 * // POST request with body
 * fixture.dataBag.saveData(DataBagKeys.REQUEST_BODY, { name: 'John' });
 * const response = await ApiExecutor.callPostMethod(url);
 * expect(response.status()).toBe(200);
 * 
 * @example
 * // Add query params
 * ApiExecutor.saveQueryParams([{ page: '1', limit: '10' }]);
 * const response = await ApiExecutor.callGetMethod(url + '?' + queryParams);
 */
import { APIResponse } from "@playwright/test";
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import AuthHeaders from "./authHeaders";

/**
 * **ApiExecutor Class**
 * 
 * **RESPONSIBILITY:** Generic HTTP operations with auth, headers, and timeout handling
 * 
 * **KEY CAPABILITIES:**
 * - GET and POST HTTP methods
 * - Auth header management
 * - Query parameter building
 * - Custom header merging
 * - 150-second timeout
 */
export default class ApiExecutor {
    private static readonly TIME_OUT = 150000;
    static saveQueryParams(records: Record<string, string>[]) {
        let queryParams = "";
        for (const row of records) {
            for (const key in row) {
                queryParams = queryParams + `${key}=${row[key]}&`;
            }
        }
        queryParams = queryParams.substring(0, queryParams.length - 1);
        fixture.dataBag.saveData(DataBagKeys.QUERY_PARAMETERS, queryParams);
    }

    static saveAdditionalHeaders(records: Record<string, string>[]){
        fixture.dataBag.saveData(DataBagKeys.ADDITIONAL_HEADERS, records);
    }

    static async callGetMethod(url: string): Promise<APIResponse> {
        fixture.logger.info(`about to call ${url}`);
        let headersData = ApiExecutor.getHeadersData();
        //fixture.logger.info(`headersData is ... ${JSON.stringify(headersData)}`);
        let response = await fixture.requestContext.get(url, {
            headers: headersData,
            timeout: ApiExecutor.TIME_OUT
        });
    
        //console.log(await response.json());
        return response;
    }
    
    static async callPostMethod(url: string): Promise<APIResponse> {
        fixture.logger.info(`about to call ${url}`);
        
        let headersData = ApiExecutor.getHeadersData();
        let endpointData = fixture.dataBag.getData(DataBagKeys.REQUEST_BODY);
        //fixture.logger.info(`endpointData value is ${JSON.stringify(endpointData)}`);
        let response = await fixture.requestContext.post(url, {
            headers: headersData,
            data: endpointData,
            timeout: ApiExecutor.TIME_OUT
        });
    
        //console.log(await response.json());
        return response;
    }
    static getHeadersData(){
        const headers = fixture.dataBag.getData(DataBagKeys.AUTH_HEADERS) as AuthHeaders;
        //fixture.logger.info(`headers is...${JSON.stringify(headers)}`);
        let headersData = {};
        headersData = Object.assign({},headers); 
    
        const additionalHeaders = fixture.dataBag.getData(DataBagKeys.ADDITIONAL_HEADERS) as Record<string, string>[];
        //fixture.logger.info(`additionalHeaders is...${JSON.stringify(additionalHeaders)}}`);
        if(additionalHeaders !== undefined && additionalHeaders !== null && additionalHeaders.length > 0)
        {
            for (const row of additionalHeaders) {
                for (const key in row) {
                    headersData[key] = row[key];
                }
            }
        }
        //fixture.logger.info(`final headers is...${JSON.stringify(headersData)}}`);
        return headersData;
    }
}