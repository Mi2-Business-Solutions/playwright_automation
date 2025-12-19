/**
 * **WHAT:** Winston logger configuration factory that creates scenario-specific logging options
 * 
 * **WHY:** Provides structured logging for test scenarios with file-based output and configurable log levels
 * 
 * **WHERE USED:**
 * - Called by test fixtures to create logger instances
 * - Used in hooks to set up logging for each scenario
 * - Provides logging throughout test execution (Page Objects, wrappers, steps)
 * 
 * **WHEN TO USE:**
 * - Setting up logger for a test scenario
 * - Need test execution traceability
 * - Debugging test failures with detailed logs
 * 
 * **HOW IT WORKS:**
 * - Creates Winston logger configuration for specific scenario
 * - Logs are saved to test-results/logs/{scenarioName}/log.log
 * - Supports configurable log levels via LOG_LEVEL environment variable
 * - Timestamps all log entries with millisecond precision
 * 
 * **LOG LEVELS:**
 * - error: Error messages (highest priority)
 * - warn: Warning messages
 * - info: Informational messages (default)
 * - debug: Detailed debugging information
 * 
 * @example
 * // In fixture setup
 * import { createLogger } from 'winston';
 * import { options } from './helpers/util/logger';
 * const logger = createLogger(options('Login-Scenario-123'));
 * logger.info('Test started');
 * 
 * @example
 * // Usage in test code
 * logger.info('Navigating to login page');
 * logger.debug('Username field found');
 * logger.error('Login failed - invalid credentials');
 */

/*eslint @typescript-eslint/restrict-template-expressions: "off" */
import { transports, format } from "winston"
const { combine, timestamp, json } = format;

/**
 * **WHAT:** Creates Winston logger configuration options for a specific test scenario
 * 
 * **WHEN TO USE:**
 * - Creating logger instance for test scenario
 * - Need scenario-specific log files
 * - Setting up logging in hooks/fixtures
 * 
 * **HOW IT WORKS:**
 * 1. Creates file transport for the scenario
 * 2. Sets log file path: test-results/logs/{scenarioName}/log.log
 * 3. Reads LOG_LEVEL from environment (defaults to 'info')
 * 4. Configures timestamp format with millisecond precision
 * 5. Uses JSON format for structured log entries
 * 
 * **LOG FILE STRUCTURE:**
 * - Each scenario gets its own directory
 * - Logs stored as JSON with timestamp
 * - Example path: test-results/logs/Login-should-pass-1234567890/log.log
 * 
 * @param scenarioName - Unique identifier for the test scenario (typically scenario name + timestamp)
 * 
 * @returns Winston logger configuration object with transport and format settings
 * 
 * @example
 * // In hooks/fixture.ts
 * import { createLogger } from 'winston';
 * import { options } from '../helpers/util/logger';
 * 
 * Before(async function(scenario) {
 *   const scenarioName = `${scenario.pickle.name}-${Date.now()}`;
 *   this.logger = createLogger(options(scenarioName));
 *   this.logger.info(`Starting scenario: ${scenario.pickle.name}`);
 * });
 * 
 * @example
 * // Environment variable configuration
 * // LOG_LEVEL=debug npm test (verbose debugging)
 * // LOG_LEVEL=error npm test (only errors)
 * // npm test (defaults to 'info' level)
 * 
 * @example
 * // Log file output format:
 * // {"level":"info","message":"Login successful","timestamp":"2025-12-09 02:30:45.123 PM"}
 * // {"level":"error","message":"Element not found","timestamp":"2025-12-09 02:30:46.456 PM"}
 */
export function options(scenarioName: string) {
    return {
        transports: [
            new transports.File({
                filename: `test-results/logs/${scenarioName}/log.log`,
                level: process.env.LOG_LEVEL || 'info',
                format: combine(timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
                  }), json()),
            }),
        ]
    }
}