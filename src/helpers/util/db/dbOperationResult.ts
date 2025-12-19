/**
 * **WHAT:** Data model representing database operation execution result
 * 
 * **WHY:** Consistent structure for returning success/failure status and result data
 * 
 * **WHERE USED:**
 * - SampleAppDbManager methods return this type
 * - Test steps checking DB operation outcomes
 * - Error handling for database operations
 * 
 * **WHEN TO USE:**
 * - Wrapping database operation results
 * - Checking if DB operation succeeded
 * - Retrieving data from successful operations
 * 
 * **PROPERTIES:**
 * - operationResult: true if operation succeeded, false if failed
 * - operationData: Result data (recordset, rows affected, inserted values, etc.)
 * 
 * @example
 * // Insert data and check result
 * const result = await sampleAppDbManager.insertSampleData('Value1', 'Value2');
 * if (result.operationResult) {
 *   fixture.logger.info(`Insert successful: ${result.operationData}`);
 * } else {
 *   fixture.logger.error('Insert failed');
 * }
 * 
 * @example
 * // Delete with rows affected
 * const result = await sampleAppDbManager.deleteSampleRows();
 * expect(result.operationResult).toBeTruthy();
 * expect(result.operationData).toBeGreaterThan(0); // Rows deleted
 */
export default class DbOperationResult {
    operationResult: boolean;
    operationData: any;
}