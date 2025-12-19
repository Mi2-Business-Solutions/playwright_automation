/**
 * **WHAT:** Data model for common/shared test data used across multiple test scenarios
 * 
 * **WHY:** Type-safe structure for common configuration and reference data
 * 
 * **WHERE USED:**
 * - Test step definitions needing common data
 * - Initialized in hooks (initializeDataRequirements)
 * - Stored in DataBag with DataBagKeys.DATA_REQ_COMMON
 * 
 * **WHEN TO USE:**
 * - Access shared configuration values
 * - Reference data needed across scenarios
 * - Common test constants
 * 
 * **PROPERTIES:**
 * - sampleDataItem1: Example numeric data item
 * - sampleDataItem2: Example string data item
 * 
 * **NOTE:** This is a template - extend with actual common data properties
 * 
 * @example
 * // In test data JSON (common.json)
 * {
 *   "sampleDataItem1": 100,
 *   "sampleDataItem2": "Test Value"
 * }
 * 
 * @example
 * // In hooks - Load common data
 * const commonData = StepDataHelper.getSingleTestDataRecordForType(
 *   TestDataType.CommonData,
 *   'json://COMMON_DATA_REQUIREMENTS'
 * ) as CommonData;
 * fixture.dataBag.saveData(DataBagKeys.DATA_REQ_COMMON, commonData);
 * 
 * @example
 * // In step definition - Access common data
 * const commonData = fixture.dataBag.getData(DataBagKeys.DATA_REQ_COMMON) as CommonData;
 * const value = commonData.sampleDataItem2;
 */
export default class CommonData {
    sampleDataItem1: number;
    sampleDataItem2: string;
}