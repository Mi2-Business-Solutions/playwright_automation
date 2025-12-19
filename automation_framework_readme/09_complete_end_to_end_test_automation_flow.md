# Chapter 9: Complete End-to-End Test Automation Flow

## Overview
This chapter provides a complete, step-by-step methodology for writing ANY test scenario using this framework. Follow these steps in order to ensure consistency, maintainability, and zero hardcoding throughout your test automation.

---

## **STEP 1: Register TestDataType Enum**

### Purpose
Define your new test data type so StepDataHelper knows how to handle it.

### File
`src/helpers/util/test-data/testDataType.ts`

### Example Implementation
```typescript
export enum TestDataType {
    AppUser ,
    [YourType] ,
    FarmAssessmentData ,
    LoginData ,
    // Add more as needed
}
```

### Key Points
- Register each new test data class here FIRST
- StepDataHelper uses this enum to know which type to return
- Naming convention: PascalCase with 'Data' suffix (e.g., `FarmAssessmentData`)

### How to Use (Use Case)
- When to change: add a new `TestDataType` only if you need a new logical test-data category (for example, `OrderData`).
- Reuse existing data: if an existing enum value already represents your data, reference it — do not create a duplicate enum value.
- Practical steps: add enum value → create/confirm TypeScript model → reference via `json://ENV_VAR#recordKey` in feature files.

---

## **STEP 2: Create TypeScript Class Model**

### Purpose
Define the structure and provide type safety for your JSON data.

### File
`src/helpers/util/test-data/[your_feature]/[YourDataClass].ts`

### Implementation
```typescript
/**
 * **WHAT:** Data model for [YOUR FEATURE] test data
 * 
 * **WHY:** Type-safe TypeScript interface for data loaded from local JSON
 * 
 * **WHERE USED:**
 * - [Your Feature] step definitions
 * - Local JSON file: test-data-store/[your_feature]/[your_data].json
 * - StepDataHelper.getSingleTestDataRecordForType(TestDataType.[YourType], ...)
 * 
 * **WHEN TO USE:**
 * - Loading test data from local JSON files
 * - Providing type-safe access to data properties in steps
 * 
 * @example
 * const data = StepDataHelper.getSingleTestDataRecordForType(
 *   TestDataType.[YourType],
 *   'json://[YOUR_FEATURE_DATA_FILE]#[recordKey]'
 * ) as [YourDataClass];
 */
export default class [YourDataClass] {
    field1: string;
    field2: string;
    field3: string;
    // ... add more properties to match your JSON structure
}
```

### Example - Farm Assessment Data Class
```typescript
/**
 * Data model for Farm Assessment test data
 * Matches the structure in test-data-store/farmAssessment/farmData.json
 */
export default class FarmAssessmentData {
    name:string;
   location:LocationData;
   noOfRecords:number;
   assessmentStatus:string[];
}
```
### Example - Location Data Class (Used in above example)
```typescript
export default class LocationData {
        country: string;
        city: string;
        state: string;
        getLocationFullDetails() : string {
                return `${this.county}, ${this.city}, ${this.state}`
        }
        copy(source: LocationData){
                this.county = source.county;
                this.city =  source.city;
                this.state = source.state; 
        }
            
}
```

### Key Points
- Class properties MUST match JSON field names exactly
- Documents what data structure is expected
- Must be created BEFORE using in step definitions
- Use descriptive property names

### How to Use (Use Case)
- When to create: add a TypeScript class model only if the JSON structure has fields your steps will consume.
- Reuse existing models: if an existing model matches the JSON, reuse it and cast the returned object to that class in your step definitions.
- Practical steps: verify JSON keys → update or extend the model if necessary → use as `const data = StepDataHelper(... ) as YourDataClass`.

---

## **STEP 3: Create JSON Test Data Files**

### Purpose
Store all static test data in structured JSON files, separated from code.

### File
`test-data-store/[your_feature]/[your_data].json`

### Implementation
```json
{
    "[recordKey1]": {
    "field1": "value1",
    "field2": "value2",
    "field3": "value3"
  },
    "[recordKey2]": {
    "field1": "differentValue1",
    "field2": "differentValue2",
    "field3": "differentValue3"
  },
    "[recordKey3]": {
    "field1": "anotherValue1",
    "field2": "anotherValue2",
    "field3": "anotherValue3"
  }
}
```

