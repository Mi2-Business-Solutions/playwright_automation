/**
 * **WHAT:** Data model representing result set from sample stored procedure
 * 
 * **WHY:** Type-safe structure for mapping stored procedure results to TypeScript objects
 * 
 * **WHERE USED:**
 * - SampleAppDbManager.getDataFromSampleStoredProcedure()
 * - DbManager.executeStoredProcedure() row mapping function
 * - Test steps expecting specific stored procedure results
 * 
 * **WHEN TO USE:**
 * - Execute stored procedure and map results
 * - Type-safe access to stored procedure columns
 * - Validate stored procedure return data
 * 
 * **PROPERTIES:**
 * - ResCol1: First result column (numeric)
 * - ResCol2: Second result column (string)
 * 
 * **NOTE:** This is a template - create similar classes for each stored procedure
 * 
 * @example
 * // Execute stored procedure with typed results
 * const result = await sampleAppDbManager.getDataFromSampleStoredProcedure();
 * if (result.operationResult) {
 *   const data = result.operationData as SampleSpResult;
 *   fixture.logger.info(`Col1: ${data.ResCol1}, Col2: ${data.ResCol2}`);
 * }
 * 
 * @example
 * // Create custom result class for your stored procedure
 * export default class GetOrdersResult {
 *   OrderId: number;
 *   CustomerName: string;
 *   OrderTotal: number;
 * }
 */
export default class SampleSpResult {
    ResCol1: number;
    ResCol2: string;
}