/**
 * @file Data Writing Wrapper for Playwright
 * 
 * WHAT this file provides:
 * This wrapper encapsulates Playwright's form-filling and data entry APIs, providing simplified methods for
 * entering text into inputs, selecting dropdown options, checking checkboxes, and filling multi-field forms.
 * It handles various input location strategies and supports Angular-specific components (ng-select, mat-checkbox).
 * 
 * WHY this wrapper exists:
 * - Simplifies form filling with semantic method names
 * - Provides consistent interface for different input types (text, textarea, dropdown, checkbox)
 * - Handles Tab-out behavior automatically for field navigation
 * - Supports complex Angular components (ng-select dropdowns with search)
 * - Centralizes click-fill-keypress patterns
 * - Handles indexed elements and table cell inputs
 * - Reduces boilerplate in Page Objects for form operations
 * - Provides iframe input support
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Core Wrapper Layer (data writing/form filling operations)
 * - Used by: Page Objects for form interactions, Step Definitions for data entry
 * - Dependencies: PlaywrightWrapperCommon, PlaywrightWrapperPageElement, AngularElements
 * - Position: Specialized wrapper for write operations
 * 
 * WHEN tests should use this wrapper:
 * - When filling input fields (text, email, password, number)
 * - When selecting dropdown options
 * - When checking/unchecking checkboxes
 * - When filling textarea elements
 * - For Angular ng-select dropdown interactions
 * - For Angular mat-checkbox interactions
 * - When filling table cell inputs
 * - For form operations requiring Tab key navigation
 * 
 * Key patterns:
 * - enterValueInto*: Fill input fields with various location strategies
 * - select*: Dropdown option selection
 * - check*: Checkbox operations
 * - fillIndexed*: Handle multiple elements with same identifier
 * - *InATableRow: Table cell input operations
 * - *Angular*: Angular Material/component interactions
 */

import { Locator, Page } from "@playwright/test";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
import KeyBoardItems from "./keyBoardItems";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import AngularElements from "../../pages/angularElements";
import { fixture } from "../../hooks/fixture";
import PageConstants from "../../pages/pageConstants";

/**
 * PlaywrightWrapperDataWriter class
 * 
 * RESPONSIBILITY:
 * Provides methods for filling forms, entering text, selecting options, and checking checkboxes.
 * Handles different input types, location strategies, and framework-specific components (Angular).
 * 
 * PLAYWRIGHT FEATURES ENCAPSULATED:
 * - locator.fill() - Fill input fields
 * - locator.click() + fill() - Click then fill pattern
 * - locator.press() - Keyboard key press (Tab, Enter)
 * - locator.selectOption() - Standard HTML select
 * - locator.check() - Checkbox checking
 * - getByLabel(), getByPlaceholder(), getByTestId() - Input location
 * - frameLocator() - Iframe input access
 * 
 * INPUT PATTERNS:
 * - By ID: enterValueIntoTextbox(), fillIndexedElementById()
 * - By XPath: enterValueIntoTextboxByXPath()
 * - By TestID: enterValueIntoTextboxByTestId()
 * - By Placeholder: enterValueIntoTextboxByPlaceholder()
 * - By Label: enterValueIntoTextboxByLabel()
 * - In Table: enterValueIntoTextboxInATableRow()
 * - In Iframe: enterValueIntoIFrameTextboxByXPath()
 * 
 * DROPDOWN PATTERNS:
 * - Standard: selectOption(), selectLabelledDropdownOption()
 * - With search: selectDropdownOption(), selectDropdownOptionWithAdditionalSearch()
 * - Angular: selectAngularDropdownOption(), selectAngularDropdownOptionFromPanel()
 * 
 * WHEN TO USE:
 * - Use for all form filling operations
 * - Use in Page Object setter/action methods
 * - Use instead of direct locator.fill() or click() calls
 * - Use when Tab navigation needed after input
 */
export default class PlaywrightWrapperDataWriter {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    /**
     * Fills specific element when multiple elements share same ID
     * 
     * WHAT: Selects Nth element matching ID, then fills with text.
     * WHEN: Use when multiple elements incorrectly share same ID.
     * HOW: Locates all with ID, uses nth() to select specific one, fills.
     * 
     * @param id - Shared id attribute value
     * @param elementIndex - Zero-based index (0 = first element)
     * @param txtToFill - Text value to enter
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.fillIndexedElementById('input-field', 1, 'Second field value');
     */
    async fillIndexedElementById(id: string, elementIndex: number, txtToFill: string){
        const ele = this.page.locator(this.common.getXPathWithId(id)).nth(elementIndex);
        await ele.fill(txtToFill);
    }

