/**
 * **WHAT:** Custom HTML report generator that creates detailed test execution reports from passed/failed scenario JSON data
 * 
 * **WHY:** Provides comprehensive test results visualization with retry information, duration metrics, and failure details
 * 
 * **WHERE USED:**
 * - Post-test execution reporting
 * - Generating custom HTML reports with detailed metrics
 * - Consolidating passed and failed scenario data
 * 
 * **WHEN TO USE:**
 * - After test execution completes
 * - Need detailed HTML report with custom layout
 * - Want retry and duration analytics
 * 
 * **HOW IT WORKS:**
 * - Reads passed-scenarios.json and failed scenario JSON files
 * - Merges feature and scenario data
 * - Calculates total duration, retries, pass/fail counts
 * - Generates styled HTML report with embedded CSS
 * - Outputs to test-results/report.html
 * 
 * @example
 * // Usage in reporting script
 * import ReportGenerator from './reportGenerator';
 * const generator = new ReportGenerator();
 * generator.generateHtmlReport();
 * // Result: test-results/report.html created
 */

import * as fs from 'fs-extra'; 
import * as path from 'path';

/**
 * **Feature Interface**
 * 
 * Represents a test feature file with its scenarios
 */
interface Feature {
    /** Feature name from .feature file */
    name: string;
    /** Relative path to feature file */
    path: string;
    /** Array of scenarios within this feature */
    scenarios: Scenario[];
}

/**
 * **Scenario Interface**
 * 
 * Represents an individual test scenario with execution details
 */
interface Scenario {
    /** Scenario name */
    name: string;
    /** Execution duration in milliseconds */
    duration: number;
    /** Execution status: 'passed' or 'failed' */
    status: string;
    /** Number of times scenario was retried */
    retries: number;
    /** Step that failed (if status is 'failed') */
    failedStep?: string;
}

/**
 * **ReportGenerator Class**
 * 
 * **RESPONSIBILITY:** Generates comprehensive HTML test reports from JSON test results
 * 
 * **KEY CAPABILITIES:**
 * - Load and merge passed/failed scenario data
 * - Calculate aggregate metrics (duration, retries)
 * - Generate styled HTML report
 * - Handle missing or incomplete data gracefully
 */
class ReportGenerator {
    
    private passedFeatures: Feature[];
    private failedFeatures: Feature[];
    private totalDuration: number;
    private totalRetries: number;

    /**
     * **Constructor**
     * 
     * **WHAT:** Initializes ReportGenerator by loading passed/failed scenario data
     * 
     * **HOW IT WORKS:**
     * 1. Reads passed-scenarios.json from test-results/
     * 2. Loads all failed scenario JSON files from test-results/failed/
     * 3. Calculates total duration across all scenarios
     * 4. Calculates total retry count across all scenarios
     * 
     * **HANDLES:**
     * - Missing passed-scenarios.json (defaults to empty array)
     * - Missing failed directory (returns empty array)
     * 
     * @example
     * const generator = new ReportGenerator();
     * // Loads all test results automatically
     */
    constructor() {
        const testResultsDir = path.join(__dirname, '../../../test-results');
        const passedPath = path.join(testResultsDir, 'passed-scenarios.json');
        
        // Handle missing passed-scenarios.json
        this.passedFeatures = fs.existsSync(passedPath) 
            ? fs.readJsonSync(passedPath) 
            : [];
            
        this.failedFeatures = this.loadFailedFeatures(testResultsDir);
        this.totalDuration = this.calculateTotalDuration();
        this.totalRetries = this.calculateTotalRetries();
    }
    
    /**
     * **Calculate Total Retries**
     * 
     * **WHAT:** Calculates sum of all scenario retries across passed and failed features
     * 
     * **WHY:** Provides metrics on test stability and flakiness
     * 
     * **HOW IT WORKS:**
     * 1. Combines passed and failed features
     * 2. Extracts all scenarios using flatMap
     * 3. Sums retry counts using reduce
     * 
     * @returns {number} Total number of retries across all scenarios
     * 
     * @example
     * // Scenario 1: 2 retries, Scenario 2: 1 retry, Scenario 3: 0 retries
     * const retries = this.calculateTotalRetries(); // 3
     */
    private calculateTotalRetries(): number {
        return [...this.passedFeatures, ...this.failedFeatures]
            .flatMap(f => f.scenarios)
            .reduce((sum, s) => sum + s.retries, 0);
    }