### Example - Farm Assessment Data
```json
{
  "name4": {
    "name": "Green Valley Farm",
    "location": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi"
    },
    "noOfRecords": 120,
    "assessmentStatus": ["Completed", "Reviewed"],
    "submittedYear": "2004"
  },

  "name15": {
    "name": "Sunny Acres Farm",
    "location": {
      "country": "United States",
      "state": "Wisconsin",
      "city": "Madison"
    },
    "noOfRecords": 85,
    "assessmentStatus": ["Completed"],
    "submittedYear": "2015"
  },

  "name10": {
    "name": "Riverbend Farm",
    "location": {
      "country": "Australia",
      "state": "Queensland",
      "city": "Brisbane"
    },
    "noOfRecords": 60,
    "assessmentStatus": ["In Progress"],
    "submittedYear": "2010"
  }
}
```

### Key Points
- Create one JSON file per feature/module
- Store multiple test data sets in one file (different scenarios)
- Use descriptive key names for easy reference 
- All static test data lives here - ZERO hardcoding in code
- Easy to add new test scenarios by adding new records

### How to Use (Use Case)
- When to add files: create a new JSON file only if no existing file contains the records you need.
- Reuse existing files: reference an existing record via `json://ENV_VAR#recordKey` from your feature — no file creation required.
- Practical steps: search `test-data-store/` for the required key; if present, use the env var path in the feature URI to reuse it.

---

## **STEP 4: Define Environment Configuration (.env)**

### Purpose
Store the PATH to your test data file for each environment (no hardcoding paths).

### Example Files
- `src/helpers/env/.env.QA1`
- `src/helpers/env/.env.QA2`
- `src/helpers/env/.env.Staging`
- etc.

### Implementation
```ini
BASEURL=https://qa1.sample.com/

# Data file paths - These point to where your test data lives
LOGIN_USER_DATA=test-data-store/login/loginUser.json
[YOUR_FEATURE_DATA_FILE]=test-data-store/[your_feature]/[your_data].json
FARM_DATA_FILE=test-data-store/farmAssessment/farmData.json
```

### Example - Multiple Environment Files

**`.env.QA1`:**
```ini
BASEURL=https://qa1.sample.com/
LOGIN_USER_DATA=test-data-store/login/loginUser.json
FARM_DATA_FILE=test-data-store/farmAssessment/farmData.json
```

**`.env.QA2`:**
```ini
BASEURL=https://qa2.sample.com/
LOGIN_USER_DATA=test-data-store/login/loginUser.json
FARM_DATA_FILE=test-data-store/farmAssessment/farmData.json
```

**`.env.Staging`:**
```ini
BASEURL=https://staging.sample.com/
LOGIN_USER_DATA=test-data-store/login/loginUser.json
FARM_DATA_FILE=test-data-store/farmAssessment/farmData.json
```

### Key Points
- Don't hardcode file paths in code
- Don't hardcode any test data
- Only store REFERENCES to files
- Same test data can be used across environments
- Or point to different files per environment if needed
- Environment variables loaded at test startup from corresponding .env file

### How to Use (Use Case)
- When to update `.env`: add or update an environment variable only if you need to point tests to a different JSON file for a specific environment.
- Reuse behavior: multiple environments can point to the same JSON file path; you only need to change `.env` when the path differs.
- Practical steps: confirm `LOGIN_USER_DATA` or `FARM_DATA_FILE` exists in the target `.env.*`; reference them in features via `json://ENV_VAR#recordKey`.

---

## **STEP 5: Create Feature File with BACKGROUND**

### Purpose
Write test scenarios in Gherkin (BDD format) with BACKGROUND to eliminate repeated setup steps.

### File
`src/tests/features/[your_feature].feature`

