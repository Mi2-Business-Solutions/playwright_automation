/**
 * **WHAT:** Environment configuration loader that reads and loads environment-specific variables from .env files
 * 
 * **WHY:** Enables testing against different environments (QA1, QA2, Production, etc.) without code changes
 * 
 * **WHERE USED:**
 * - Called during test initialization in hooks/fixtures
 * - Executed before test suite runs to load environment variables
 * - Required for accessing BASE_URL, credentials, API endpoints, etc.
 * 
 * **WHEN TO USE:**
 * - Starting test execution against specific environment
 * - Need to switch between environments (dev, qa, staging, prod)
 * - Loading environment-specific configuration
 * 
 * **HOW IT WORKS:**
 * 1. Reads npm_config_ENV environment variable
 * 2. Defaults to "QA1" if no environment specified
 * 3. Loads corresponding .env file (e.g., .env.QA1, .env.QA2)
 * 4. Makes environment variables available via process.env
 * 
 * **ENVIRONMENT FILES:**
 * - Located in: src/helpers/env/
 * - Format: .env.{ENVIRONMENT_NAME}
 * - Examples: .env.QA1, .env.QA2
 * 
 * @example
 * // In hooks/fixture setup
 * import { getEnv } from './helpers/env/env';
 * getEnv(); // Loads environment configuration
 * 
 * @example
 * // Running tests against different environments
 * // Command line: npm test --ENV=QA1 (loads .env.QA1)
 * // Command line: npm test --ENV=QA2 (loads .env.QA2)
 * // Command line: npm test (defaults to QA1)
 * 
 * @example
 * // After calling getEnv(), access variables
 * getEnv();
 * const baseUrl = process.env.BASE_URL; // From .env.QA1
 * const username = process.env.TEST_USER; // From .env.QA1
 */

import * as dotenv from 'dotenv'

/**
 * **WHAT:** Loads environment-specific configuration from .env files based on npm_config_ENV variable
 * 
 * **WHEN TO USE:**
 * - Before running test suite
 * - During test initialization in fixtures
 * - When environment variables are needed for configuration
 * 
 * **HOW IT WORKS:**
 * 1. Checks for npm_config_ENV environment variable
 * 2. If not set, defaults to "QA1" with console warning
 * 3. Loads .env file from src/helpers/env/.env.{ENV}
 * 4. Sets override: true to replace existing environment variables
 * 
 * **BEHAVIOR:**
 * - Defaults to QA1 environment if no ENV specified
 * - Logs warning when using default environment
 * - Overrides existing environment variables with .env file values
 * 
 * @example
 * // In hooks/fixture.ts
 * import { getEnv } from '../helpers/env/env';
 * 
 * BeforeAll(async function() {
 *   getEnv(); // Loads environment configuration
 *   // Now process.env.BASE_URL, process.env.USERNAME, etc. are available
 * });
 * 
 * @example
 * // Command line usage
 * // npm test --ENV=QA1
 * // npm test --ENV=QA2
 * // npm test (defaults to QA1)
 * 
 * @example
 * // Example .env.QA1 file content:
 * // BASE_URL=https://qa1.example.com
 * // TEST_USER=testuser@example.com
 * // TEST_PASSWORD=SecurePass123
 * // API_KEY=abc123xyz
 */
export const getEnv = () => {
    // if (process.env.ENV) {
    //     dotenv.config({
    //         override: true,
    //         path: `src/helpers/env/.env.${process.env.ENV}`
    //     })
    // } else {
    //     console.warn(process.env.npm_config_ENV)
    //     console.error("NO ENV PASSED!")
    // }

    if (!process.env.npm_config_ENV){
        process.env.npm_config_ENV = "QA1"
        console.warn(`running tests in default environment - ${process.env.npm_config_ENV}`)
    }

    dotenv.config({
        override: true,
        path: `src/helpers/env/.env.${process.env.npm_config_ENV}`
    })
}