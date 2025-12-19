/**
 * **WHAT:** Cucumber.js configuration file defining test execution profiles and settings
 * 
 * **WHY:** Centralizes Cucumber test runner configuration for consistent test execution across environments
 * 
 * **WHERE USED:**
 * - Cucumber test runner (npm test, npm run rerun)
 * - CI/CD pipeline test execution
 * - Local development test runs
 * 
 * **WHEN TO USE:**
 * - Running BDD feature tests
 * - Executing failed test reruns
 * - Parallel test execution
 * - Tag-based test filtering
 * 
 * **PROFILES:**
 * - default: Standard test execution with tag filtering, parallel execution (3 workers), and rerun tracking
 * - rerun: Re-executes failed tests from @rerun.txt file using same configuration
 * 
 * **KEY CONFIGURATION:**
 * - Tags: Filter tests by @tags (via npm_config_TAGS environment variable)
 * - Parallel: 3 workers for concurrent test execution
 * - Retry: Configurable retry count via CUCUMBER_RETRY_COUNT (default 0)
 * - Formats: progress-bar output + rerun file generation
 * - Paths: Feature files in src/tests/features/
 * - Require: Step definitions in src/tests/steps/ + hooks in src/hooks/
 * 
 * @example
 * // Run all tests
 * npm test
 * 
 * @example
 * // Run tests with specific tag
 * npm test --TAGS="@smoke"
 * 
 * @example
 * // Rerun failed tests
 * npm run rerun
 * 
 * @example
 * // Set retry count
 * // .env: CUCUMBER_RETRY_COUNT=2
 * npm test  // Each failed scenario retries twice
 */
require('dotenv').config({path: `src/helpers/env/.env.QA2`});

module.exports = {
    default: {
        tags: process.env.npm_config_TAGS || "",
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
            "src/tests/features/"
        ],
        dryRun: false,
        require: [
            "src/tests/steps/**/*.ts", 
            "src/tests/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            // "html:test-results/cucumber-report.html",
            // "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 3,
        retry: (() => {
            const retryCount = parseInt(process.env.CUCUMBER_RETRY_COUNT, 10);
            return isNaN(retryCount) ? 0 : retryCount;
        })()
    },
    rerun: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        publishQuiet: true,
        dryRun: false,
        require: [
            "src/tests/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            // "html:test-results/cucumber-report.html",
            // "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 3,
        retry: (() => {
            const retryCount = parseInt(process.env.CUCUMBER_RETRY_COUNT, 10);
            return isNaN(retryCount) ? 0 : retryCount;
        })()
    }
}