### Implementation
```gherkin
@[your_feature] @smoke
Feature: [Your Feature Description]
  As a [user type]
  I want to [do something]
  So that [get some benefit]

  # BACKGROUND: Runs BEFORE each scenario (common setup)
  # ✅ Eliminates repeated Given steps
  Background:
    Given I navigate to [your feature] page
    And I am logged into the application

  # Scenario 1: Only needs When/Then (no repeated Given)
    Scenario: [First scenario description]
        When I fill [your feature] form with "json://[YOUR_FEATURE_DATA_FILE]#[recordKey1]"
    Then I should see [success condition]
    And I should see submitted [field] as [expected value from JSON]

  # Scenario 2: Same background automatically runs before this
    Scenario: [Second scenario description]
        When I fill [your feature] form with "json://[YOUR_FEATURE_DATA_FILE]#[recordKey2]"
    Then I should see [success condition]
    And I should see submitted [field] as [expected value from JSON]

  # Scenario 3: Background runs again - all scenarios stay clean
    Scenario: [Third scenario description]
        When I fill [your feature] form with "json://[YOUR_FEATURE_DATA_FILE]#[recordKey3]"
    Then I should see [success condition]
    And I should see submitted [field] as [expected value from JSON]
```

### Example - Farm Assessment Feature File
```gherkin
@farmAssessment @smoke
Feature: Farm Assessment Form Submission
  As a farm owner
  I want to fill and submit farm assessment forms
  So that I can track farm health metrics

  Background:
    Given I am logged into the application
    And I navigate to the farm assessment page
    And I click on a farm card

  Scenario: Complete farm assessment with tropical climate data
    When I fill farm assessment with "json://FARM_DATA_FILE#name4"
    And I click the save button
    Then I should see "HERD DETAILS" text visible
    And I should see submitted year as "2004"

  Scenario: Complete farm assessment with temperate climate data
    When I fill farm assessment with "json://FARM_DATA_FILE#name15"
    And I click the save button
    Then I should see "HERD DETAILS" text visible
    And I should see submitted year as "2015"

  Scenario: Complete farm assessment with subtropical climate data
    When I fill farm assessment with "json://FARM_DATA_FILE#name10"
    And I click the save button
    Then I should see "HERD DETAILS" text visible
    And I should see submitted year as "2010"
```

### URI Format for JSON Data
```
json://[ENV_VAR_NAME]#[recordKey]

Examples:
- json://FARM_DATA_FILE#tropical2004Assessment
- json://LOGIN_USER_DATA#adminUser
- json://YOUR_FEATURE_DATA_FILE#recordKey
```

### Key Benefits of BACKGROUND
- ✅ No repetition of common setup steps
- ✅ Runs BEFORE each scenario automatically
- ✅ Makes scenarios focused on their unique test logic
- ✅ Easy to modify setup once - applies to all scenarios
- ✅ Better readability and maintainability
- ✅ Cleaner feature files
---
### How to Use (Use Case)
- When to use Background: use it whenever multiple scenarios share the same preconditions (login, navigation, selecting a starting entity).
- Reuse existing JSON records: scenarios should reference existing records via `json://ENV_VAR#recordKey`, keeping feature files concise.
- Practical steps: add common Given steps to `Background`, then in each `Scenario` use `When I fill ... with "json://ENV_VAR#recordKey"` to reuse existing data.

---

## **STEP 6: Create Step Definitions**

### Purpose
Connect Gherkin steps to actual code using StepDataHelper bridge.

### File
`src/tests/steps/[your_feature]Steps.ts`

### Location notes
- Background / common steps file: `src/tests/steps/commonFeatureSteps.ts`
- Scenario-specific step definitions: `src/tests/steps/[your_feature]Steps.ts`

**Important:** Do not redefine background/common steps in your scenario-specific step files. Redefining the same step text in multiple files causes Cucumber to raise "Ambiguous step definitions" errors. Keep shared Given/When/Then steps in `commonFeatureSteps.ts` and implement only feature-specific steps in the `[your_feature]Steps.ts` file.

### Implementation Structure

#### Part A: Background Steps (Common Setup)
```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { fixture } from "../../hooks/fixture";
import StepPageHelper from "../stepPageHelper";
import StepDataHelper from "../../helpers/util/stepDataHelper";
import { TestDataType } from "../../helpers/util/test-data/testDataType";
import [YourDataClass] from "../../helpers/util/test-data/[your_feature]/[YourDataClass]";

// ============ BACKGROUND STEPS (Common Setup) ============

// File: `src/tests/steps/commonFeatureSteps.ts`

Given('I am logged into the application', async function () {
      const loginPage = await StepPageHelper.getLoginPage();    
    // Get login credentials from test data
    const user = StepDataHelper.getSingleTestDataRecordForType(
        TestDataType.AppUser,
        'json://LOGIN_USER_DATA#appTestUser'
    ) as AppUser;
    
    await loginPage.loginUser(user.userName, user.password);
    fixture.logger.info(`Logged in as: ${user.fullUserName}`);
    fixture.dataBag.saveData('loggedInUser', user.fullUserName);
});


Given('I click on a farm card', async function () {
    const homePage = await StepPageHelper.getHomePage();
    await homePage.clickFarmCard();
    fixture.logger.info('Clicked on farm card');
});
```