    /**
     * Clicks input, fills value, optionally presses key (e.g., Tab, Enter)
     * 
     * WHAT: Standard pattern for filling input - click, fill, optional key press.
     * WHEN: Used internally by most enterValueInto* methods.
     * HOW: Clicks element to focus, fills value, presses key if provided.
     * 
     * @param element - Input element locator
     * @param val - Text value to enter
     * @param keyToPress - Optional key to press after filling (e.g., Tab, Enter)
     * @returns Promise<void>
     * 
     * Pattern: click() → fill() → press(key)
     * 
     * @example
     * const input = await page.locator('#email');
     * await dataWriter.enterDataIntoInputAndPressaKey(input, 'user@example.com', KeyBoardItems.TAB);
     */
    async enterDataIntoInputAndPressaKey(element: Locator, val: string, keyToPress?: string){
        await element.click();
        await element.fill(val);
        if(keyToPress !== undefined && keyToPress !== null && keyToPress.length > 0)
            //await element.press(KeyBoardItems.TAB);
            await element.press(keyToPress);
    }

    /**
     * Fills child input element within parent container
     * 
     * WHAT: Clicks parent, finds child input, fills value, optional key press.
     * WHEN: Use when input is nested inside clickable container.
     * HOW: Clicks parent to activate, locates child input, fills, presses key.
     * 
     * @param element - Parent container element
     * @param val - Text value to enter
     * @param keyToPress - Optional key to press after filling
     * @returns Promise<void>
     * 
     * Use Case: Custom input components where clicking container reveals input
     * 
     * @example
     * const container = await page.locator('.custom-input-wrapper');
     * await dataWriter.enterDataIntoChildInputAndPressaKey(container, 'Value', KeyBoardItems.ENTER);
     */
    async enterDataIntoChildInputAndPressaKey(element: Locator, val: string, keyToPress?: string){
        const childInput = element.locator("//input");
        await element.click();
        await childInput.fill(val);
        if(keyToPress !== undefined && keyToPress !== null && keyToPress.length > 0)
            //await element.press(KeyBoardItems.TAB);
            await element.press(keyToPress);
    }

