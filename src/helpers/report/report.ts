/**
 * **WHAT:** Multiple-cucumber-html-reporter configuration that generates consolidated HTML test reports
 * 
 * **WHY:** Creates visual, shareable HTML reports from Cucumber JSON test results
 * 
 * **WHERE USED:**
 * - Executed after test suite completion
 * - Part of post-test reporting pipeline
 * - Generates reports in test-results/reports/ directory
 * 
 * **WHEN TO USE:**
 * - After all tests complete
 * - Need HTML report for stakeholders
 * - CI/CD pipeline reporting
 * 
 * **HOW IT WORKS:**
 * - Reads Cucumber JSON reports from test-results/
 * - Generates consolidated HTML report with metadata
 * - Includes browser, platform, and custom test information
 * - Outputs to test-results/reports/ directory
 * 
 * **CONFIGURATION:**
 * - jsonDir: Source directory for Cucumber JSON files
 * - reportPath: Output directory for HTML reports
 * - metadata: Browser, device, platform information
 * - customData: Additional test context information
 * 
 * @example
 * // Executed after tests
 * // npm run report
 * // Generates: test-results/reports/index.html
 */

const report = require("multiple-cucumber-html-reporter");

report.generate({
    jsonDir: "test-results",
    reportPath: "test-results/reports/",
    reportName: "Playwright Automation Report",
    pageTitle: "Sample Automation test report",
    displayDuration: false,
    metadata: {
        browser: {
            name: "chrome",
            version: "112",
        },
        device: "AChembeti - PC",
        platform: {
            name: "Windows",
            version: "10",
        },
    },
    customData: {
        title: "Test Info",
        data: [
            { attributeKey: "attribute1", attributeValue: "value1" },
            { attributeKey: "attribute2", attributeValue: "value2" },
        ],
    },
});