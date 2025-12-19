/**
 * **WHAT:** API manager class providing high-level methods for specific API endpoints
 * 
 * **WHY:** Abstracts API calls with business logic, endpoint construction, and response parsing
 * 
 * **WHERE USED:**
 * - Test step definitions calling specific APIs
 * - Business logic requiring API data
 * - Integration tests
 * 
 * **WHEN TO USE:**
 * - Make API calls to specific endpoints
 * - Need parsed response objects
 * - Avoid duplicating endpoint URL construction
 * 
 * **HOW IT WORKS:**
 * - Constructs full endpoint URLs from environment variables
 * - Delegates HTTP calls to ApiExecutor
 * - Parses responses into typed objects
 * - Logs errors and stores request bodies
 * 
 * @example
 * // In step definition
 * import ApiManager from './apiManager';
 * const request = new SampleApiRequest();
 * request.filter = 'active';
 * const data = await ApiManager.getDataFromTheSampleapi(request);
 * expect(data).toBeDefined();
 */
import { APIResponse } from "@playwright/test";
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import ApiExecutor from "./apiExecutor";
import SampleApiRequest from "./models/requests/sampleApiRequest";
import SampleApiResponse from "./models/responses/sampleApiResponse";

/**
 * **ApiManager Class**
 * 
 * **RESPONSIBILITY:** High-level API operations with endpoint-specific methods
 * 
 * **KEY CAPABILITIES:**
 * - Endpoint URL construction from environment
 * - Business-specific API methods
 * - Response parsing and typing
 * - Error handling and logging
 */
export default class ApiManager {
    private static getEndpointUri(uriPart: string) {
        let uri = process.env.API_BASEURL;
        if (!uri.endsWith("/"))
            uri = uri + "/";

        uri = uri + process.env.API_URI_PREFIX;
        if (!uri.endsWith("/"))
            uri = uri + "/";

        return uri + uriPart;
    }

    private static readonly SAMPLE_API_URI = `sample/api`;

    static async getDataFromTheSampleapi(request: SampleApiRequest): Promise<any[]> {
        const url = ApiManager.getEndpointUri(ApiManager.SAMPLE_API_URI);
        fixture.dataBag.saveData(DataBagKeys.REQUEST_BODY, request);

        let result = true;
        try {
            let response: APIResponse = await ApiExecutor.callPostMethod(url);
            const responseJson = await response.json();
            //fixture.logger.info(JSON.stringify(responseJson));
            const res = new SampleApiResponse(responseJson);
            return res.resultData;

        } catch (error) {
            result = false;
            fixture.logger.error("Failed to call the endpoint. Error: " + error);
        }
        return null;
    }
}