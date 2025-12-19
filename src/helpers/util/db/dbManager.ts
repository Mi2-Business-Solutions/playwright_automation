/**
 * **WHAT:** Low-level database manager providing SQL Server connection and CRUD operations
 * 
 * **WHY:** Centralizes database connectivity with support for username/password and Azure CLI authentication
 * 
 * **WHERE USED:**
 * - SampleAppDbManager extends this for business-specific operations
 * - Test steps requiring direct database access
 * - Data setup/teardown in test hooks
 * 
 * **WHEN TO USE:**
 * - Connect to SQL Server database
 * - Execute INSERT, SELECT, UPDATE, DELETE operations
 * - Call stored procedures
 * - Retrieve auto-generated values (identity columns)
 * 
 * **HOW IT WORKS:**
 * - Reads DB connection config from environment variables
 * - Creates mssql connection pool
 * - Provides generic CRUD methods
 * - Supports two authentication mechanisms:
 *   1. Username/Password (default)
 *   2. Azure CLI access token
 * 
 * **AUTHENTICATION:**
 * - UserNamePassword: Uses playwrightUser/playwrightPasswd from env
 * - AzureCli: Uses 'az account get-access-token' command
 * 
 * @example
 * // In SampleAppDbManager
 * const dbManager = new DbManager();
 * const pool = await dbManager.connectToDatabase();
 * const result = await dbManager.insertData(pool, 'Orders', ['John', 100]);
 * await dbManager.clearDbResources(pool);
 * 
 * @example
 * // Azure CLI authentication
 * const pool = await dbManager.connectToDatabase(DbConnectionMechanism.AzureCli);
 * 
 * @example
 * // Execute stored procedure
 * const results = await dbManager.executeStoredProcedure<OrderResult>(
 *   pool, 'proc_GetOrders',
 *   [{ name: 'CustomerId', type: sql.Int, value: 123 }],
 *   (row) => ({ orderId: row.OrderId, total: row.Total })
 * );
 */
import { fixture } from "../../../hooks/fixture";
import * as sql from 'mssql';
import ColumnDetails from "./columnDetails";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import { sys } from 'ping';

enum DbOperation {
    INSERT,
    SELECT,
    UPDATE,
    DELETE
}

/**
 * **Database Connection Mechanism Enum**
 * 
 * Defines authentication methods for SQL Server connection
 * 
 * - UserNamePassword: Traditional SQL auth with username/password
 * - AzureCli: Azure Active Directory via 'az login' token
 */
export enum DbConnectionMechanism{
    UserNamePassword,
    AzureCli
}

/**
 * **DbManager Class**
 * 
 * **RESPONSIBILITY:** Low-level SQL Server operations with connection pooling
 * 
 * **KEY CAPABILITIES:**
 * - Connection pool management
 * - CRUD operations (INSERT, SELECT, UPDATE, DELETE)
 * - Stored procedure execution
 * - Auto-generated value retrieval (OUTPUT clause)
 * - Two authentication mechanisms
 */
export default class DbManager {

    config = {
        // user: process.env['playwrightUser'], //comes from Azure KeyVault in the case of CI/CD with Azure DevOps
        // password: process.env['playwrightPasswd'], //comes from Azure KeyVault in the case of CI/CD with Azure DevOps
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        port: parseInt(process.env.DB_PORT),
        // authentication: {
        //     type: 'azure-active-directory-default'
        //   },
        options: {
            trustServerCertificate: false,
            encrypt: true,
            debug: true
        },
        requestTimeout: parseInt(process.env.DB_REQ_TIMEOUT),
        connectionTimeout: parseInt(process.env.DB_REQ_TIMEOUT)
    };