    /**
     * **Calculate Total Duration**
     * 
     * **WHAT:** Calculates total execution time across all scenarios in milliseconds
     * 
     * **WHY:** Provides execution time metrics for test suite performance analysis
     * 
     * **HOW IT WORKS:**
     * 1. Combines passed and failed features
     * 2. Extracts all scenarios
     * 3. Sums duration values in milliseconds
     * 
     * @returns {number} Total duration in milliseconds
     * 
     * @example
     * // Scenario 1: 5000ms, Scenario 2: 3500ms, Scenario 3: 2000ms
     * const duration = this.calculateTotalDuration(); // 10500
     */
    private calculateTotalDuration(): number {
        const allScenarios = [...this.passedFeatures, ...this.failedFeatures]
            .flatMap(f => f.scenarios);
        return allScenarios.reduce((sum, s) => sum + s.duration, 0);
    }

    /**
     * **Load Failed Features**
     * 
     * **WHAT:** Loads all failed scenario JSON files from test-results/failed/ directory
     * 
     * **WHY:** Consolidates failed scenario data from multiple test runs
     * 
     * **HOW IT WORKS:**
     * 1. Checks if failed directory exists
     * 2. Reads all files ending with '-failed-scenarios.json'
     * 3. Parses each JSON file into Feature objects
     * 4. Returns array of failed features
     * 
     * @param {string} testResultsDir - Path to test-results directory
     * @returns {Feature[]} Array of failed features (empty if no failures)
     * 
     * @example
     * // Files in test-results/failed/:
     * // - login-failed-scenarios.json
     * // - checkout-failed-scenarios.json
     * const failed = this.loadFailedFeatures('/path/to/test-results');
     * // Returns: [Feature{name: 'Login', ...}, Feature{name: 'Checkout', ...}]
     */
    private loadFailedFeatures(testResultsDir: string): Feature[] {
        const failedDir = path.join(testResultsDir, 'failed');
        if (!fs.existsSync(failedDir)) return [];
        
        return fs.readdirSync(failedDir)
            .filter(file => file.endsWith('-failed-scenarios.json'))
            .map(file => fs.readJsonSync(path.join(failedDir, file)));
    }

    /**
     * **Merge Features**
     * 
     * **WHAT:** Combines passed and failed features by feature path, merging their scenarios
     * 
     * **WHY:** Creates unified feature view showing all scenarios regardless of pass/fail status
     * 
     * **HOW IT WORKS:**
     * 1. Creates empty feature map indexed by feature path
     * 2. Processes passed features: add scenarios with 'passed' status
     * 3. Processes failed features: add scenarios with 'failed' status
     * 4. Returns merged feature array
     * 
     * **HANDLES:**
     * - Same feature appearing in both passed and failed lists
     * - Multiple scenarios per feature
     * - Preserves scenario metadata (duration, retries, failedStep)
     * 
     * @returns {Feature[]} Array of merged features with all scenarios
     * 
     * @example
     * // Passed: Feature 'Login' with 2 scenarios
     * // Failed: Feature 'Login' with 1 scenario
     * const merged = this.mergeFeatures();
     * // Result: Feature 'Login' with 3 scenarios (2 passed, 1 failed)
     */
    private mergeFeatures(): Feature[] {
        const featureMap: Record<string, Feature> = {};

        // Process passed features
        this.passedFeatures.forEach(feature => {
            if (!featureMap[feature.path]) {
                featureMap[feature.path] = { ...feature, scenarios: [] };
            }
            featureMap[feature.path].scenarios.push(...feature.scenarios.map(s => ({ ...s, status: 'passed' })));
        });

        // Process failed features
        this.failedFeatures.forEach(feature => {
            if (!featureMap[feature.path]) {
                featureMap[feature.path] = { ...feature, scenarios: [] };
            }
            featureMap[feature.path].scenarios.push(...feature.scenarios.map(s => ({ ...s, status: 'failed' })));
        });

        return Object.values(featureMap);
    }