#### Part B: Scenario-Specific Steps
```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { fixture } from "../../hooks/fixture";
import LoginPage from "../../pages/login/loginPage";
import [YourFeatureName]Page from "../../pages/[your_feature]/[YourFeatureName]Page";
import StepDataHelper from "../../helpers/util/stepDataHelper";
import { TestDataType } from "../../helpers/util/test-data/testDataType";
import [YourDataClass] from "../../helpers/util/test-data/[your_feature]/[YourDataClass]";

// ============ SCENARIO-SPECIFIC STEPS ============

// Step using JSON data via StepDataHelper
When('I fill [your feature] form with {string}', async function (dataUri: string) {
    // dataUri format from feature file: "json://[YOUR_FEATURE_DATA_FILE]#[recordKey]"
    
    const page = await StepPageHelper.get[YourFeature]Page();;
    
    // ⭐ StepDataHelper handles the complete connection:
    // 1. Parses dataUri to extract env variable name and record key
    // 2. Reads process.env to get file path from .env
    // 3. Reads the JSON file
    // 4. Extracts the specific record
    // 5. Returns as typed class instance
    const testData = StepDataHelper.getSingleTestDataRecordForType(
        TestDataType.[YourType],
        dataUri
    ) as [YourDataClass];
    
    // ✅ NO HARDCODING - All values come from JSON
    await page.completeForm(
        testData.field1,
        testData.field2,
        testData.field3
    );
    
    // Save to DataBag for later steps to reference (dynamic scenario data)
    fixture.dataBag.saveData('submittedData', testData);
    fixture.logger.info(`Form filled with data: ${JSON.stringify(testData)}`);
});

When('I click the save button', async function () {
    const homePage = await StepPageHelper.getHomePage();;
    await homePage.clickSubmit();
    fixture.logger.info('Clicked save button');
});

// Verification step
Then('I should see {string} text visible', async function (expectedText: string) {
    const homePage = await StepPageHelper.getHomePage();;
    const result = await homePage.isStatusValidated(status);
    expect(result).toBeTruthy();
});
```

### Key Points
- Background steps are defined once, run before EACH scenario
- Scenario-specific steps use StepDataHelper to load JSON data
- All test data flows from JSON via StepDataHelper, NEVER hardcoded
- Use DataBag to pass data from one step to another
- Save important data to DataBag after actions for later verification
- Clear, descriptive logging for debugging
---
### How to Use (Use Case)
- When to implement: create step definitions that accept `json://ENV_VAR#recordKey` whenever a scenario requires static input values.
- Reuse existing data: call `StepDataHelper.getSingleTestDataRecordForType(TestDataType.X, dataUri)` with an existing env var and record key to reuse a record without adding files.
- Practical steps: feature → `json://` URI → step uses `StepDataHelper` → cast to model → call POM methods; if values are needed later, save to `fixture.dataBag`.

---

## **STEP 7: Create Page Object Model (POM)**

### Purpose
Encapsulate all element locators and page interactions in one place.

### File
`src/pages/[your_feature]/[YourFeatureName]Page.ts`

### Implementation Structure

#### Part A: Element Locators
```typescript
import BasePage from "../basePage";
import { Page } from "@playwright/test";

export default class [YourFeatureName]Page extends BasePage {
  replaceLabelName = "replace-labelName";
  replaceText = "replaceText";
  replaceSectionName = "sectionName";
  replaceIndex = "replace-Index";
  replaceMonthIndex = "replace-MonthIndex";
  replaceGroupIndex = "replace-Group";
  replaceFieldName = "replace-fieldName";
  replaceCategoryName = "replace-categoryName";
  replaceSibilingName = "replace-sibilingName";
  replaceClassName = "replace-className";
    // 1. Define all element locators in one place
    Elements = {
        farmCard: '//div[@class="farm-card"]',
        field1Input: '//input[@id="field1"]',
        field2Dropdown: '//select[@id="field2"]',
        field3RadioButton: `//input[@type="radio" and @value="[${this.replaceText}]"]`,
        submitButton: '//button[contains(text(), "Submit")]',
        successMessage: '//span[contains(text(), "Success")]'
    };
    async isPageStable(): Promise<boolean> {
    // Add logic to verify the page is fully loaded (e.g., check for a key element)
    return true;
  }
