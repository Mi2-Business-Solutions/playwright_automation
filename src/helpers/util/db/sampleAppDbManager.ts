/**
 * **WHAT:** Business-specific database manager for sample application with table and stored procedure operations
 * 
 * **WHY:** Abstracts business logic database operations from test steps with type-safe methods
 * 
 * **WHERE USED:**
 * - Test step definitions requiring database operations
 * - Test data setup/teardown
 * - Data validation in tests
 * 
 * **WHEN TO USE:**
 * - Insert test data before scenarios
 * - Delete test data after scenarios
 * - Execute stored procedures
 * - Retrieve data for validation
 * 
 * **HOW IT WORKS:**
 * - Wraps DbManager with application-specific methods
 * - Manages connection pool lifecycle per operation
 * - Returns DbOperationResult with success/failure status
 * - Logs all operations via fixture.logger
 * 
 * **EXTENDS:** Base DbManager for low-level operations
 * 
 * @example
 * // In test step - Insert sample data
 * const dbManager = new SampleAppDbManager();
 * const result = await dbManager.insertSampleData('Value1', 'Value2');
 * expect(result.operationResult).toBeTruthy();
 * 
 * @example
 * // Delete test data in After hook
 * const dbManager = new SampleAppDbManager();
 * await dbManager.deleteSampleRows();
 * 
 * @example
 * // Execute stored procedure
 * const result = await dbManager.getDataFromSampleStoredProcedure();
 * if (result.operationResult) {
 *   const data = result.operationData as SampleSpResult;
 *   expect(data.ResCol1).toBeGreaterThan(0);
 * }
 */
import * as sql from 'mssql';
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import DateHelper from "../../types/dateHelper";
import ColumnDetails from "./columnDetails";
import DbManager, { DbConnectionMechanism } from "./dbManager";
import DbOperationResult from "./dbOperationResult";
import SampleSpResult from './resultSets/sampleSpResult';

/**
 * COLUMN DATA TYPES
 */
const COL_TYPE_INT = 'INT';

/**
 * tables
 */
const TBL_SAMPLE = 'SampleTable';

/**
 * colums
 */
const COL_FIRST_COLUMN = 'FirstColumn';
const COL_SECOND_COLUMN = 'SecondColumn';

/**
 * **SampleAppDbManager Class**
 * 
 * **RESPONSIBILITY:** Business-specific database operations for sample application
 * 
 * **KEY CAPABILITIES:**
 * - Insert sample data
 * - Delete sample rows
 * - Execute stored procedures
 * - Connection pool management
 * - Azure CLI or username/password authentication
 * 
 * **NOTE:** This is a template - create similar managers for your application tables
 */
export default class SampleAppDbManager {
    private dbManager: DbManager;
    private pool: any = null;
    constructor(){
        this.dbManager = new DbManager();
    }

    private async initializeConnectionPool(){
        if(process.env.USE_AZURE_CLI_FOR_DB !== 'true')
            this.pool = await this.dbManager.connectToDatabase();
        else
            this.pool = await this.dbManager.connectToDatabase(DbConnectionMechanism.AzureCli);
    }

    private async releaseDbResources(){
        await this.dbManager.clearDbResources(this.pool);
    }

    async deleteSampleRows(): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        
        try{
            await this.initializeConnectionPool();
            let result = await this.dbManager.deleteData(this.pool, TBL_SAMPLE);
            fixture.logger.info(`Completed deleting data from ${TBL_SAMPLE} with the result - ${JSON.stringify(result)}`);
            dbOperationResult.operationResult = true;
            dbOperationResult.operationData = result.rowsAffected;
        }catch(err){
            fixture.logger.error(`error encountered while deleting grower orders - ${JSON.stringify(err)}`);
        }finally{
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }

    async insertSampleData(firstColumn: string, secondColumn: string): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        
        try{
            await this.initializeConnectionPool();
            let result = await this.dbManager.insertData(this.pool, TBL_SAMPLE, [firstColumn, secondColumn]);
            fixture.logger.info(`Completed inserting data into ${TBL_SAMPLE} with the result - ${JSON.stringify(result)}`);
            dbOperationResult.operationResult = true;            
        }catch(err){
            fixture.logger.error(`error encountered while inserting grower orders - ${JSON.stringify(err)}`);
        }finally{
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }

    /*********************** STORED PROCEDURES **************************/
    async getDataFromSampleStoredProcedure(): Promise<DbOperationResult> {
        let dbOperationResult = new DbOperationResult();
        dbOperationResult.operationResult = false;
        const spName = 'proc_SampleStoredProcedure';

        const inputParams = /* if the SP takes parameters, mention those; otherwise leave empty array */
        [
            { name: COL_FIRST_COLUMN, type: sql.VarChar, value: 'SampleValue1' },
            { name: COL_SECOND_COLUMN, type: sql.VarChar, value: 'SampleValue2' }
        ];

        try {
            fixture.logger.info(`executing the stored procedure - ${spName}`);
            await this.initializeConnectionPool();
            const result = await this.dbManager.executeStoredProcedure<SampleSpResult>(
                this.pool,
                spName,
                inputParams,
                (row) => {
                    let data = new SampleSpResult();
                    data.ResCol1 = row.ResCol1;
                    data.ResCol2 = row.ResCol1;
                    return data;
                }
            );
            fixture.logger.info(`stored procedure - ${spName} - returned - ${result.length} - row(s)`);
            fixture.logger.info(`stored procedure - ${spName} - returned data is....`);
            result.forEach((row) => {
                fixture.logger.info(`${JSON.stringify(row)}`);
            });
            dbOperationResult.operationResult = true;
            dbOperationResult.operationData = result[0];
        } catch (err) {
            fixture.logger.error(`error encountered while executing the stored procedure - ${spName}. Error is - ${JSON.stringify(err)}`);
        } finally {
            await this.releaseDbResources();
        }
        return dbOperationResult;
    }    
}