    async connectToDatabase(connectWith: DbConnectionMechanism = DbConnectionMechanism.UserNamePassword): Promise<any> {
        /*let server = process.env.DB_SERVER;
        sys.probe(server, (isAlive) => {
            if (isAlive) {
              console.log(`${server} is reachable`);
              fixture.logger.info(`${server} is reachable`);
            } else {
              console.log(`${server} is not reachable`);
              fixture.logger.info(`${server} is not reachable`);
            }
          });*/
          
        let dbConnectionConfig: any;
        switch(connectWith)
        {
            case DbConnectionMechanism.UserNamePassword:
                {
                    fixture.logger.info(`connecting to the DB using user name and password`);
                    let dbUserName = process.env['playwrightUser']; //comes from Azure KeyVault in the case of CI/CD with Azure DevOps
                    /*if(!dbUserName.endsWith('@domain-name.com')){
                        fixture.logger.info(`adding @domain-name.com to the user name ${dbUserName}`);
                        dbUserName += '@domain-name.com';
                        fixture.logger.info(`final user name is ${dbUserName}`);
                    }*/
                    dbConnectionConfig = {
                        ...this.config,
                        user: dbUserName, 
                        password: process.env['playwrightPasswd'], //comes from Azure KeyVault in the case of CI/CD with Azure DevOps
                        //authentication: {
                        //    type: 'azure-active-directory-default'
                        //    //type: 'azure-active-directory-password'
                        //},
                    };
                }break;
            case DbConnectionMechanism.AzureCli:
                {
                    fixture.logger.info(`connecting to the DB using Azure CLI. For this to succeed, ensure Azure CLI is installed and the command 'az login' was executed before running tests`);
                    const { stdout } = await execAsync('az account get-access-token --resource=https://database.windows.net');
                    const { accessToken } = JSON.parse(stdout);

                    dbConnectionConfig = {
                        ...this.config,
                        authentication: {
                            type: 'azure-active-directory-access-token',
                            options: {
                                token: accessToken
                            }
                        }
                    };
                }break;
            default:
                throw new Error(`unsupported DbConnectionMechanism value - ${connectWith}`);
        }
        /*
        // Enable detailed logging
        sql.on('error', err => {
            console.error('SQL error', err);
            fixture.logger.error(`sql error is - ${JSON.stringify(err)}`);
        });*/
        // Create a new instance of MSSQL connection pool
        const pool = await sql.connect(dbConnectionConfig);
        // Set pool properties
        pool.max = 10;
        pool.min = 0;
        pool.idleTimeoutMillis = parseInt(process.env.DB_REQ_TIMEOUT);
        fixture.logger.info('Connected to the database');
        return pool;
    }

    async clearDbResources(pool: any) {
        if (pool !== null) {
            // Close the connection pool when done
            await pool.close();
        }
        await sql.close();
        fixture.logger.info('Connection to the database closed');
    }

    /**
     * Inserts ONE record into the specified table 
     * @param pool connection pool object
     * @param tableName name of the table to insert data into
     * @param values array of values to be inserted
     * @returns returns db operation result
     */
    async insertData(pool: any, tableName: string, values: any[]): Promise<number> {
        const statement = this.getInsertDataStatement(tableName, values);
        return await this.performDbOperation(pool, statement);
    }

    /**
     * Inserts ONE record into the specified table 
     * @param pool connection pool object
     * @param tableName name of the table to insert data into
     * @param cols name of the columns to insert data 
     * @param values array of values to be inserted
     * @param columnDetailsToGetInsertedVals array of column names for which inserted data needs to be returned; useful to retrieve auto generated values such as PrimaryKey column
     * @returns returns db operation result
     */
    async insertDataWithColumnNames(pool: any, tableName: string, cols: string[], values: any[], columnDetailsToGetInsertedVals: ColumnDetails[] = []): Promise<any> {
        const statement = this.getInsertDataStatementWithColumnNames(tableName, cols, values, columnDetailsToGetInsertedVals);
        return await this.performDbOperation(pool, statement);
    }

    /**
     * Deletes data
     * @param pool connection pool object
     * @param tableName name of the table to delete data from
     * @param condition database condition with default empty value; when empty this will not be used in the SQL execution
     * @returns returns db operation result
     */
    async deleteData(pool: any, tableName: string, condition: string = ""): Promise<any> {
        let statement = `DELETE FROM ${tableName}`;
        if (condition.length > 0) {
            statement = statement + ` WHERE ${condition}`;
        }
        return await this.performDbOperation(pool, statement);
    }