```

#### Part B: Individual Action Methods
```typescript
    // 2. Create methods for each action (single responsibility)
    async clickFarmCard() {
        await this.wrapper.elementAction.waitAndClickLocator(this.Elements.farmCard);
        fixture.logger.info("Clicked on farm card");
    }

    async fillField1(value: string) {
        await this.wrapper.dataWriter.fillInputField(
            this.Elements.field1Input,
            value
        );
        fixture.logger.info(`Filled field1 with: ${value}`);
    }

    async selectField2(value: string) {
        await this.wrapper.dataWriter.selectDropdownByValue(
            this.Elements.field2Dropdown,
            value
        );
        fixture.logger.info(`Selected field2: ${value}`);
    }

    async selectField3(value: string) {
        await this.wrapper.elementAction.waitAndClickLocator(
            this.Elements.field3RadioButton.replace(
          this.replaceIndex,
          value.toString()
        ));
        fixture.logger.info(`Selected field3: ${value}`);
    }

    async clickSubmit() {
        await this.wrapper.elementAction.waitAndClickLocator(
            this.Elements.submitButton
        );
        fixture.logger.info("Clicked submit button");
    }

    async verifySuccessMessage(): Promise<boolean> {
        return await this.wrapper.dataReader.isElementVisible(
            this.Elements.successMessage
        );
    }