    /**
     * Enters value into textbox located by XPath
     * 
     * WHAT: Waits for visible element at XPath, fills value, optionally tabs out.
     * WHEN: Use for inputs best located by XPath.
     * HOW: Gets visible element by XPath, uses enterDataIntoInputAndPressaKey.
     * 
     * @param xpath - XPath to locate input element
     * @param val - Text value to enter
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxByXPath('//input[@name="email"]', 'user@example.com', true);
     */
    async enterValueIntoTextboxByXPath(xpath: string, val: string, shouldTabOut: boolean = false){
        const element = await this.pageElement.getVisibleElement(xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }

    /**
     * Enters value into iframe textbox by XPath
     * 
     * WHAT: Accesses iframe, waits for visible element at XPath, fills value.
     * WHEN: Use for inputs inside iframes.
     * HOW: Gets visible iframe element by XPath, fills with optional Tab.
     * 
     * @param iFrameName - Name attribute of iframe
     * @param xpath - XPath within iframe
     * @param val - Text value to enter
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @param timeout - Wait timeout in milliseconds (default: 90000)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoIFrameTextboxByXPath('payment-frame', '//input[@id="card"]', '1234');
     */
    async enterValueIntoIFrameTextboxByXPath(iFrameName: string, xpath: string, val: string, shouldTabOut: boolean = false, timeout: number = 90000){
        const element = await this.pageElement.getVisibleIFrameElementByXPath(iFrameName, xpath, true, timeout);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }

    /**
     * Enters value into specific textbox when multiple match XPath
     * 
     * WHAT: Selects Nth visible element matching XPath, fills value.
     * WHEN: Use when XPath matches multiple inputs.
     * HOW: Gets indexed visible element, fills with optional Tab.
     * 
     * @param index - Zero-based index of element to fill
     * @param xpath - XPath matching multiple inputs
     * @param val - Text value to enter
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoIndexedTextboxByXPath(1, '//input[@type="text"]', 'Second input');
     */
    async enterValueIntoIndexedTextboxByXPath(index: number, xpath: string, val: string, shouldTabOut: boolean = false){
        const element = await this.pageElement.getIndexedVisibleElement(index, xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }
    /**
     * Enters value into input textbox by ID attribute
     * 
     * WHAT: Locates input by ID, fills value, optionally tabs out.
     * WHEN: Use for inputs with unique ID attribute.
     * HOW: Constructs XPath for input with ID, fills value.
     * 
     * @param inputId - ID attribute value
     * @param val - Text value to enter (number or string)
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextbox('email-input', 'user@example.com', true);
     */
    async enterValueIntoTextbox(inputId: string, val: number | string, shouldTabOut: boolean = false){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        //fixture.logger.info(`locatorPath value is ${locatorPath}`);
        const ele = this.page.locator(locatorPath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }

    /**
     * Enters value into sibling textbox following parent element
     * 
     * WHAT: Finds sibling element after parent, fills value.
     * WHEN: Use for label-input pairs or related field patterns.
     * HOW: Locates sibling by type and index, fills with optional Tab.
     * 
     * @param val - Text value to enter
     * @param parentElement - Parent/reference element
     * @param siblingNodeType - HTML tag of sibling (e.g., 'input', 'div')
     * @param siblingIndex - Which sibling of type (default: 1 = first)
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @returns Promise<void>
     * 
     * @example
     * const label = await page.locator('label:has-text("Name")');
     * await dataWriter.enterValueIntoSiblingTextbox('John Doe', label, 'input');
     */
    async enterValueIntoSiblingTextbox(val: number | string, parentElement: Locator, siblingNodeType: string, siblingIndex: number = 1, shouldTabOut: boolean = false){
        const siblingLocatorXPath = `./following-sibling::${siblingNodeType}[${siblingIndex.toString()}]`;
        const ele = parentElement.locator(siblingLocatorXPath)
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }

    /**
     * Enters value into specific textbox when multiple share same ID
     * 
     * WHAT: Selects Nth element matching ID, fills value.
     * WHEN: Use when multiple inputs incorrectly share ID.
     * HOW: Constructs XPath with ID, selects by index, fills.
     * 
     * @param index - Zero-based index (0 = first)
     * @param inputId - Shared id attribute value
     * @param val - Text value to enter
     * @param shouldTabOut - Press Tab after filling (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoIndexedTextbox(1, 'input-field', 'Second field', true);
     */
    async enterValueIntoIndexedTextbox(index: number, inputId: string, val: number | string, shouldTabOut: boolean = false){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        //fixture.logger.info(`indexed locatorPath value is ${locatorPath}`);
        const ele = this.page.locator(locatorPath).nth(index);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }
    /**
     * Enters value into textbox by data-testid attribute
     * 
     * @param txtBoxTestId - data-testid attribute value
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxByTestId('email-input', 'user@example.com', true);
     */
    async enterValueIntoTextboxByTestId(txtBoxTestId: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByTestId(txtBoxTestId);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into textbox within test-id container by role
     * 
     * @param txtBoxTestId - Parent data-testid
     * @param value - Text to enter
     * @param shouldPressEnter - Press Enter after (default: true)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxByTestIdAndRole('search-container', 'query');
     */
    async enterValueIntoTextboxByTestIdAndRole(txtBoxTestId: string, value: string, shouldPressEnter: boolean = true){
        const element = this.page.getByTestId(txtBoxTestId).getByRole(HtmlRoles.TEXT_BOX);
        if(shouldPressEnter)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.ENTER);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into textbox by placeholder attribute
     * 
     * @param placeholderText - Placeholder text
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxByPlaceholder('Enter email', 'user@example.com');
     */
    async enterValueIntoTextboxByPlaceholder(placeholderText: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByPlaceholder(placeholderText);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into child textbox by placeholder within parent
     * 
     * @param parentElementXPath - Parent XPath
     * @param placeholderText - Placeholder of child input
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoChildTextboxByPlaceholder('//div[@id="form"]', 'Email', 'user@example.com');
     */
    async enterValueIntoChildTextboxByPlaceholder(parentElementXPath: string, placeholderText: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.locator(parentElementXPath).getByPlaceholder(placeholderText);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }
    /**
     * Enters value into textbox by associated label
     * 
     * @param labelText - Label text
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @param isExact - Exact label match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxByLabel('Email Address', 'user@example.com', true);
     */
    async enterValueIntoTextboxByLabel(labelText: string, value: string, shouldTabOut: boolean = false, isExact: boolean = false){
        const element = this.page.getByLabel(labelText, {exact: isExact});
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into textbox within table row
     * 
     * @param rowName - Accessible row name
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxInATableRow('Product A', '100');
     */
    async enterValueIntoTextboxInATableRow(rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).getByRole(HtmlRoles.TEXT_BOX);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into element within table row by XPath
     * 
     * @param xpath - XPath within row (must be input-compatible)
     * @param rowName - Accessible row name
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * Note: XPath must correspond to fillable element (input/textarea).
     * 
     * @example
     * await dataWriter.enterValueIntoTextboxInATableRowByXPath('.//input[@type="number"]', 'Product A', '50');
     */
    async enterValueIntoTextboxInATableRowByXPath(xpath: string, rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).locator(xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into specific textbox in table row when multiple exist
     * 
     * @param index - Zero-based index of textbox in row
     * @param rowName - Accessible row name
     * @param value - Text to enter
     * @param shouldTabOut - Press Tab after (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoIndexedTextboxInATableRow(1, 'Product A', 'Value');
     */
    async enterValueIntoIndexedTextboxInATableRow(index: number, rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).getByRole(HtmlRoles.TEXT_BOX).nth(index);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Enters value into textarea by name attribute
     * 
     * @param txtAreaInputName - Textarea name attribute
     * @param val - Text to enter
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextAreaByName('comments', 'This is a comment');
     */
    async enterValueIntoTextAreaByName(txtAreaInputName: string, val: string){
        const locatorPath = `//${HtmlRoles.TEXT_AREA}[@name='${txtAreaInputName}']`;
        const element = this.page.locator(locatorPath);
        await element.fill(val);
    }
    
    /**
     * Enters value into textarea by ID attribute
     * 
     * @param txtAreaInputId - Textarea id attribute
     * @param val - Text to enter
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.enterValueIntoTextAreaById('description', 'Product description here');
     */
    async enterValueIntoTextAreaById(txtAreaInputId: string, val: string){
        const locatorPath = `//${HtmlRoles.TEXT_AREA}[@id='${txtAreaInputId}']`;
        const element = this.page.locator(locatorPath);
        await element.fill(val);
    }

    /**
     * Selects dropdown option by role
     * 
     * WHAT: Finds option by role and name, force clicks it.
     * WHEN: Use for accessible dropdown options.
     * HOW: Locates option by role, clicks with force flag.
     * 
     * @param optionName - Option accessible name
     * @returns Promise<void>
     * 
     * Note: Uses force click to handle scrollbar visibility issues.
     * 
     * @example
     * await dataWriter.selectOption('United States');
     */
    async selectOption(optionName: string){
        //TODO: handle scrollbar to make the option visible
        const element = this.page.getByRole(HtmlRoles.OPTION, { name: optionName });
        await element.click({ force: true });
    }

    /**
     * Selects dropdown option by parent label
     * 
     * WHAT: Finds dropdown by label, selects option by value.
     * WHEN: Use for standard HTML <select> with label.
     * HOW: Uses getByLabel() then selectOption().
     * 
     * @param dropdownLabel - Label text for dropdown
     * @param optionName - Option value or text
     * @returns Promise<void>
     * 
     * @example
     * await dataWriter.selectLabelledDropdownOption('Country', 'USA');
     */
    async selectLabelledDropdownOption(dropdownLabel: string, optionName: string){
        await this.page.getByLabel(dropdownLabel).selectOption(optionName);
    }
    /**
     * Selects dropdown option with search functionality
     * 
     * WHAT: Fills search text in dropdown, then selects option.
     * WHEN: Use for searchable dropdowns (autocomplete, combobox).
     * HOW: Clicks dropdown, fills filter text, selects by text or Enter.
     * 
     * @param dropdownElement - Dropdown element locator
     * @param optionText - Text to filter options
     * @param optionSearchText - Specific text to click (default: "" = press Enter for first result)
     * @returns Promise<void>
     * 
     * Behavior:
     *   - If optionSearchText empty: Selects first filtered result via Enter
     *   - If optionSearchText provided: Clicks element with that text
     * 
     * @example
     * const dropdown = await page.locator('#country-select');
     * await dataWriter.selectDropdownOption(dropdown, 'United', 'United States');
     */
    async selectDropdownOption(dropdownElement: Locator, optionText: string, optionSearchText: string = ""){
        await this.clickDropdownOption(dropdownElement, optionText);
        if(optionSearchText.length == 0)
            await dropdownElement.press(KeyBoardItems.ENTER);
        else{
            await this.page.getByText(optionSearchText).click();
        }
    }

    /**
     * Clicks dropdown and fills search text with delay
     * 
     * WHAT: Opens dropdown, waits, fills filter text, waits again.
     * WHEN: Used internally for searchable dropdowns.
     * HOW: Clicks dropdown, delays 1s, fills text, delays 1s.
     * 
     * @param dropdownElement - Dropdown to open
     * @param optionText - Filter text to enter
     * @returns Promise<void>
     * 
     * Note: Delays allow dropdown panel to render and filter results.
     */
    async clickDropdownOption(dropdownElement: Locator, optionText: string){
        //await dropdownElement.fill(optionText);
        await dropdownElement.click();
        await this.common.delay(1000);
        await dropdownElement.fill(optionText);
        await this.common.delay(1000);
    }

    /**
     * Selects dropdown option with two-stage search
     * 
     * WHAT: Filters by first text, then clicks second specific text.
     * WHEN: Use when initial filter shows multiple results needing refinement.
     * HOW: Fills first filter, waits for results, fills second filter, presses Enter.
     * 
     * @param dropdownElement - Dropdown element
     * @param optionTextToFilter - Initial search text
     * @param optionTextToSelect - Specific option text to select
     * @returns Promise<void>
     * 
     * @example
     * const dropdown = await page.locator('#city-select');
     * await dataWriter.selectDropdownOptionWithAdditionalSearch(dropdown, 'New', 'New York');
     */
    async selectDropdownOptionWithAdditionalSearch(dropdownElement: Locator, optionTextToFilter: string, optionTextToSelect: string){
        await dropdownElement.click();
        await dropdownElement.fill(optionTextToFilter);
        await this.common.delay(1000);
        this.page.getByLabel(HtmlRoles.OPTIONS_LIST).getByText(optionTextToSelect);
        await dropdownElement.press(KeyBoardItems.ENTER);
    }

    /**
     * **WHAT:** Selects an option from an Angular ng-select dropdown that has no accessible name, label, or test ID
     * 
     * **WHEN TO USE:**
     * - Working with unnamed Angular dropdowns identified only by their default displayed text
     * - Multiple similar dropdowns exist and you need to target by index
     * - The dropdown label is not available but the default option text is visible
     * 
     * **HOW IT WORKS:**
     * 1. Locates ng-select element by matching text of the default displayed option
     * 2. Uses element index if multiple matches exist (0-based indexing)
     * 3. Clicks dropdown to open options panel
     * 4. Selects desired option by role and name
     * 
     * @param defaultDropdownOption - The text displayed in the dropdown before opening (e.g., "Select Country", "Choose Status")
     * @param optionToSelect - The exact text of the option to select from the dropdown list
     * @param [elementIndex=0] - Zero-based index when multiple dropdowns show the same default text
     * 
     * @example
     * // In Page Object (when dropdown has no label)
     * async selectCountryWithoutLabel(country: string, dropdownIndex: number = 0) {
     *   await this.dataWriter.selectOptionFromAngularDropdownHavingNoName(
     *     "Select Country", // Default text shown
     *     country,
     *     dropdownIndex
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects {string} from the unnamed status dropdown', async (status: string) => {
     *   await addressPage.selectStatusWithoutLabel(status);
     * });
     * // Result: Finds dropdown showing "Select Status", clicks it, selects "Active"
     */
    async selectOptionFromAngularDropdownHavingNoName(defaultDropdownOption: string, optionToSelect: string, elementIndex: number = 0): Promise<void>{
        const dropdown = await this.pageElement.getElementHavingText(AngularElements.ng_select, defaultDropdownOption, elementIndex);
        await dropdown.click();
        await this.page.getByRole(HtmlRoles.OPTION, {name: optionToSelect}).click();
    }
    /**
     * **WHAT:** Selects an option from a searchable Angular ng-select dropdown using filtering and text search
     * 
     * **WHEN TO USE:**
     * - Working with Angular Material ng-select dropdowns that support search/filter
     * - Need to filter options before selecting (useful for large dropdown lists)
     * - Want to verify specific text appears in the filtered results
     * 
     * **HOW IT WORKS:**
     * 1. Locates ng-select dropdown by its label/container text
     * 2. Types the filter text to narrow down options
     * 3. Selects from filtered results using optionSearchText (or first result if empty)
     * 4. Uses underlying selectDropdownOption helper for the selection logic
     * 
     * @param dropdownText - The label or text identifying the ng-select dropdown (e.g., "Country", "Status")
     * @param optionText - Text to type for filtering/searching dropdown options
     * @param [optionSearchText=""] - Specific text to match in filtered results; if empty, selects first filtered result
     * 
     * @example
     * // In Page Object
     * async selectCountryBySearch(searchTerm: string, exactCountry: string = "") {
     *   await this.dataWriter.selectAngularDropdownOption(
     *     "Country",     // Dropdown label
     *     searchTerm,    // "Uni" (filters to United States, United Kingdom)
     *     exactCountry   // "United States" or "" for first result
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user searches and selects {string} from country dropdown', async (country: string) => {
     *   await registrationPage.selectCountryBySearch(country);
     * });
     * // Result: Types "India", filters options, selects "India" from results
     */
    async selectAngularDropdownOption(dropdownText: string, optionText: string, optionSearchText: string = ""){
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.selectDropdownOption(element, optionText, optionSearchText);
    }

    /**
     * **WHAT:** Selects an option from Angular ng-select by locating option within the ng-dropdown-panel, with retry logic for timeout scenarios
     * 
     * **WHEN TO USE:**
     * - Angular dropdowns where options are rendered in ng-dropdown-panel with specific HTML structure
     * - Need to handle delayed/slow dropdown panel rendering
     * - Options are contained in specific HTML elements (p, div, span)
     * - Standard selection methods fail due to timing issues
     * 
     * **HOW IT WORKS:**
     * 1. Locates searchable ng-select dropdown by label text
     * 2. Clicks dropdown to open panel and types filter text
     * 3. Constructs XPath to find option within ng-dropdown-panel using container element
     * 4. If timeout occurs, retries with alternative approach: clears input, retypes with delays, waits for panel visibility
     * 5. Clicks the located option element
     * 
     * **BEHAVIOR:** Includes robust error handling with fallback strategy for flaky Angular dropdowns
     * 
     * @param dropdownText - Label or identifying text of the ng-select dropdown
     * @param optionText - Text to type for filtering options in the searchable dropdown
     * @param [optionSearchText=""] - Specific text to locate in panel; defaults to optionText if empty
     * @param [optionContainerElement='p'] - HTML tag containing option text in ng-dropdown-panel (e.g., 'p', 'div', 'span')
     * 
     * @example
     * // In Page Object (when standard methods fail)
     * async selectDepartmentWithRetry(department: string) {
     *   await this.dataWriter.selectAngularDropdownOptionFromPanel(
     *     "Department",  // Dropdown label
     *     department,    // "Engineering"
     *     "",            // Use same text for search
     *     "div"          // Options are in <div> tags
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects {string} from slow-loading department dropdown', async (dept: string) => {
     *   await employeePage.selectDepartmentWithRetry(dept);
     * });
     * // Result: Opens dropdown, types "HR", waits for panel, clicks <div>HR</div>
     * // If timeout: Retries with delays and explicit visibility waits
     */
    async selectAngularDropdownOptionFromPanel(dropdownText: string, optionText: string, optionSearchText: string = "", optionContainerElement: string = 'p'){
        fixture.logger.info(`entering selectAngularDropdownOptionFromPanel`);
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        // const element = this.page.locator(AngularElements.ng_select)
        //                     .filter({ hasText: dropdownText }).locator('input');            
        //                     //.filter({ hasText: dropdownText }).getByRole(HtmlRoles.TEXT_BOX);
        //                     //.filter({ hasText: dropdownText }).getByRole(HtmlRoles.COMBOBOX);
        await this.clickDropdownOption(element, optionText);
        if(optionSearchText.length == 0)
            optionSearchText = optionText.trim();
        try{
        //const optionXPath = `//ng-dropdown-panel//p[contains(.,'${optionSearchText}')]`;
        const optionXPath = `//${AngularElements.dropdown_panel}//${optionContainerElement}[contains(.,'${optionSearchText}')]`;
        await this.page.locator(optionXPath).click();
        }catch(err){
            fixture.logger.error(`err message is...${err.message}`);
            fixture.logger.error(`err name is...${err.name}`);
            if(err.name === PageConstants.TIMEOUT_ERROR || err.message.includes("Timeout"))
            {
                fixture.logger.info(`trying other ways as timeout error occurred`);
                //it is observed sometimes the dropdown with options is not displayed so we will try again
                // Get the input element within ng-select
                const input = this.page.locator('input[role="combobox"][type="text"]');
                
                // Clear existing value if any
                await input.clear();
                await this.common.delay(1000);
                // Type the text with small delays between characters
                await input.type(optionText, { delay: 100 });
                
                // Ensure dropdown panel is open
                await this.page.waitForSelector('ng-dropdown-panel', { 
                state: 'visible',
                timeout: 5000
                });
                
                // Wait for and click the filtered option
                const option = this.page.locator('ng-dropdown-panel .ng-option', {
                hasText: optionText
                });
                await option.waitFor({ state: 'visible' });
                await option.click();
                await this.common.delay(1000);   
            }
        }
    }
    /**
     * **WHAT:** Opens an Angular ng-select dropdown and types filter text without selecting an option (returns the dropdown element for further interaction)
     * 
     * **WHEN TO USE:**
     * - Need to open dropdown and filter options but select later
     * - Want to inspect or interact with the dropdown panel before selecting
     * - Building complex selection workflows that require intermediate steps
     * 
     * **HOW IT WORKS:**
     * 1. Locates searchable ng-select dropdown by label text
     * 2. Clicks to open the dropdown panel
     * 3. Types the filter text to narrow down options
     * 4. Returns the dropdown locator element for further actions
     * 
     * @param dropdownText - Label or identifying text of the ng-select dropdown
     * @param optionText - Text to type for filtering the dropdown options
     * 
     * @returns Promise<Locator> - The dropdown element locator for subsequent interactions
     * 
     * @example
     * // In Page Object (complex workflow)
     * async filterAndValidateOptions(category: string, filterText: string): Promise<boolean> {
     *   const dropdown = await this.dataWriter.clickAngularDropdownOption("Category", filterText);
     *   // Now can validate filtered options before selecting
     *   const optionsVisible = await this.page.locator('ng-dropdown-panel .ng-option').count();
     *   return optionsVisible > 0;
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user opens and filters {string} dropdown with {string}', async (dropdownName: string, filter: string) => {
     *   await productPage.openAndFilterDropdown(dropdownName, filter);
     * });
     * // Result: Opens dropdown, types "Electronics", returns element (no selection yet)
     */
    async clickAngularDropdownOption(dropdownText: string, optionText: string): Promise<Locator>{
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.clickDropdownOption(element, optionText);
        return element;
    }
    
    /**
     * **WHAT:** Selects an option from Angular ng-select using two-step filtering (primary filter, then secondary refinement)
     * 
     * **WHEN TO USE:**
     * - Dropdown has nested categories or hierarchical options
     * - Initial search returns multiple similar results needing refinement
     * - Need to filter by broad category first, then select specific item
     * 
     * **HOW IT WORKS:**
     * 1. Locates ng-select dropdown by label text
     * 2. Types primary filter text to narrow down category
     * 3. Types secondary filter text to further refine results
     * 4. Selects the final option matching both filters
     * 
     * @param dropdownText - Label or identifying text of the ng-select dropdown
     * @param primaryOptionText - Initial filter text (e.g., "United" for countries starting with "United")
     * @param secondaryOptionText - Refinement filter text (e.g., "States" to select "United States" specifically)
     * 
     * @example
     * // In Page Object
     * async selectSpecificLocation(dropdownLabel: string, region: string, country: string) {
     *   await this.dataWriter.selectAngularDropdownOptionWithAdditionalSearch(
     *     dropdownLabel,
     *     region,   // "North" (filters North America, North Europe)
     *     country   // "America" (selects North America)
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects {string} country by filtering {string} then {string}', async (country: string, filter1: string, filter2: string) => {
     *   await addressPage.selectCountryWithDoubleFilter(country, filter1, filter2);
     * });
     * // Result: Types "United", then "Kingdom", selects "United Kingdom"
     */
    async selectAngularDropdownOptionWithAdditionalSearch(dropdownText: string, primaryOptionText: string, secondaryOptionText: string){
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.selectDropdownOptionWithAdditionalSearch(element, primaryOptionText, secondaryOptionText);
    }
    /**
     * **WHAT:** Clicks the first Angular Material checkbox (mat-checkbox) on the page
     * 
     * **WHEN TO USE:**
     * - Page has only one mat-checkbox element
     * - Need to toggle the first checkbox without identifying by label or index
     * - Working with simple forms containing a single checkbox
     * 
     * **HOW IT WORKS:**
     * - Locates mat-checkbox element and clicks it (toggles checked state)
     * 
     * **BEHAVIOR:** Does not verify current state; simply clicks to toggle
     * 
     * @example
     * // In Page Object
     * async acceptTermsAndConditions() {
     *   await this.dataWriter.selectAngularCheckboxOption();
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user accepts the terms checkbox', async () => {
     *   await registrationPage.acceptTermsAndConditions();
     * });
     * // Result: Clicks the mat-checkbox element (toggles from unchecked to checked or vice versa)
     */
    async selectAngularCheckboxOption(){
        await this.page.locator(AngularElements.matCheckbox).click();
    }

    /**
     * **WHAT:** Clicks a specific Angular Material checkbox by its zero-based index when multiple mat-checkboxes exist
     * 
     * **WHEN TO USE:**
     * - Multiple mat-checkbox elements on the page
     * - Need to select a checkbox by position rather than label
     * - Checkboxes don't have unique identifiers or labels
     * 
     * **HOW IT WORKS:**
     * - Locates all mat-checkbox elements
     * - Selects the checkbox at the specified index (0-based)
     * - Clicks to toggle its checked state
     * 
     * @param index - Zero-based index of the checkbox to click (0 = first, 1 = second, etc.)
     * 
     * @example
     * // In Page Object
     * async selectPreference(preferenceIndex: number) {
     *   await this.dataWriter.selectIndexedAngularCheckboxOption(preferenceIndex);
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects the {int} preference checkbox', async (index: number) => {
     *   await settingsPage.selectPreference(index - 1); // Convert 1-based to 0-based
     * });
     * // Result: Clicks the 2nd mat-checkbox element (index 1)
     */
    async selectIndexedAngularCheckboxOption(index: number){
        await this.page.locator(AngularElements.matCheckbox).nth(index).click();
    }
    /**
     * **WHAT:** Selects an option from a searchable dropdown located within a specific table cell
     * 
     * **WHEN TO USE:**
     * - Dropdown is embedded within a table cell (not standalone)
     * - Need to target dropdown by the table cell's name/header
     * - Working with data grids or editable tables with inline dropdowns
     * 
     * **HOW IT WORKS:**
     * 1. Locates table cell by its name (column header or cell text)
     * 2. Finds the textbox/combobox role within that cell
     * 3. Uses selectDropdownOption to filter and select the desired option
     * 
     * @param cellName - The name/text identifying the table cell (often column header)
     * @param optionText - The text to type for filtering and selecting the dropdown option
     * @param [exactCellName=false] - Whether to match cellName exactly (true) or partially (false)
     * 
     * @example
     * // In Page Object
     * async selectCategoryInRow(category: string, exactMatch: boolean = false) {
     *   await this.dataWriter.selectDropdownOptionInATabelCell(
     *     "Category",  // Column header
     *     category,    // "Electronics"
     *     exactMatch
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects {string} from the category dropdown in the table', async (category: string) => {
     *   await dataGridPage.selectCategoryInRow(category);
     * });
     * // Result: Finds "Category" cell, opens dropdown, types "Food", selects matching option
     */
    async selectDropdownOptionInATabelCell(cellName: string, optionText: string, exactCellName: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: `${cellName}`, exact: exactCellName }).getByRole(HtmlRoles.TEXT_BOX);
        await this.selectDropdownOption(element, optionText);
    }

    /**
     * **WHAT:** Selects an option from a table cell dropdown using two-step filtering (primary filter, then secondary refinement)
     * 
     * **WHEN TO USE:**
     * - Dropdown in table cell has hierarchical or nested options
     * - Initial filter returns multiple similar results needing refinement
     * - Need category-based filtering within table inline dropdowns
     * 
     * **HOW IT WORKS:**
     * 1. Locates table cell by its name (exact or partial match)
     * 2. Finds textbox/combobox within that cell
     * 3. Types primary filter text to narrow category
     * 4. Types secondary filter text to refine selection
     * 5. Selects final option matching both filters
     * 
     * @param cellName - The name/text identifying the table cell (column header or cell identifier)
     * @param optionTextToFilter - Initial filter text (e.g., "North" for North American locations)
     * @param optionTextToSelect - Refinement filter text (e.g., "Canada" to select "North Canada")
     * @param [exactCellName=false] - Whether to match cellName exactly (true) or partially (false)
     * 
     * @example
     * // In Page Object
     * async selectLocationInTableWithDoubleFilter(region: string, country: string) {
     *   await this.dataWriter.selectDropdownOptionInATabelCellWithAdditionalSearch(
     *     "Location",  // Column name
     *     region,      // "South" (filters South America, South Asia)
     *     country,     // "America" (selects South America)
     *     true         // Exact column name match
     *   );
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user selects location {string} by filtering {string} in the table', async (location: string, filter: string) => {
     *   await inventoryPage.selectTableLocation(filter, location);
     * });
     * // Result: In "Location" cell, types "United", then "Kingdom", selects "United Kingdom"
     */
    async selectDropdownOptionInATabelCellWithAdditionalSearch(cellName: string, optionTextToFilter: string, optionTextToSelect: string, exactCellName: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: `${cellName}`, exact: exactCellName }).getByRole(HtmlRoles.TEXT_BOX);
        await this.selectDropdownOptionWithAdditionalSearch(element, optionTextToFilter, optionTextToSelect);
    }

    /**
     * **WHAT:** Checks (marks) a checkbox identified by its associated label text
     * 
     * **WHEN TO USE:**
     * - Checkbox has a clear label association
     * - Need to ensure checkbox is checked (not toggled)
     * - Working with standard HTML checkboxes (input type="checkbox")
     * 
     * **HOW IT WORKS:**
     * 1. Locates checkbox element by its label text
     * 2. Calls Playwright's .check() method
     * 3. Ensures checkbox is in checked state (idempotent operation)
     * 
     * **BEHAVIOR:** Only checks if unchecked; does nothing if already checked
     * 
     * @param labelName - The visible label text associated with the checkbox (e.g., "I agree to terms", "Remember me")
     * 
     * @example
     * // In Page Object
     * async agreeToTerms() {
     *   await this.dataWriter.checkCheckboxByLabel("I agree to the terms and conditions");
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user checks the {string} checkbox', async (label: string) => {
     *   await formPage.checkOption(label);
     * });
     * // Result: Finds checkbox with label "Subscribe to newsletter", checks it if unchecked
     */
    async checkCheckboxByLabel(labelName: string){
        const element = await this.pageElement.getElementByLabel(labelName);
        //await element.waitFor({state: "visible"});
        await element.check();
    }

    /**
     * **WHAT:** Checks a checkbox located by XPath, only if it is currently unchecked
     * 
     * **WHEN TO USE:**
     * - Checkbox lacks a label or unique identifier
     * - Need to use custom XPath for complex DOM structures
     * - Want conditional checking (only check if unchecked)
     * 
     * **HOW IT WORKS:**
     * 1. Locates checkbox using the provided XPath
     * 2. Verifies current checked state with .isChecked()
     * 3. Only calls .check() if checkbox is currently unchecked
     * 
     * **BEHAVIOR:** Prevents unnecessary interactions; safe to call multiple times
     * 
     * @param xpath - The XPath selector to locate the checkbox element (e.g., "//input[@id='newsletter']")
     * 
     * @example
     * // In Page Object
     * async enableNotifications() {
     *   const notificationCheckboxXPath = "//div[@class='settings']//input[@type='checkbox'][1]";
     *   await this.dataWriter.checkCheckBox(notificationCheckboxXPath);
     * }
     * 
     * @example
     * // In Test/Step Definition
     * When('user enables the notifications setting', async () => {
     *   await settingsPage.enableNotifications();
     * });
     * // Result: Locates checkbox by XPath, checks it only if it's currently unchecked
     */
    async checkCheckBox(xpath: string){
        const element = this.page.locator(xpath);
        if(!await element.isChecked())
            await element.check();
    }
}