    /**
     * 
     * @param pool connection pool object
     * @param recordCount number of records to return
     * @param colName name of the column to return
     * @param tableName name of the table
     * @param orderByCol name of the column to order records during data selection
     * @param orderByCondition either DESC or ASC; default value is DESC
     * @returns returns values of the column requested
     */
    async getColumnTopRecords(pool: any, recordCount: number, colName: string, tableName: string, orderByCol: string = "", orderByCondition: "DESC" | "ASC" = "DESC"): Promise<any> {
        let sqlStmt = `SELECT TOP ${recordCount} ${colName} FROM ${tableName}`;
        if (orderByCol !== null && orderByCol.length > 0) {
            sqlStmt = sqlStmt + ` ORDER BY ${orderByCol} ${orderByCondition}`;
        }
        return await this.performDbOperation(pool, sqlStmt);
    }

    private getInsertDataStatement(tableName: string, values: any[], colNamesToGetInsertedVals: ColumnDetails[] = []): string {
        let sqlStmt = `INSERT INTO ${tableName} `;
        return this.getUpdatedInsertDataStatement(sqlStmt, values, colNamesToGetInsertedVals);
    }

    private getInsertDataStatementWithColumnNames(tableName: string, cols: string[], values: any[], colNamesToGetInsertedVals: ColumnDetails[] = []): string {
        let sqlStmt = `INSERT INTO ${tableName}`;
        if (cols !== null && cols.length > 0) {
            sqlStmt += " (";
            for (let i = 0; i < cols.length; i++) {
                sqlStmt += cols[i];
                if (i !== cols.length - 1) {
                    sqlStmt += ",";
                }
            }
            sqlStmt += ")";
        }

        return this.getUpdatedInsertDataStatement(sqlStmt, values, colNamesToGetInsertedVals);
    }

    private getUpdatedInsertDataStatement(sqlStmt: string, values: any[], colNamesToGetInsertedVals: ColumnDetails[] = []): string {
        if (colNamesToGetInsertedVals !== null && colNamesToGetInsertedVals.length > 0) {
            let tblDeclaration = `declare @MyTbl table (`;
            for (let i = 0; i < colNamesToGetInsertedVals.length; i++) {
                tblDeclaration += ` ${colNamesToGetInsertedVals[i].name} ${colNamesToGetInsertedVals[i].type}`;
                if (i !== colNamesToGetInsertedVals.length - 1) {
                    tblDeclaration += ",";
                }
            }
            sqlStmt = tblDeclaration + `); ` + sqlStmt + ` OUTPUT `;

            for (let i = 0; i < colNamesToGetInsertedVals.length; i++) {
                sqlStmt += ` Inserted.${colNamesToGetInsertedVals[i].name}`;
                if (i !== colNamesToGetInsertedVals.length - 1) {
                    sqlStmt += ",";
                }
            }

            sqlStmt += ` INTO @MyTbl`;
        }

        sqlStmt += ` VALUES (`;

        for (let i = 0; i < values.length; i++) {
            if (values[i] === null) {
                sqlStmt += 'NULL';
            } else if (typeof values[i] === 'string') {
                sqlStmt += `'${values[i]}'`;
            } else {
                sqlStmt += values[i];
            }
            if (i !== values.length - 1) {
                sqlStmt += ",";
            }
        }
        sqlStmt += ")";
        if (colNamesToGetInsertedVals.length > 0) {
            sqlStmt += "; SELECT * FROM @MyTbl";
        }
        fixture.logger.info(sqlStmt);
        return sqlStmt;
    }
    private async performDbOperation(pool: any, operationStatement: string): Promise<any> {
        fixture.logger.info(`operationStatement is ${operationStatement}`);
        return await pool.request().query(operationStatement);;
    }
    async executeStoredProcedure<T>(
        pool: any,
        procName: string,
        inputParams: { name: string, type: any, value: any }[],
        mapRowToInstance: (row: any) => T
      ): Promise<T[]> {
        fixture.logger.info(`stored procedure is ${procName}`);
        
        // Create a request
        let request = pool.request();
      
        // Add input parameters to the request
        inputParams.forEach(param => {
            request.input(param.name, param.type, param.value);
        });
  
        // Execute the stored procedure
        let result = await request.execute(procName);
  
        // Map the result to the return class
        let rows = result.recordset.map(mapRowToInstance);
  
        return rows;
      }
}