```

#### Part C: High-Level Business Methods
```typescript
    // 3. Create high-level methods combining multiple actions
    async completeForm(field1: string, field2: string, field3: string) {
        await this.fillField1(field1);
        await this.selectField2(field2);
        await this.selectField3(field3);
        await this.clickSubmit();
    }
}
```

### Key Points
- All element locators defined at top of class
- Each action is a separate method (single responsibility principle)
- Methods are small, focused, and reusable
- No test logic, only page interactions
- Methods accept data as parameters (not hardcoded)
- Use wrapper layer for all interactions (built-in waits and reliability)
- Clear, descriptive method names matching business domain
---
### How to Use (Use Case)
- When to reuse POM: always call POM methods from step definitions and pass data obtained from existing JSON records; POMs should not be coupled to JSON parsing.
- Practical steps: in your step definition, get typed data via `StepDataHelper` (or DataBag), then call high-level POM method(s) like `page.completeForm(...)` with those values. No new JSON required when reusing records.

---

## **Complete Connection Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Register TestDataType Enum                              │
│ OUTCOME - Add new test data type to enum                        │
│ HOW IT USED - Used by StepDataHelper for type identification    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create TypeScript Class Model                           │
│ OUTCOME - Define structure matching JSON fields                 │
│ HOW IT USED - Provides type safety and IDE autocomplete         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create JSON Test Data Files                             │
│ OUTCOME - Store all static test data in structured JSON files   │
│ HOW IT USED - Provide scenario records (multiple cases) & avoid │
│                 hardcoding of values                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Define Environment Configuration (.env)                │
│ OUTCOME - Reference paths to JSON files per environment         │
│ HOW IT USED - Loaded at test startup to resolve data file paths │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Create Feature File with BACKGROUND                     │
│ OUTCOME - Create Gherkin feature files using BACKGROUND         │
│ HOW IT USED - Background provides common setup; scenarios use   │
│               URIs (json://ENV_VAR#recordKey) to reference data │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Create Step Definitions                                 │
│ OUTCOME - Implement step definitions that call StepDataHelper   │
│ HOW IT USED - Loads typed data from JSON and stores runtime     │
│               values in DataBag for later verification           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Create Page Object Model (POM)                          │
│ OUTCOME - Build POM encapsulating locators and action methods   │
│ HOW IT USED - Step definitions call POM methods to perform UI   │
│               interactions via the wrapper layer                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TEST EXECUTION                                                  │
│ ✅ Test runs with data from JSON                                │
│ ✅ Zero hardcoding anywhere                                     │
│ ✅ Type-safe throughout                                         │
│ ✅ Easily reusable for new scenarios                            │
│ ✅ Environment-agnostic                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Running the Test**

### Basic Command
```bash
npm test --ENV="QA1"
```

### Run Specific Feature
```bash
npm test --ENV="QA1" -- --tags @farmAssessment
```

### Run Specific Scenario with Tag
```bash
npm test --ENV="QA1" -- --tags @smoke
```

### Run with Different Environment
```bash
npm test --ENV="QA2"
npm test --ENV="Staging"
```

---

## **Quick Reference Checklist for ANY New Test Scenario**

| Step | Task | File/Location |
|------|------|---------------|
| ✅ **Step 1** | Add entry in TestDataType enum | `src/helpers/util/test-data/testDataType.ts` |
| ✅ **Step 2** | Create TypeScript class | `src/helpers/util/test-data/[feature]/[Class].ts` |
| ✅ **Step 3** | Create JSON file with test data | `test-data-store/[feature]/[data].json` |
| ✅ **Step 4** | Add .env reference to JSON file path | `src/helpers/env/.env.[ENV]` |
| ✅ **Step 5** | Create feature file with BACKGROUND | `src/tests/features/[feature].feature` |
| ✅ **Step 6** | Create step definitions using StepDataHelper | `src/tests/steps/[feature]Steps.ts` |
| ✅ **Step 7** | Create page object with element locators | `src/pages/[feature]/[Feature]Page.ts` |
| ✅ **Run** | Execute tests | `npm test -- --tags "@tagName"` |

---

## **Key Principles**

### 1. **No Hardcoding**
- All test data in JSON files
- All file paths in .env files
- All locators in Page Objects
- Never hardcode values in step definitions

### 2. **Type Safety**
- TypeScript classes for all data models
- Compile-time checking
- IDE autocomplete
- Self-documenting code

### 3. **Separation of Concerns**
- **Feature Files:** What to test (business language)
- **Step Definitions:** How to test (test logic)
- **Page Objects:** Where to interact -use the `PlaywrightWrapper` (via `this.wrapper`) for all browser interactions.
- **Data Models:** What data structure (type safety)
- **JSON Files:** What test data (test data storage)
- **.env Files:** Where to find data (environment configuration)

### 4. **BACKGROUND for Common Setup**
- Eliminates repeated Given steps
- Runs before each scenario
- Keeps feature files clean
- Easier to maintain

### 5. **DataBag for Dynamic Data**
- Pass data between steps
- Verify submitted data matches expected

### 6. **Wrapper Layer for Reliability**
- Built-in waits for stability
- Consistent interaction patterns
- Error handling
- Logging

---

## **Best Practices Summary**

| Practice | Why | How |
|----------|-----|-----|
| Use StepDataHelper | Central point to load data | Always use in When/Given steps |
| Save to DataBag | Share data between steps | After actions, before verification |
| BACKGROUND for common setup | Reduce code duplication | Common Given steps in BACKGROUND |
| One JSON file per feature | Organization | Logical grouping of test data |
| Multiple records per JSON | Reusability | Different scenarios, one data file |
| URI format in feature file | Clarity | `json://ENV_VAR#recordKey` |
| Small focused methods in POM | Maintainability | Each method does one thing |
| Wrapper layer for interactions | Reliability | Built-in waits and error handling |
| Use StepPageHelper | Centralized page object access, automatic caching and initialization | Always use StepPageHelper static methods in steps instead of direct PageFactory instantiation or new page object creation |
---

## **Example: Complete Farm Assessment Test Setup**

### Files Created:
1. **TypeScript Class** → `src/helpers/util/test-data/farm/farmData.ts`
2. **JSON Data** → `test-data-store/farmAssessment/farmData.json`
3. **.env Reference** → `src/helpers/env/.env.QA` (add: `FARM_DATA_FILE=test-data-store/farmAssessment/farmData.json`)
4. **Feature File** → `src/tests/features/farmAssessment.feature`
5. **Step Definitions** → `src/tests/steps/farmAssessmentSteps.ts`
6. **Page Object** → `src/pages/farmAssessment/farmAssessmentPage.ts`
7. **Enum Entry** → `TestDataType.FarmAssessmentData` in `src/helpers/util/test-data/testDataType.ts`

### Result:
✅ Complete, maintainable, type-safe, zero-hardcoding test automation
✅ BACKGROUND eliminates test code repetition
✅ All scenarios should follow same structure and patterns

