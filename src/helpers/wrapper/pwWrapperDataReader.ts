/**
 * @file Data Reading Wrapper for Playwright
 * 
 * WHAT this file provides:
 * This wrapper encapsulates Playwright's data extraction APIs, providing simplified methods for reading
 * text content, input values, and element states from web pages. It handles various element location
 * strategies (ID, TestID, XPath, text, siblings) and data types (text, input values, visibility).
 * 
 * WHY this wrapper exists:
 * - Simplifies data extraction with semantic method names
 * - Provides consistent interface for reading from different element types
 * - Handles visibility checks automatically before reading data
 * - Centralizes text extraction logic (textContent vs innerText)
 * - Supports iframe data reading without complex frameLocator code
 * - Reduces boilerplate in Page Objects and test assertions
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Core Wrapper Layer (data reading operations)
 * - Used by: Page Objects for data extraction, Step Definitions for assertions
 * - Dependencies: PlaywrightWrapperCommon, PlaywrightWrapperPageElement
 * - Position: Specialized wrapper for read-only operations
 * 
 * WHEN tests should use this wrapper:
 * - When extracting text from labels, divs, spans, or other display elements
 * - When reading input field values for validation
 * - When verifying dropdown selections
 * - When checking element text content in assertions
 * - For reading data from tables, forms, or dynamic content
 * - When extracting text from iframes
 * 
 * Key concepts:
 * - textContent: Returns ALL text including hidden elements and nested elements
 * - innerText: Returns only VISIBLE text, respecting CSS display properties
 * - inputValue: Returns value attribute of input/textarea/select elements
 */

import { Locator, Page, expect } from "@playwright/test";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";

/**
 * PlaywrightWrapperDataReader class
 * 
 * RESPONSIBILITY:
 * Provides methods for extracting text, values, and state information from web page elements.
 * Handles different element location strategies and data extraction patterns with consistent error handling.
 * 
 * PLAYWRIGHT FEATURES ENCAPSULATED:
 * - locator.textContent() - Gets all text including hidden elements
 * - locator.innerText() - Gets visible text only
 * - locator.inputValue() - Gets value from input fields
 * - locator.isVisible() - Checks element visibility
 * - page.getByText(), getByTestId(), locator() - Element location
 * - frameLocator() - Iframe element access
 * 
 * DATA EXTRACTION PATTERNS:
 * - By ID: getElementTextById(), getTextboxValue()
 * - By TestID: getElementTextByTestId()
 * - By Text: getElementText()
 * - By XPath: getElementTextByXPath(), getInputFieldValueByXPath()
 * - By Sibling: getSiblingElementText()
 * - From Iframe: getIFrameFieldValueByRole(), getIFrameFieldValueByXPath()
 * 
 * WHEN TO USE:
 * - Use for all data extraction and validation operations
 * - Use in Page Object getter methods
 * - Use before assertions to retrieve actual values
 * - Use instead of direct locator.textContent() or inputValue() calls
 */
export default class PlaywrightWrapperDataReader {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    /**
     * Gets the current value from an input textbox by its ID attribute
     * 
     * WHAT: Retrieves the value attribute from an input element identified by ID.
     * WHEN: Use to read current text entered in input fields (textbox, email, password, number, etc.).
     * HOW: Constructs XPath for input element with specified ID, then extracts inputValue.
     * 
     * @param inputId - The ID attribute value of the input element
     *   Parameter Type: string (required)
     *   
     *   Element Requirements:
     *     - Must be an <input> element
     *     - Must have id attribute matching inputId
     *     - Works with: text, email, password, number, tel, url, search input types
     *   
     *   When to use:
     *     - Reading user-entered data from form fields
     *     - Validating pre-filled form values
     *     - Checking default input values
     * 
     * @returns Promise<string> - The current value of the input field
     * 
     * @example
     * // Read email field value
     * const email = await dataReader.getTextboxValue('email-input');
     * expect(email).toBe('user@example.com');
     * 
     * @example
     * // In Page Object - get username
     * async getUsername(): Promise<string> {
     *   return await this.wrapper.dataReader.getTextboxValue('username');
     * }
     */
    async getTextboxValue(inputId: string){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        return await this.page.locator(locatorPath).inputValue();
    }

    /**
     * PRIVATE: Gets text from element only if visible, returns empty string if not visible
     * 
     * WHAT: Internal helper that checks visibility before extracting text.
     * WHEN: Used by public methods to safely extract text without errors.
     * HOW: Checks isVisible(), then calls getLocatorText() if visible.
     */
    private async getElementTextValue(element: Locator){
        let result = "";
        if(element !== undefined && await element.isVisible())
            result = await this.getLocatorText(element);

        return result;
    }

