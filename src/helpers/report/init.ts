/**
 * **WHAT:** Test results directory initialization script that ensures clean test-results folder before test execution
 * 
 * **WHY:** Prevents stale test artifacts from previous runs affecting current test results
 * 
 * **WHERE USED:**
 * - Executed before test suite runs (via test setup scripts)
 * - Called during test initialization
 * - Part of pre-test cleanup process
 * 
 * **WHEN TO USE:**
 * - Before starting test execution
 * - Need fresh test-results directory
 * - Cleaning up previous test artifacts
 * 
 * **HOW IT WORKS:**
 * 1. Ensures test-results directory exists
 * 2. Empties the directory of all contents
 * 3. Logs error if directory operations fail
 * 
 * **SIDE EFFECTS:**
 * - Deletes all files/folders in test-results/
 * - Creates test-results/ if it doesn't exist
 * 
 * @example
 * // Typically imported/executed in test setup
 * // npm test runs this before executing tests
 * // Result: Clean test-results/ directory ready for new test artifacts
 */

const fs = require("fs-extra");
try {
    fs.ensureDir("test-results");
    fs.emptyDir("test-results");

} catch (error) {
    console.log("Folder not created! " + error);
}