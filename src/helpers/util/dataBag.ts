/**
 * **WHAT:** Simple key-value data storage for sharing data between test steps
 * 
 * **WHY:** Enables data passing between step definitions without global variables
 * 
 * **WHERE USED:**
 * - Step definitions to store and retrieve data during test execution
 * - Sharing extracted values between Given/When/Then steps
 * 
 * **WHEN TO USE:**
 * - Pass data between test steps
 * - Store extracted UI values for later assertions
 * 
 * @example
 * // Store and retrieve
 * dataBag.saveData('userId', 123);
 * const id = dataBag.getData('userId');
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-return: "off" */
export default class DataBag{
    /** Internal storage */
    private _dataBag = {};

    /**
     * **WHAT:** Stores value with key
     * 
     * @param key - Unique identifier
     * @param value - Data to store
     * 
     * @example
     * dataBag.saveData('userId', 123);
     */
    saveData(key: string, value: any){
        this._dataBag[key] = value;
    }

    /**
     * **WHAT:** Retrieves stored data
     * 
     * @param key - Identifier
     * 
     * @returns Stored value or undefined
     * 
     * @example
     * const id = dataBag.getData('userId');
     */
    getData(key:string){
        return this._dataBag[key];
    }
}