    /**
     * PRIVATE: Extracts text content from locator including hidden child elements
     * 
     * WHAT: Gets textContent (includes all text, even from hidden elements).
     * WHEN: Used internally to extract text from visible elements.
     * HOW: Calls element.textContent() which returns all descendant text.
     * 
     * Note: textContent includes text from hidden elements and preserves whitespace.
     */
    private async getLocatorText(element: Locator): Promise<string>{
        return await element.textContent();
    }

    /**
     * Gets text content from element located by its visible text
     * 
     * WHAT: Finds element containing specified text and returns its full text content.
     * WHEN: Use when you know part or all of the text an element contains.
     * HOW: Uses getByText() to locate element, then extracts text if visible.
     * 
     * @param searchText - Text to search for within elements
     *   Parameter Type: string (required)
     *   
     *   Search Behavior:
     *     - Partial match by default (finds "Submit" in "Submit Form")
     *     - Case-sensitive
     *     - Searches visible text only
     *   
     * @param exact - Whether to match text exactly
     *   Parameter Type: boolean (default: false)
     *   Default: false (partial match)
     *   
     *   When exact=false: "Total" matches "Total: $100"
     *   When exact=true: "Total" only matches "Total", not "Total: $100"
     * 
     * @returns Promise<string> - Element's text content, or empty string if not visible
     * 
     * @example
     * // Get element containing "Total"
     * const totalText = await dataReader.getElementText('Total');
     * // Returns "Total: $150.00"
     * 
     * @example
     * // Exact match
     * const label = await dataReader.getElementText('Username', true);
     */
    async getElementText(searchText: string, exact: boolean = false): Promise<string>{
        const element = this.page.getByText(searchText, {exact: exact});
        return await this.getElementTextValue(element);
    }

    /**
     * Gets text from sibling element following a parent element
     * 
     * WHAT: Locates a sibling element after parent element and extracts its text.
     * WHEN: Use for reading values in label-value pairs or table row data.
     * HOW: Uses XPath following-sibling axis to find sibling by type and position.
     * 
     * @param parentElement - Reference element (starting point)
     *   Parameter Type: Locator (required)
     *   
     *   Usage: The element whose sibling you want to find
     *   Example: A label element, then read sibling input or div
     * 
     * @param siblingNodeType - HTML tag name of sibling to find
     *   Parameter Type: string (required)
     *   
     *   Common Values: 'div', 'span', 'input', 'td', 'p'
     *   Case-sensitive: Use lowercase for HTML elements
     * 
     * @param siblingIndex - Which sibling of this type to select
     *   Parameter Type: number (default: 1)
     *   Default: 1 (first sibling of specified type)
     *   
     *   1 = first sibling of type
     *   2 = second sibling of type
     *   3 = third sibling of type, etc.
     * 
     * @returns Promise<string> - Sibling element's text, or empty string if not visible
     * 
     * @example
     * // HTML: <label>Name:</label><span>John Doe</span>
     * const label = await page.locator('label:has-text("Name")');
     * const name = await dataReader.getSiblingElementText(label, 'span');
     * // Returns "John Doe"
     * 
     * @example
     * // Multiple siblings: <div>Label</div><span>Value1</span><span>Value2</span>
     * const div = await page.locator('div');
     * const value2 = await dataReader.getSiblingElementText(div, 'span', 2);
     */
    async getSiblingElementText(parentElement: Locator, siblingNodeType: string, siblingIndex: number = 1): Promise<string>{
        const siblingLocatorXPath = `./following-sibling::${siblingNodeType}[${siblingIndex.toString()}]`;
        const element = parentElement.locator(siblingLocatorXPath)
        return await this.getElementTextValue(element);
    }

    /**
     * Gets text content from element located by ID attribute
     * 
     * WHAT: Finds element by ID and returns its text content.
     * WHEN: Use when element has unique ID attribute.
     * HOW: Uses pageElement.getElementById(), then extracts textContent.
     * 
     * @param id - Element's id attribute value
     * @returns Promise<string> - Element's text content
     * 
     * @example
     * const username = await dataReader.getElementTextById('user-display-name');
     */
    async getElementTextById(id: string): Promise<string>{
        const element = await this.pageElement.getElementById(id);
        return await this.getLocatorText(element);
    }

