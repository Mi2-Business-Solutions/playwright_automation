/**
 * **WHAT:** Data model representing database column metadata (name and type)
 * 
 * **WHY:** Type-safe structure for describing table columns when building SQL statements
 * 
 * **WHERE USED:**
 * - DbManager.insertDataWithColumnNames() for OUTPUT clause
 * - SampleAppDbManager constants for column definitions
 * - SQL statement builders requiring column metadata
 * 
 * **WHEN TO USE:**
 * - Retrieve auto-generated values (e.g., identity columns)
 * - Build dynamic INSERT statements with OUTPUT clause
 * - Declare table variables in SQL
 * 
 * **PROPERTIES:**
 * - name: Column name in database
 * - type: SQL data type (INT, VARCHAR, DATETIME, etc.)
 * 
 * @example
 * // Retrieve auto-generated ID after insert
 * const idColumn = new ColumnDetails();
 * idColumn.name = 'OrderId';
 * idColumn.type = 'INT';
 * const result = await dbManager.insertDataWithColumnNames(
 *   pool, 'Orders', ['CustomerName'], ['John Doe'], [idColumn]
 * );
 * const newOrderId = result.recordset[0].OrderId;
 */
export default class ColumnDetails {
    name: string;
    type: string;
}