    /**
     * **Generate HTML Report**
     * 
     * **WHAT:** Public method to generate complete HTML test report file
     * 
     * **WHY:** Creates visual, shareable test report for stakeholders
     * 
     * **HOW IT WORKS:**
     * 1. Merges passed and failed features
     * 2. Generates HTML string with embedded CSS and JavaScript
     * 3. Ensures output directory exists
     * 4. Writes HTML to test-results/report.html
     * 5. Logs output path to console
     * 
     * **OUTPUT:**
     * - File: test-results/report.html
     * - Content: Interactive HTML report with filtering and search
     * 
     * @example
     * // Usage in post-test script
     * const generator = new ReportGenerator();
     * generator.generateHtmlReport();
     * // Console: "Report generated: /path/to/test-results/report.html"
     * // Result: Opens in browser showing dashboard, filters, expandable features
     */
    public generateHtmlReport(): void {
        const allFeatures = this.mergeFeatures();
        const html = this.generateHtml(allFeatures);
        const outputPath = path.join(__dirname, '../../../test-results/report.html');
        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`Report generated: ${outputPath}`);
    }

    /**
     * **Generate HTML**
     * 
     * **WHAT:** Generates complete HTML string with embedded styles, data, and JavaScript
     * 
     * **WHY:** Creates self-contained HTML report with no external dependencies
     * 
     * **HOW IT WORKS:**
     * 1. Calculates summary metrics (total, failed, retried scenarios)
     * 2. Generates HTML structure:
     *    - Header with report title
     *    - Dashboard cards showing metrics
     *    - Filter controls (show all/failed/retried)
     *    - Search input
     *    - Feature sections with expandable scenarios
     * 3. Embeds CSS for styling
     * 4. Includes JavaScript for interactivity (filters, search, expand/collapse)
     * 
     * **FEATURES:**
     * - Responsive design
     * - Filter by status (all/failed/retried)
     * - Real-time scenario search
     * - Expandable/collapsible features and scenarios
     * - Visual status badges (passed/failed)
     * - Retry count badges
     * - Failed step display
     * - No results message
     * 
     * @param {Feature[]} features - Merged array of all features with scenarios
     * @returns {string} Complete HTML document as string
     * 
     * @example
     * const html = this.generateHtml(mergedFeatures);
     * // Returns: "<!DOCTYPE html><html>...</html>"
     * // Contains:
     * // - Dashboard: 10 total, 2 failed, 3 retried scenarios
     * // - Feature sections with scenario details
     * // - Interactive filters and search
     */
    private generateHtml(features: Feature[]): string {
        const uniqueScenarios = features.flatMap(f => f.scenarios);
        const totalUnique = uniqueScenarios.length;
        const failedUnique = uniqueScenarios.filter(s => s.status === 'failed').length;
        const retriedScenarios = uniqueScenarios.filter(s => s.retries > 0).length;

        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Sample UI Automation Test Report</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            :root {
                --primary-color: #0077b6;
                --secondary-color: #0096c7;
                --background-color: #f8f9fa;
                --text-color: #343a40;
                --success-color: #28a745;
                --warning-color: #ffc107;
                --danger-color: #dc3545;
                --light-gray: #e9ecef;
                --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                --border-radius: 8px;
            }
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: var(--text-color);
                background-color: #f0f2f5;
                line-height: 1.6;
                padding: 0;
                margin: 0;			
			    background-size: cover;
			    background-repeat: no-repeat;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            header {
                background-color: var(--primary-color);
                color: white;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 0;
            }
            
            .dashboard {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .card {
                background: white;
                border-radius: var(--border-radius);
                padding: 20px;
                box-shadow: var(--card-shadow);
                transition: transform 0.2s ease;
            }
            
            .card:hover {
                transform: translateY(-3px);
            }
            
            .card-title {
                font-size: 16px;
                color: #6c757d;
                margin-bottom: 10px;
            }
            
            .card-value {
                font-size: 32px;
                font-weight: 600;
                color: var(--primary-color);
            }
            
            .controls {
                background: white;
                padding: 20px;
                border-radius: var(--border-radius);
                margin-bottom: 20px;
                box-shadow: var(--card-shadow);
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
                align-items: center;
            }
            
            .filter-group {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .radio-label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 4px;
                background-color: var(--light-gray);
                transition: all 0.2s ease;
            }
            
            .radio-label:hover {
                background-color: #dde2e6;
            }
            
            input[type="radio"] {
                margin-right: 5px;
            }
            
            input[type="radio"]:checked + .radio-label {
                background-color: var(--primary-color);
                color: white;
            }
            
            .search-container {
                position: relative;
                flex-grow: 1;
                max-width: 400px;
            }
            
            .search-container input {
                width: 100%;
                padding: 10px 15px 10px 35px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .search-icon {
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }
            
            .feature {
                background: white;
                border-radius: var(--border-radius);
                margin-bottom: 15px;
                overflow: hidden;
                box-shadow: var(--card-shadow);
            }
            
            .feature-header {
                padding: 15px 20px;
                background-color: var(--secondary-color);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: background-color 0.2s ease;
            }
            
            .feature-header:hover {
                background-color: var(--primary-color);
            }
            
            .feature-content {
                padding: 0 20px;
            }
            
            .feature-path {
                padding: 15px 0;
                color: #6c757d;
                font-size: 14px;
                border-bottom: 1px solid var(--light-gray);
            }
            
            .scenario {
                margin: 15px 0;
                border-radius: var(--border-radius);
                overflow: hidden;
            }
            
            .scenario.passed {
                border-left: 4px solid var(--success-color);
            }
            
            .scenario.failed {
                border-left: 4px solid var(--danger-color);
            }
            
            .scenario-header {
                padding: 12px 15px;
                background-color: #f8f9fa;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .scenario-title {
                flex-grow: 1;
                font-weight: 500;
                font-size: 16px;
            }
            
            .scenario-meta {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .status-passed {
                background-color: #e6ffec;
                color: var(--success-color);
            }
            
            .status-failed {
                background-color: #ffebe9;
                color: var(--danger-color);
            }
            
            .retry-badge {
                background-color: #fff8e6;
                color: var(--warning-color);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .scenario-content {
                padding: 12px 15px;
                background-color: #fbfbfb;
            }
            
            .error {
                background-color: #ffebe9;
                padding: 10px 15px;
                border-radius: 4px;
                color: var(--danger-color);
                font-size: 14px;
                margin-top: 10px;
            }
            
            .caret {
                margin-right: 10px;
                transition: transform 0.3s ease;
            }
            
            .hidden {
                display: none !important;
            }
            
            .no-results {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }
            
            @media (max-width: 768px) {
                .dashboard {
                    grid-template-columns: 1fr;
                }
                
                .controls {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .search-container {
                    max-width: 100%;
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="container">
                <h1>Sample UI Automation Test Report</h1>
            </div>
        </header>
        
        <div class="container">
            <div class="dashboard">
                <div class="card">
                    <div class="card-title">Total Scenarios</div>
                    <div class="card-value">${totalUnique}</div>
                </div>
                <div class="card">
                    <div class="card-title">Failed Scenarios</div>
                    <div class="card-value">${failedUnique}</div>
                </div>
                <div class="card">
                    <div class="card-title">Retried Scenarios</div>
                    <div class="card-value">${retriedScenarios}</div>
                </div>
                <div class="card">
                    <div class="card-title">Total Retries</div>
                    <div class="card-value">${this.totalRetries}</div>
                </div>
            </div>
            
            <div class="controls">
                <div class="filter-group">
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showAll" value="all" checked>
                        <span class="radio-label">Show all tests</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showFailed" value="failed">
                        <span class="radio-label">Show only failed tests</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="filter" id="showRetried" value="retried">
                        <span class="radio-label">Show failed and retried tests</span>
                    </label>
                </div>
                
                <div class="search-container">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchTests" placeholder="Search scenarios...">
                </div>
            </div>
            
            <div id="featuresContainer">
                ${features.map(f => `
                <div class="feature" data-feature>
                    <div class="feature-header" data-toggle>
                        <span class="caret">▼</span>
                        <div class="feature-title">Feature: ${f.name}</div>
                    </div>
                    <div class="feature-content">
                        <div class="feature-path">Path: ${f.path}</div>
                        ${f.scenarios.map(s => `
                        <div class="scenario ${s.status}" data-scenario data-retries="${s.retries}" data-name="${s.name.toLowerCase()}" data-status="${s.status}">
                            <div class="scenario-header" data-toggle>
                                <span class="caret">▼</span>
                                <div class="scenario-title">Scenario: ${s.name}</div>
                                <div class="scenario-meta">
                                    ${s.retries > 0 ? `<span class="retry-badge">${s.retries} ${s.retries === 1 ? 'retry' : 'retries'}</span>` : ''}
                                    <span class="status-badge status-${s.status}">${s.status.toUpperCase()}</span>
                                </div>
                            </div>
                            <div class="scenario-content">
                                ${s.status === 'failed' ? `<div class="error"><i class="fas fa-exclamation-circle"></i> <strong>Failed Step:</strong> ${s.failedStep}</div>` : ''}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>`).join('')}
            </div>
            
            <div class="no-results hidden" id="noResults">
                <i class="fas fa-search" style="font-size: 48px; opacity: 0.5; margin-bottom: 20px;"></i>
                <h3>No matching scenarios found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        </div>
    
        <script>
            // Toggle feature and scenario content
            document.body.addEventListener('click', e => {
                const toggleElement = e.target.closest('[data-toggle]');
                if (toggleElement) {
                    const parent = toggleElement.parentElement;
                    const content = parent.querySelector('.feature-content, .scenario-content');
                    content.classList.toggle('hidden');
                    const caret = toggleElement.querySelector('.caret');
                    if (caret) {
                        caret.style.transform = content.classList.contains('hidden') ? 'rotate(-90deg)' : '';
                    }
                }
            });
    
            // Filter functions
            const applyFilters = () => {
                const searchText = document.getElementById('searchTests').value.toLowerCase();
                const filterValue = document.querySelector('input[name="filter"]:checked').value;
                
                let visibleScenarios = 0;
                const allScenarios = document.querySelectorAll('[data-scenario]');
                
                allScenarios.forEach(scenario => {
                    const name = scenario.dataset.name;
                    const status = scenario.dataset.status;
                    const retries = parseInt(scenario.dataset.retries || '0');
                    
                    // Apply filter conditions
                    let showByFilter = true;
                    if (filterValue === 'failed') {
                        showByFilter = status === 'failed';
                    } else if (filterValue === 'retried') {
                        showByFilter = status === 'failed' || retries > 0;
                    }
                    
                    // Apply search condition
                    const matchesSearch = name.includes(searchText);
                    
                    // Combine conditions
                    const isVisible = showByFilter && matchesSearch;
                    
                    scenario.classList.toggle('hidden', !isVisible);
                    if (isVisible) visibleScenarios++;
                });
                
                // Show/hide features based on whether they have visible scenarios
                document.querySelectorAll('[data-feature]').forEach(feature => {
                    const hasVisibleScenarios = Array.from(feature.querySelectorAll('[data-scenario]'))
                        .some(s => !s.classList.contains('hidden'));
                    feature.classList.toggle('hidden', !hasVisibleScenarios);
                });
                
                // Show/hide "No results" message
                document.getElementById('noResults').classList.toggle('hidden', visibleScenarios > 0);
            };
            
            // Add event listeners
            document.querySelectorAll('input[name="filter"]').forEach(radio => {
                radio.addEventListener('change', applyFilters);
            });
            
            document.getElementById('searchTests').addEventListener('input', applyFilters);
            
            // Initialize with all items expanded
            document.addEventListener('DOMContentLoaded', () => {
                // Set initial state (everything visible)
                applyFilters();
            });
        </script>
    </body>
    </html>`;
    }
    
}

// Generate the report
new ReportGenerator().generateHtmlReport();