    /**
     * Gets text content from element located by data-testid attribute
     * 
     * WHAT: Finds element by test ID and returns its text content.
     * WHEN: Use when element has data-testid attribute (recommended for testing).
     * HOW: Uses getByTestId(), then extracts textContent.
     * 
     * @param txtBoxTestId - Element's data-testid attribute value
     * @returns Promise<string> - Element's text content
     * 
     * @example
     * const message = await dataReader.getElementTextByTestId('success-message');
     * expect(message).toContain('Success');
     */
    async getElementTextByTestId(txtBoxTestId: string): Promise<string>{
        const element = this.page.getByTestId(txtBoxTestId);
        return await this.getLocatorText(element);
    }

    /**
     * Gets text from element by ID, waiting for it to become visible first
     * 
     * WHAT: Waits for element with ID to be visible, then returns text.
     * WHEN: Use for dynamically loaded content that needs visibility wait.
     * HOW: Calls getVisibleElementById() with 60s timeout, then extracts text.
     * 
     * @param id - Element's id attribute value
     * @returns Promise<string> - Element's text content
     * 
     * @example
     * // Wait for success message to appear
     * const message = await dataReader.getVisibleElementTextById('success-msg');
     */
    async getVisibleElementTextById(id: string): Promise<string>{
        const element = await this.pageElement.getVisibleElementById(id, 60000);
        return await this.getLocatorText(element);
    }

    /**
     * Gets text from element by XPath with control over child element text inclusion
     * 
     * WHAT: Extracts text from XPath-located element, choosing between textContent and innerText.
     * WHEN: Use when you need precise control over hidden/visible text extraction.
     * HOW: Uses textContent for all text or innerText for visible text only.
     * 
     * @param xpath - XPath expression to locate element
     *   Parameter Type: string (required)
     *   
     * @param includeChildElementsText - Whether to include text from hidden child elements
     *   Parameter Type: boolean (required)
     *   
     *   When true: Uses textContent()
     *     - Includes ALL text from ALL descendants
     *     - Includes text from hidden elements (display:none)
     *     - Includes text from child elements
     *     - Preserves whitespace and newlines
     *   
     *   When false: Uses innerText()
     *     - Only VISIBLE text
     *     - Respects CSS display/visibility properties
     *     - Represents text as user sees it
     *     - Normalizes whitespace
     * 
     * @returns Promise<string> - Element's text content
     * 
     * @example
     * // Get all text including hidden spans
     * const fullText = await dataReader.getElementTextByXPath('//div[@id="content"]', true);
     * 
     * @example
     * // Get only visible text
     * const visibleText = await dataReader.getElementTextByXPath('//div[@id="content"]', false);
     */
    async getElementTextByXPath(xpath: string, includeChildElementsText: boolean): Promise<string>{
        if(includeChildElementsText)
            return await this.page.locator(xpath).textContent();
        else
            return await this.page.locator(xpath).innerText();
    }

    /**
     * Gets input field value by name attribute
     * 
     * WHAT: Retrieves value from input element with specified name attribute.
     * WHEN: Use for form inputs identified by name (common in traditional forms).
     * HOW: Constructs XPath for input with name, extracts inputValue.
     * 
     * @param name - The name attribute value of input element
     * @returns Promise<string> - Input field's current value
     * 
     * @example
     * const email = await dataReader.getInputFieldValueByName('email');
     */
    async getInputFieldValueByName(name: string): Promise<string>{
        const xPath = `//${HtmlRoles.INPUT}[@name='${name}']`;
        return await this.page.locator(xPath).inputValue();
    }

    /**
     * Gets input field value by XPath
     * 
     * WHAT: Retrieves value from input element located by XPath.
     * WHEN: Use for complex input location scenarios requiring XPath.
     * HOW: Locates element by XPath, then extracts inputValue.
     * 
     * @param xpath - XPath to locate input element
     * @returns Promise<string> - Input field's current value
     * 
     * @example
     * const value = await dataReader.getInputFieldValueByXPath('//input[@type="email"]');
     */
    async getInputFieldValueByXPath(xpath: string): Promise<string>{
        return await this.page.locator(xpath).inputValue();
    }

