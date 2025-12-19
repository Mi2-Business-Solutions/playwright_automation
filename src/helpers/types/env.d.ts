/**
 * **WHAT:** TypeScript type definitions for environment variables used across the test suite
 * 
 * **WHY:** Provides IntelliSense, type checking, and autocomplete for process.env variables
 * 
 * **WHERE USED:**
 * - Throughout test suite when accessing process.env
 * - Loaded from .env.{ENV} files via getEnv()
 * - Type safety for environment configuration
 * 
 * **WHEN TO USE:**
 * - Automatically applied via TypeScript compilation
 * - Add new properties when new env variables are needed
 * - Update types when environment requirements change
 * 
 * **ENVIRONMENT CATEGORIES:**
 * - Browser: BROWSER, HEAD
 * - Environment: ENV, BASEURL, IS_LOCAL
 * - Authentication: TOKEN, playwrightUser, playwrightPasswd, AUTHORIZATION_URL
 * - API: API_BASEURL, API_URI_PREFIX
 * - Database: DB_SERVER, DB_PORT, DB_DATABASE, DB_REQ_TIMEOUT, USE_AZURE_CLI_FOR_DB
 * - Test Execution: CUCUMBER_RETRY_COUNT, LOGIN_PAGE_CHECK_RETRY_COUNT
 * - Logging: LOG_LEVEL
 * - Data: DEFAULT_DATA_SOURCE_LOCATION, DEFAULT_CACHE_TIMEOUT_IN_SEC, EXTENDED_CACHE_TIMEOUT_IN_SEC, EXTEND_CACHE, DATA_REQUIREMENTS_COMMON
 * 
 * @example
 * // TypeScript provides type checking
 * const browser: "chrome" | "firefox" | "webkit" = process.env.BROWSER;
 * const baseUrl: string = process.env.BASEURL;
 * const retryCount: string = process.env.CUCUMBER_RETRY_COUNT;
 * 
 * @example
 * // IntelliSense shows available env variables
 * const dbServer = process.env.DB_  // Autocomplete suggests DB_SERVER, DB_PORT, etc.
 */
export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "QA1" | "QA2",
            BASEURL: string,
            TOKEN: "token",
            API_BASEURL: string,
            API_URI_PREFIX: string,
            IS_LOCAL: "true" | "false",
            CUCUMBER_RETRY_COUNT: string,
            playwrightUser: string,
            playwrightPasswd: string,
            DB_SERVER: string,
            DB_PORT: string,
            DB_DATABASE: string,
            DB_REQ_TIMEOUT: string,
            AUTHORIZATION_URL: string,
            HEAD: "true" | "false",
            LOG_LEVEL: "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly",
            DEFAULT_DATA_SOURCE_LOCATION: string,
            DEFAULT_CACHE_TIMEOUT_IN_SEC: string,
            EXTENDED_CACHE_TIMEOUT_IN_SEC: string,
            EXTEND_CACHE: string,
            USE_AZURE_CLI_FOR_DB: "true" | "false", //if the current login user (on the machine where the test is running) has Azure compatible access to the database, then this should be true
            DATA_REQUIREMENTS_COMMON: string,
            LOGIN_PAGE_CHECK_RETRY_COUNT: string,
        }
    }
}