    /**
     * Gets value from specific input when multiple match XPath
     * 
     * WHAT: Retrieves value from Nth input matching XPath expression.
     * WHEN: Use when XPath matches multiple inputs and you need specific one.
     * HOW: Locates all matching inputs, selects by index, extracts value.
     * 
     * @param xpath - XPath matching multiple input elements
     * @param index - Zero-based index of input to read
     *   0 = first matching input
     *   1 = second matching input, etc.
     * 
     * @returns Promise<string> - Selected input field's value
     * 
     * @example
     * // Get second email input in form
     * const email2 = await dataReader.getIndexedInputFieldValueByXPath('//input[@type="email"]', 1);
     */
    async getIndexedInputFieldValueByXPath(xpath: string, index: number): Promise<string>{
        return await this.page.locator(xpath).nth(index).inputValue();
    }

    /**
     * Gets input value from iframe element by role and name
     * 
     * WHAT: Accesses iframe, finds element by ARIA role and accessible name, returns value.
     * WHEN: Use for inputs inside iframes with good accessibility attributes.
     * HOW: Uses frameLocator() with getByRole(), then extracts inputValue.
     * 
     * @param iframeName - The name attribute of the iframe
     * @param role - ARIA role (from HtmlRoles constants)
     * @param fieldName - Accessible name of the field
     * @returns Promise<string> - Input field value from iframe
     * 
     * @example
     * const value = await dataReader.getIFrameFieldValueByRole(
     *   'payment-iframe',
     *   HtmlRoles.TEXT_BOX,
     *   'Card Number'
     * );
     */
    async getIFrameFieldValueByRole(iframeName: string, role: any, fieldName: string): Promise<string>{
        return await this.page.frameLocator(`iframe[name="${iframeName}"]`).getByRole(role, { name: fieldName }).inputValue();
    }

    /**
     * Gets input value from iframe element by XPath
     * 
     * WHAT: Accesses iframe and retrieves value from element located by XPath.
     * WHEN: Use for inputs inside iframes when XPath is most reliable locator.
     * HOW: Uses pageElement.getIFrameElementByXPath(), then extracts inputValue.
     * 
     * @param iFrameName - The name attribute of the iframe
     * @param xpath - XPath within iframe to locate element
     * @returns Promise<string> - Input field value from iframe
     * 
     * @example
     * const cardNumber = await dataReader.getIFrameFieldValueByXPath(
     *   'payment-iframe',
     *   '//input[@id="card-number"]'
     * );
     */
    async getIFrameFieldValueByXPath(iFrameName: string, xpath: string): Promise<string>{
        const element = await this.pageElement.getIFrameElementByXPath(iFrameName, xpath);
        return element.inputValue();
    }

    /**
     * Gets value from specific iframe input when multiple match XPath
     * 
     * WHAT: Accesses iframe, finds Nth element matching XPath, returns value.
     * WHEN: Use when iframe has multiple inputs matching XPath.
     * HOW: Uses pageElement.getIndexedIFrameElementByXPath(), then extracts value.
     * 
     * @param iFrameName - The name attribute of the iframe
     * @param xpath - XPath within iframe (may match multiple elements)
     * @param index - Zero-based index of element to read
     * @returns Promise<string> - Selected input field value from iframe
     * 
     * @example
     * // Get second input in iframe
     * const value = await dataReader.getIndexedIFrameFieldValueByXPath(
     *   'form-iframe',
     *   '//input[@type="text"]',
     *   1
     * );
     */
    async getIndexedIFrameFieldValueByXPath(iFrameName: string, xpath: string, index: number): Promise<string>{
        const element = await this.pageElement.getIndexedIFrameElementByXPath(iFrameName, xpath, index);
        return element.inputValue();
    }

    /**
     * Validates that dropdown has expected value selected
     * 
     * WHAT: Asserts dropdown (select element) has specified option selected.
     * WHEN: Use to verify dropdown selection in test assertions.
     * HOW: Uses expect().toHaveValue() to assert selected value.
     * 
     * @param locator - The select/dropdown element locator
     * @param optionTextToCheck - Expected selected option's value
     * 
     * @returns Promise<boolean> - Returns true if assertion passes
     * 
     * Behavior:
     *   - Throws assertion error if value doesn't match
     *   - Returns true if value matches
     *   - Note: Despite return type, primarily used for assertion
     * 
     * @example
     * const dropdown = await page.locator('#country-select');
     * await dataReader.isDropdownItemSelected(dropdown, 'USA');
     * 
     * @example
     * // In test - verify dropdown selection
     * const countryDropdown = await pageElement.getElementById('country');
     * await dataReader.isDropdownItemSelected(countryDropdown, 'Canada');
     */
    async isDropdownItemSelected(locator: Locator, optionTextToCheck: string){
          await expect(locator).toHaveValue(optionTextToCheck);
          return true;
    }
}