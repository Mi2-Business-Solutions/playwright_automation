/* eslint @typescript-eslint/no-explicit-any: "off" */

/**
 * **WHAT:** Element location and retrieval wrapper for Playwright, providing methods to find page elements using various strategies
 * 
 * **WHY:** Centralizes element location logic with consistent patterns for finding elements by role, XPath, ID, label, placeholder, and other selectors
 * 
 * **WHERE USED:**
 * - Called by data writer/reader wrappers to locate elements before interaction
 * - Used in Page Objects to find buttons, inputs, dropdowns, tables, and other UI elements
 * - Supports iframe elements, indexed elements, and visibility-based element location
 * 
 * **WHEN TO USE:**
 * - Need to locate elements using Playwright's getByRole, getByLabel, getByPlaceholder
 * - Working with iframes and need frame-specific element location
 * - Checking element visibility, counts, or existence before interaction
 * - Finding elements within table rows or cells
 * 
 * **HOW IT WORKS:**
 * - Wraps Playwright's locator API with convenient methods for common element location patterns
 * - Provides indexed element access when multiple matches exist
 * - Supports exact vs partial text matching for flexibility
 * - Includes timeout and visibility handling for reliable element detection
 * 
 * @example
 * // In Data Writer Wrapper
 * const textbox = await this.pageElement.getElementByLabel("Email");
 * await textbox.fill("user@example.com");
 * 
 * @example
 * // In Page Object
 * async getSubmitButton(): Promise<Locator> {
 *   return await this.pageElement.getButton("Submit", 5000, true);
 * }
 */

import { Locator, Page } from "@playwright/test";
import HtmlElementProperties from "./htmlElementProperties";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import { fixture } from "../../hooks/fixture";

/**
 * **PlaywrightWrapperPageElement Class**
 * 
 * **RESPONSIBILITY:** Provides element location methods using role-based, XPath, ID, label, and other Playwright selectors
 * 
 * **KEY CAPABILITIES:**
 * - Locate elements by ARIA roles with optional name and exact matching
 * - Find elements within iframes using frame locators
 * - Access indexed elements when multiple matches exist
 * - Check element visibility, clickability, and enabled state
 * - Count elements matching specific criteria
 * - Locate table cells and rows for data grid interactions
 * - Support searchable dropdowns and Angular components
 */
export default class PlaywrightWrapperPageElement {

    constructor(private page: Page, private common: PlaywrightWrapperCommon) { }

    /**
     * **WHAT:** Locates an element on the page using its ARIA role with optional name filtering
     * 
     * **WHEN TO USE:**
     * - Need to find elements by their semantic ARIA role (button, textbox, link, etc.)
     * - Accessible element identification is preferred for robust tests
     * - Element name or label text is available for filtering
     * 
     * **HOW IT WORKS:**
     * 1. Uses Playwright's getByRole() with the specified role
     * 2. Optionally filters by element name/label if provided
     * 3. Supports exact matching for precise element identification
     * 
     * @param role - ARIA role of the element (from HtmlRoles: BUTTON, TEXT_BOX, LINK, etc.)
     * @param [elementName=""] - Optional name/label to filter elements with that role
     * @param [isExact=false] - Whether to match elementName exactly (true) or partially (false)
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getLoginButton(): Promise<Locator> {
     *   return await this.pageElement.getElementByRole(HtmlRoles.BUTTON, "Login", true);
     * }
     * 
     * @example
     * // In Data Writer Wrapper (finding textbox by role)
     * const emailField = await this.pageElement.getElementByRole(HtmlRoles.TEXT_BOX, "Email");
     * await emailField.fill("test@example.com");
     * // Result: Finds textbox with accessible name "Email", fills it with email
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getElementByRole(role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.getByRole(role, { name: elementName, exact: isExact});
        else
            return this.page.getByRole(role, {exact: isExact});
    }

    /**
     * **WHAT:** Locates a child element by role within a specific parent element identified by XPath
     * 
     * **WHEN TO USE:**
     * - Need to scope element search to a specific parent container
     * - Multiple elements with same role exist; parent context disambiguates
     * - Working with nested component structures
     * 
     * **HOW IT WORKS:**
     * 1. Locates parent element using XPath
     * 2. Searches for child element by role within that parent
     * 3. Optionally filters by name and supports exact matching
     * 
     * @param parentElementXPath - XPath selector identifying the parent container element
     * @param role - ARIA role of the child element to find
     * @param [elementName=""] - Optional name/label to filter child elements
     * @param [isExact=false] - Whether to match elementName exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the child element
     * 
     * @example
     * // In Page Object (finding button within specific dialog)
     * async getDialogSaveButton(): Promise<Locator> {
     *   return await this.pageElement.getChildElementByRole(
     *     "//div[@class='confirmation-dialog']",
     *     HtmlRoles.BUTTON,
     *     "Save"
     *   );
     * }
     * 
     * @example
     * // In Data Writer (textbox within form section)
     * const section = "//section[@id='personal-info']";
     * const nameField = await this.pageElement.getChildElementByRole(
     *   section,
     *   HtmlRoles.TEXT_BOX,
     *   "Full Name"
     * );
     * // Result: Finds "Full Name" textbox only within personal-info section
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getChildElementByRole(parentElementXPath: string, role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.locator(parentElementXPath).getByRole(role, { name: elementName, exact: isExact });
        else
            return this.page.locator(parentElementXPath).getByRole(role, {exact: isExact});
    }

    /**
     * **WHAT:** Locates an element by ARIA role within a named iframe
     * 
     * **WHEN TO USE:**
     * - Element is inside an iframe that has a name attribute
     * - Need to interact with elements in embedded content
     * - Working with legacy applications or third-party integrations using iframes
     * 
     * **HOW IT WORKS:**
     * 1. Creates frame locator for iframe with specified name attribute
     * 2. Uses getByRole within that iframe context
     * 3. Optionally filters by element name with exact matching support
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param role - ARIA role of the element to find within the iframe
     * @param [elementName=""] - Optional name/label to filter elements
     * @param [isExact=false] - Whether to match elementName exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the element within the iframe
     * 
     * @example
     * // In Page Object (text editor iframe)
     * async getEditorTextArea(): Promise<Locator> {
     *   return await this.pageElement.getIFrameElementByRole(
     *     "contentEditor",
     *     HtmlRoles.TEXT_BOX,
     *     "Content"
     *   );
     * }
     * 
     * @example
     * // In Data Writer (iframe button)
     * const submitBtn = await this.pageElement.getIFrameElementByRole(
     *   "paymentFrame",
     *   HtmlRoles.BUTTON,
     *   "Pay Now",
     *   true
     * );
     * // Result: Finds "Pay Now" button inside iframe named "paymentFrame"
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIFrameElementByRole(iFrameName: string, role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { name: elementName, exact: isExact });
        else
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { exact: isExact });
    }

    /**
     * **WHAT:** Locates a specific indexed element by role within an iframe when multiple matching elements exist
     * 
     * **WHEN TO USE:**
     * - Multiple elements with same role exist within the iframe
     * - Need to select a specific occurrence by position (0-based index)
     * - Working with repeated elements like multiple buttons or textboxes in iframe content
     * 
     * **HOW IT WORKS:**
     * 1. Creates frame locator for the named iframe
     * 2. Finds all elements by role (and optional name)
     * 3. Returns the element at the specified index using .nth()
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param role - ARIA role of the elements to find
     * @param index - Zero-based index of the element to retrieve
     * @param [elementName=""] - Optional name/label to filter elements
     * @param [isExact=false] - Whether to match elementName exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the indexed element
     * 
     * @example
     * // In Page Object (second Save button in iframe)
     * async getSecondarySaveButton(): Promise<Locator> {
     *   return await this.pageElement.getIndexedIFrameElementByRole(
     *     "documentEditor",
     *     HtmlRoles.BUTTON,
     *     1,           // Second button (index 1)
     *     "Save"
     *   );
     * }
     * 
     * @example
     * // In Data Writer (third textbox in form iframe)
     * const field = await this.pageElement.getIndexedIFrameElementByRole(
     *   "registrationForm",
     *   HtmlRoles.TEXT_BOX,
     *   2,  // Third textbox
     *   "Address"
     * );
     * // Result: Finds 3rd textbox with "Address" label inside registrationForm iframe
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedIFrameElementByRole(iFrameName: string, role:any, index: number, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { name: elementName, exact: isExact }).nth(index);
        else
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { exact: isExact }).nth(index);
    }

    /**
     * **WHAT:** Locates an element first by a selector string, then finds a child element by role within that locator
     * 
     * **WHEN TO USE:**
     * - Need to combine CSS/XPath locator with role-based child element selection
     * - Parent element doesn't have a role but child does
     * - Want hybrid locator strategy for complex DOM structures
     * 
     * **HOW IT WORKS:**
     * 1. Creates locator using the provided selector string
     * 2. Searches for child element by role within that locator
     * 3. Supports exact matching for role name
     * 
     * @param locator - CSS selector or XPath for the parent element
     * @param role - ARIA role of the child element to find
     * @param [isExact=false] - Whether to match role name exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getFormSubmitButton(): Promise<Locator> {
     *   return await this.pageElement.getElementByLocatorAndRole(
     *     "#contactForm",
     *     HtmlRoles.BUTTON
     *   );
     * }
     * 
     * @example
     * // In Data Writer
     * const textbox = await this.pageElement.getElementByLocatorAndRole(
     *   "//div[@class='address-section']",
     *   HtmlRoles.TEXT_BOX,
     *   true
     * );
     * // Result: Finds textbox within address-section div
     */
    async getElementByLocatorAndRole(locator: string, role: any, isExact: boolean = false): Promise<Locator>{
        const element = this.page.locator(locator);
        return element.getByRole(role, {exact: isExact});
    }

    /**
     * **WHAT:** Locates an element within a named iframe using XPath selector
     * 
     * **WHEN TO USE:**
     * - Element is inside iframe and needs XPath identification
     * - Role-based selectors are insufficient for iframe elements
     * - Working with complex iframe content structures
     * 
     * **HOW IT WORKS:**
     * - Creates frame locator for iframe by name attribute
     * - Locates element within iframe using provided XPath
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param xpath - XPath selector for the element within the iframe
     * 
     * @returns Promise<Locator> - Playwright locator for the iframe element
     * 
     * @example
     * // In Page Object
     * async getIframeElement(): Promise<Locator> {
     *   return await this.pageElement.getIFrameElementByXPath(
     *     "editorFrame",
     *     "//button[@id='save-btn']"
     *   );
     * }
     * 
     * @example
     * // In Data Writer
     * const input = await this.pageElement.getIFrameElementByXPath(
     *   "paymentIframe",
     *   "//input[@name='cardNumber']"
     * );
     * // Result: Finds card number input inside paymentIframe
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIFrameElementByXPath(iFrameName: string, xpath:string): Promise<Locator>{
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath);
    }

    /**
     * **WHAT:** Locates a specific indexed element within an iframe using XPath when multiple matching elements exist
     * 
     * **WHEN TO USE:**
     * - Multiple elements match the XPath within the iframe
     * - Need to select a specific occurrence by position
     * - Working with repeated elements in iframe content
     * 
     * **HOW IT WORKS:**
     * - Creates frame locator for iframe
     * - Locates all elements matching XPath
     * - Returns element at specified index using .nth()
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param xpath - XPath selector for elements within the iframe
     * @param index - Zero-based index of the element to retrieve
     * 
     * @returns Promise<Locator> - Playwright locator for the indexed element
     * 
     * @example
     * // In Page Object (second button in iframe)
     * async getSecondIframeButton(): Promise<Locator> {
     *   return await this.pageElement.getIndexedIFrameElementByXPath(
     *     "contentFrame",
     *     "//button[@class='action-btn']",
     *     1  // Second button
     *   );
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedIFrameElementByXPath(iFrameName: string, xpath:string, index: number): Promise<Locator>{
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath).nth(index);    
    }

    /**
     * **WHAT:** Locates a specific indexed element by role and name when multiple matching elements exist on the page
     * 
     * **WHEN TO USE:**
     * - Multiple elements share the same role and name
     * - Need to select by position (e.g., second "Submit" button)
     * - Working with repeated UI patterns
     * 
     * **HOW IT WORKS:**
     * - Finds all elements matching role and name
     * - Returns element at specified index (0-based)
     * - Special case: index 0 returns first element directly without .nth()
     * 
     * @param index - Zero-based index of the element
     * @param role - ARIA role of the elements
     * @param elementName - Name/label of the elements
     * @param [exact=false] - Whether to match name exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the indexed element
     * 
     * @example
     * // In Page Object
     * async getSecondDeleteButton(): Promise<Locator> {
     *   return await this.pageElement.getIndexedElementByRole(
     *     1,  // Second occurrence
     *     HtmlRoles.BUTTON,
     *     "Delete"
     *   );
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedElementByRole(index: number, role:any, elementName: string, exact: boolean = false): Promise<Locator>{
        if(index == 0)
            return this.page.getByRole(role, { name: elementName, exact: exact });
        else
            return this.page.getByRole(role, { name: elementName, exact: exact }).nth(index);
    }

    /**
     * **WHAT:** Locates an element by selector and waits for it to become visible before returning
     * 
     * **WHEN TO USE:**
     * - Element may not be immediately visible (loading, animation)
     * - Need to ensure element is visible before interaction
     * - Dealing with dynamic content rendering
     * 
     * **HOW IT WORKS:**
     * 1. Creates locator using provided selector
     * 2. Waits for element to become visible (up to timeout)
     * 3. Returns the locator once visible
     * 
     * @param locator - CSS selector or XPath for the element
     * @param [timeout=90000] - Maximum wait time in milliseconds (default 90 seconds)
     * 
     * @returns Promise<Locator> - Playwright locator for the visible element
     * 
     * @example
     * // In Page Object
     * async getLoadedContent(): Promise<Locator> {
     *   return await this.pageElement.getVisibleElement(
     *     "#mainContent",
     *     10000  // Wait up to 10 seconds
     *   );
     * }
     */
    async getVisibleElement(locator: string, timeout: number = 90000): Promise<Locator>{
        const element = this.page.locator(locator);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Locates a specific indexed element by selector and waits for it to become visible
     * 
     * **WHEN TO USE:**
     * - Multiple elements match the selector
     * - Need a specific occurrence by position
     * - Element must be visible before proceeding
     * 
     * **HOW IT WORKS:**
     * 1. Creates locator and selects element at specified index
     * 2. Waits for that element to become visible
     * 3. Returns the locator once visible
     * 
     * @param index - Zero-based index of the element
     * @param locator - CSS selector or XPath for the elements
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * 
     * @returns Promise<Locator> - Playwright locator for the visible indexed element
     * 
     * @example
     * // In Page Object (second product card)
     * async getSecondProductCard(): Promise<Locator> {
     *   return await this.pageElement.getIndexedVisibleElement(
     *     1,
     *     ".product-card",
     *     5000
     *   );
     * }
     */
    async getIndexedVisibleElement(index: number, locator: string, timeout: number = 90000): Promise<Locator>{
        const element = this.page.locator(locator).nth(index);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }
    
    /**
     * **WHAT:** Checks whether a button with the specified name is visible on the page within the timeout period
     * 
     * **WHEN TO USE:**
     * - Need to verify button visibility before interaction
     * - Conditional test logic based on button presence
     * - Checking if optional buttons appear
     * 
     * **HOW IT WORKS:**
     * - Locates button by role and name
     * - Checks visibility within timeout
     * - Returns true if visible, false otherwise
     * 
     * @param btnName - The name/label of the button
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * @param [isExact=false] - Whether to match button name exactly
     * 
     * @returns Promise<boolean> - True if button is visible, false otherwise
     * 
     * @example
     * // In Page Object
     * async hasSubmitButton(): Promise<boolean> {
     *   return await this.pageElement.isButtonDisplayed("Submit", 5000, true);
     * }
     * 
     * @example
     * // In Test/Step Definition
     * if (await loginPage.hasSubmitButton()) {
     *   await loginPage.clickSubmit();
     * }
     * // Result: Returns true if "Submit" button is visible within 5 seconds
     */
    async isButtonDisplayed(btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<boolean>{
        return await this.page.getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact }).isVisible({timeout: timeout});
    }

    /**
     * **WHAT:** Locates a button by name and waits for it to become visible
     * 
     * **WHEN TO USE:**
     * - Need to interact with a button element
     * - Button may not be immediately visible
     * - Standard button retrieval with visibility guarantee
     * 
     * **HOW IT WORKS:**
     * 1. Locates button by BUTTON role and name
     * 2. Waits for visibility up to timeout
     * 3. Returns locator once visible
     * 
     * @param btnName - The name/label of the button
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * @param [isExact=false] - Whether to match button name exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the visible button
     * 
     * @example
     * // In Page Object
     * async getSubmitButton(): Promise<Locator> {
     *   return await this.pageElement.getButton("Submit", 5000, true);
     * }
     * 
     * @example
     * // Usage in wrapper
     * const saveBtn = await this.pageElement.getButton("Save Changes");
     * await saveBtn.click();
     * // Result: Finds "Save Changes" button, waits until visible, returns locator
     */
    async getButton(btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact });
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Locates a button-like element with a non-standard ARIA role (not "button") and waits for visibility
     * 
     * **WHEN TO USE:**
     * - Button-like element has a different role (link, tab, menuitem)
     * - Working with custom components that act as buttons
     * - Accessibility testing with specific role requirements
     * 
     * **HOW IT WORKS:**
     * 1. Locates element by specified role and name
     * 2. Waits for visibility
     * 3. Returns locator
     * 
     * @param btnName - The name/label of the button-like element
     * @param role - The ARIA role (e.g., HtmlRoles.LINK, HtmlRoles.TAB)
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * @param [isExact=false] - Whether to match name exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object (clickable link acting as button)
     * async getNavigationButton(): Promise<Locator> {
     *   return await this.pageElement.getButtonByNonDefaultRole(
     *     "Next",
     *     HtmlRoles.LINK
     *   );
     * }
     */
    async getButtonByNonDefaultRole(btnName: string, role:any, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.getByRole(role, { name: btnName, exact: isExact });
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Locates a button within a named iframe and waits for it to become visible
     * 
     * **WHEN TO USE:**
     * - Button is inside an iframe
     * - Need visibility guarantee for iframe button
     * - Working with embedded content
     * 
     * **HOW IT WORKS:**
     * 1. Locates button within iframe by name
     * 2. Waits for visibility
     * 3. Returns locator
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param btnName - The name/label of the button
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * @param [isExact=false] - Whether to match button name exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the iframe button
     * 
     * @example
     * // In Page Object
     * async getEditorSaveButton(): Promise<Locator> {
     *   return await this.pageElement.getIFrameButton(
     *     "editorFrame",
     *     "Save",
     *     5000
     *   );
     * }
     */
    async getIFrameButton(iFrameName: string, btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = await this.getIFrameElementByRole(iFrameName, HtmlRoles.BUTTON, btnName, isExact);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Locates an element using XPath selector
     * 
     * **WHEN TO USE:**
     * - Element identification requires XPath (complex DOM traversal)
     * - Other selectors are insufficient
     * - Legacy code uses XPath patterns
     * 
     * @param xpath - XPath selector for the element
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getComplexElement(): Promise<Locator> {
     *   return await this.pageElement.getElementByXPath(
     *     "//div[@class='container']//button[contains(@id,'submit')]"
     *   );
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByXPath(xpath: string): Promise<Locator>{
        return this.page.locator(xpath);
    }

    /**
     * **WHAT:** Locates an element by its ID attribute
     * 
     * **WHEN TO USE:**
     * - Element has a unique ID
     * - Fast, reliable element identification
     * - Standard practice for stable selectors
     * 
     * **HOW IT WORKS:**
     * - Constructs XPath using ID via common wrapper
     * - Returns locator for element with that ID
     * 
     * @param id - The value of the element's id attribute
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getUsernameField(): Promise<Locator> {
     *   return await this.pageElement.getElementById("username-input");
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementById(id: string): Promise<Locator>{
        return this.page.locator(this.common.getXPathWithId(id));
    }

    /**
     * **WHAT:** Locates an element by ID and waits for it to become visible
     * 
     * **WHEN TO USE:**
     * - Element has unique ID
     * - Need visibility guarantee before interaction
     * - Element may load dynamically
     * 
     * @param id - The value of the element's id attribute
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * 
     * @returns Promise<Locator> - Playwright locator for the visible element
     * 
     * @example
     * // In Page Object
     * async getLoadedDashboard(): Promise<Locator> {
     *   return await this.pageElement.getVisibleElementById("dashboard", 10000);
     * }
     */
    async getVisibleElementById(id: string, timeout: number = 90000): Promise<Locator>{
        const element = await this.getElementById(id);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Waits for an element locator to become visible within the specified timeout
     * 
     * **WHEN TO USE:**
     * - Element needs to be visible before proceeding
     * - Used internally by other wrapper methods
     * - Custom wait logic for specific scenarios
     * 
     * **HOW IT WORKS:**
     * - Uses Playwright's wait condition for visible state
     * - Throws timeout error if element doesn't appear
     * 
     * @param element - The Playwright locator to wait for
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * 
     * @example
     * // In wrapper method
     * const modal = this.page.locator(".modal");
     * await this.pageElement.waitUtilElementIsVisible(modal, 5000);
     */
    async waitUtilElementIsVisible(element: Locator, timeout: number = 90000){
        //await element.scrollIntoViewIfNeeded();
        await element.waitFor({
            state: HtmlElementProperties.STATE_VISIBLE,
            timeout: timeout
        });
    }

    /**
     * **WHAT:** Locates an input element by its placeholder text
     * 
     * **WHEN TO USE:**
     * - Element has placeholder attribute (e.g., "Enter email...")
     * - Input fields lack labels or IDs
     * - Standard form field identification
     * 
     * @param placeholderText - The placeholder attribute value
     * 
     * @returns Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getSearchField(): Promise<Locator> {
     *   return await this.pageElement.getElementByPlaceholder("Search products...");
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByPlaceholder(placeholderText: string){
        return this.page.getByPlaceholder(placeholderText);
    }

    /**
     * **WHAT:** Locates a link by its name/text and waits for it to become visible
     * 
     * **WHEN TO USE:**
     * - Need to find and interact with hyperlinks
     * - Link visibility is required before clicking
     * - Navigation link identification
     * 
     * @param linkName - The visible text of the link
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * 
     * @returns Playwright locator for the visible link
     * 
     * @example
     * // In Page Object
     * async getHomeLink(): Promise<Locator> {
     *   return await this.pageElement.getVisibleElementByLinkName("Home", 5000);
     * }
     */
    async getVisibleElementByLinkName(linkName: string, timeout: number = 90000){
        const element = this.page.getByRole(HtmlRoles.LINK, { name: linkName })
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /**
     * **WHAT:** Locates an element by its associated label text
     * 
     * **WHEN TO USE:**
     * - Form elements have label tags
     * - Accessible element identification preferred
     * - Standard form field location pattern
     * 
     * @param labelName - The text of the label element
     * @param [isExact=false] - Whether to match label text exactly
     * 
     * @returns Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getEmailField(): Promise<Locator> {
     *   return await this.pageElement.getElementByLabel("Email Address", true);
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByLabel(labelName: string, isExact: boolean = false){
        return this.page.getByLabel(labelName, {exact: isExact});
    }

    /**
     * **WHAT:** Returns the count of elements with the specified label
     * 
     * **WHEN TO USE:**
     * - Need to verify how many elements share a label
     * - Checking for duplicate labels
     * - Dynamic content validation
     * 
     * @param labelName - The label text to search for
     * @param [isExact=false] - Whether to match label exactly
     * 
     * @returns Promise<number> - Count of matching elements
     * 
     * @example
     * // In test
     * const count = await pageElement.getAvailableElementCountByLabel("Email");
     * // Result: Returns 2 if two elements have "Email" label
     */
    async getAvailableElementCountByLabel(labelName: string, isExact: boolean = false){
        return await (await this.getElementByLabel(labelName, isExact)).count();
    }

    /**
     * **WHAT:** Checks if at least one element with the specified label exists on the page
     * 
     * **WHEN TO USE:**
     * - Conditional logic based on element presence
     * - Verifying optional form fields exist
     * - Dynamic UI validation
     * 
     * @param labelName - The label text to search for
     * @param [isExact=false] - Whether to match label exactly
     * 
     * @returns Promise<boolean> - True if element exists, false otherwise
     * 
     * @example
     * // In Page Object
     * async hasOptionalField(): Promise<boolean> {
     *   return await this.pageElement.isElementByLabelAvailable("Middle Name");
     * }
     */
    async isElementByLabelAvailable(labelName: string, isExact: boolean = false): Promise<boolean>{
        const elementCount = await this.page.getByLabel(labelName, {exact: isExact}).count();
        return elementCount > 0;
    }

    /**
     * **WHAT:** Locates an element by its test ID attribute with optional indexing
     * 
     * **WHEN TO USE:**
     * - Elements have data-testid attributes
     * - Test-specific element identification
     * - Multiple elements share test ID (use index)
     * 
     * @param testId - The value of the data-testid attribute
     * @param [index=0] - Zero-based index when multiple elements have same test ID
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getDeleteButton(): Promise<Locator> {
     *   return await this.pageElement.getElementByTestId("delete-btn", 0);
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByTestId(testId: string, index: number = 0): Promise<Locator>{
        const element = this.page.getByTestId(testId).nth(index);
        return element;
    }

    /**
     * **WHAT:** Locates a table row containing the specified text in any of its cells
     * 
     * **WHEN TO USE:**
     * - Need to find table row by cell content
     * - Working with data grids or tables
     * - Row identification without exact cell matching
     * 
     * @param cellTextToSearch - Partial text to search for within table cells
     * 
     * @returns Promise<Locator> - Playwright locator for the matching table row
     * 
     * @example
     * // In Page Object
     * async getUserRow(username: string): Promise<Locator> {
     *   return await this.pageElement.getUniqueTableRowWithPartialCellText(username);
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getUniqueTableRowWithPartialCellText(cellTextToSearch: string): Promise<Locator>{
        return this.page.locator(`tr:has-text("${cellTextToSearch}")`);
    }

    /**
     * **WHAT:** Locates a searchable dropdown (combobox) by filtering elements containing specific text
     * 
     * **WHEN TO USE:**
     * - Dropdown has search/filter capability
     * - Multiple dropdowns exist; filter by containing text
     * - Working with Angular or custom dropdown components
     * 
     * **HOW IT WORKS:**
     * 1. Locates elements by XPath
     * 2. Filters to those containing the text
     * 3. Finds combobox role within filtered results
     * 4. Waits for element availability
     * 
     * @param elementXPath - XPath for the dropdown container element
     * @param textToFilter - Text to filter dropdown containers by
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * @param [isExact=false] - Whether to match text exactly
     * 
     * @returns Promise<Locator> - Playwright locator for the dropdown combobox
     * 
     * @example
     * // In Data Writer
     * const dropdown = await this.pageElement.getSearchableDropDownHavingText(
     *   "//ng-select",
     *   "Country",
     *   5000
     * );
     * // Result: Finds ng-select containing "Country" text, returns combobox input
     */
    async getSearchableDropDownHavingText(elementXPath: string, textToFilter: string, timeout:number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.locator(elementXPath)
            //.filter({ hasText: textToFilter }).getByRole(HtmlRoles.TEXT_BOX);
            .filter({ hasText: textToFilter }).getByRole(HtmlRoles.COMBOBOX, {exact: isExact});
        await element.waitFor(
            {
                //state: "visible",
                timeout: timeout
            }
        );
        return element;
    }

    /**
     * **WHAT:** Locates an indexed element by XPath that contains specific text
     * 
     * **WHEN TO USE:**
     * - Multiple elements match XPath
     * - Need to filter by text content
     * - Select specific occurrence by index
     * 
     * **HOW IT WORKS:**
     * 1. Locates all elements matching XPath
     * 2. Filters to those containing the text
     * 3. Selects element at specified index
     * 4. Waits for element availability
     * 
     * @param elementXPath - XPath selector for elements
     * @param textToFilter - Text that element must contain
     * @param [elementIndex=0] - Zero-based index of matching element
     * @param [timeout=90000] - Maximum wait time in milliseconds
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getSecondCardWithTitle(title: string): Promise<Locator> {
     *   return await this.pageElement.getElementHavingText(
     *     "//div[@class='card']",
     *     title,
     *     1  // Second card
     *   );
     * }
     */
    async getElementHavingText(elementXPath: string, textToFilter: string, elementIndex: number = 0, timeout:number = 90000): Promise<Locator>{
        const element = this.page.locator(elementXPath).filter({ hasText: textToFilter }).nth(elementIndex);
        await element.waitFor(
            {
                timeout: timeout
            }
        );
        return element;
    }

    /**
     * **WHAT:** Locates an element by its CSS class name
     * 
     * **WHEN TO USE:**
     * - Element has unique or identifying class
     * - CSS-based element location needed
     * - Working with styled components
     * 
     * @param className - The CSS class name (without leading dot)
     * 
     * @returns Promise<Locator> - Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getErrorMessage(): Promise<Locator> {
     *   return await this.pageElement.getElementByClass("error-message");
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByClass(className: string):Promise<Locator>{
        return this.page.locator(`.${className}`);
    }

    /**
     * **WHAT:** Locates an element by its tag name and a specific attribute value
     * 
     * **WHEN TO USE:**
     * - Need to find element by attribute (name, value, etc.)
     * - Working with form inputs or custom attributes
     * - Specific attribute-based identification required
     * 
     * @param elementName - The HTML tag name (e.g., "input", "div", "button")
     * @param attributeName - The attribute name (e.g., "name", "type", "data-id")
     * @param attributeValue - The attribute value to match
     * 
     * @returns Playwright locator for the element
     * 
     * @example
     * // In Page Object
     * async getInputByName(name: string): Promise<Locator> {
     *   return await this.pageElement.getElementByNameAndAttributeValue(
     *     "input",
     *     "name",
     *     name
     *   );
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByNameAndAttributeValue(elementName: string, attributeName: string, attributeValue:string){
        return this.page.locator(`//${elementName}[@${attributeName}='${attributeValue}']`);
    }

    /**
     * **WHAT:** Locates a button within a specific parent element identified by XPath
     * 
     * **WHEN TO USE:**
     * - Multiple buttons with same name exist
     * - Need to scope search to parent container
     * - Button context is important for disambiguation
     * 
     * @param parentNodeXPath - XPath of the parent container element
     * @param btnName - The name/label of the button
     * @param [isExact=false] - Whether to match button name exactly
     * 
     * @returns Playwright locator for the button
     * 
     * @example
     * // In Page Object
     * async getDialogSaveButton(): Promise<Locator> {
     *   return await this.pageElement.getButtonWithParentNode(
     *     "//div[@class='confirmation-dialog']",
     *     "Save",
     *     true
     *   );
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getButtonWithParentNode(parentNodeXPath: string, btnName: string, isExact: boolean = false){
        return this.page.locator(parentNodeXPath).getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact});
    }

    /**
     * **WHAT:** Returns the count of elements matching the XPath selector, with optional timeout handling
     * 
     * **WHEN TO USE:**
     * - Need to count matching elements
     * - Verifying number of items in list
     * - Dynamic content validation with optional wait
     * 
     * **HOW IT WORKS:**
     * - If timeout is -1: Returns immediate count (may be 0)
     * - If timeout provided: Waits for at least one element, then counts
     * - Returns 0 if timeout expires without finding elements
     * 
     * @param xpath - XPath selector for elements to count
     * @param [timeoutVal=-1] - Timeout in milliseconds; -1 for no wait (immediate count)
     * 
     * @returns Promise<number> - Count of matching elements
     * 
     * @example
     * // In Page Object (with wait)
     * async getProductCount(): Promise<number> {
     *   return await this.pageElement.getAvailableElementCount(
     *     "//div[@class='product']",
     *     5000  // Wait up to 5 seconds
     *   );
     * }
     * 
     * @example
     * // Immediate count (no wait)
     * const count = await pageElement.getAvailableElementCount("//button", -1);
     * // Result: Returns 0 immediately if no buttons exist
     */
    async getAvailableElementCount(xpath: string, timeoutVal: number = -1){
        if(timeoutVal == -1)
            return await this.page.locator(xpath).count();
        else{
            const locator = this.page.locator(xpath);
            try {
                await this.page.waitForSelector(xpath, { timeout: timeoutVal });
                return await locator.count();
            } catch (error) {
                fixture.logger.error(`Element with the xpath - ${xpath} - not found within the specified timeout hence returning zero as the count`);
                //throw error;
                return 0;
            }
        }
    }

    /**
     * **WHAT:** Returns the count of elements containing the specified text
     * 
     * **WHEN TO USE:**
     * - Counting elements by visible text content
     * - Verifying number of matching text occurrences
     * - Dynamic content validation
     * 
     * @param text - The text to search for in elements
     * @param [isExact=false] - Whether to match text exactly
     * 
     * @returns Promise<number> - Count of elements containing the text
     * 
     * @example
     * // Count elements containing "Error"
     * const errorCount = await pageElement.getAvailableElementCountByText("Error");
     */
    async getAvailableElementCountByText(text: string, isExact: boolean = false){
        return await this.getElementByText(text, isExact).count();
    }

    /**
     * **WHAT:** Locates an element by its visible text content
     * 
     * @param text - The text content to match
     * @param [isExact=false] - Whether to match text exactly
     * 
     * @returns Locator - Playwright locator for the element
     */
    getElementByText(text: string, isExact: boolean = false): Locator{
        return this.page.getByText(text, {exact: isExact});
    }

    /**
     * **WHAT:** Returns the count of elements with the specified test ID
     * 
     * @param testId - The data-testid attribute value
     * 
     * @returns Promise<number> - Count of elements with that test ID
     */
    async getAvailableElementCountByTestId(testId: string){
        return await this.page.getByTestId(testId).count();
    }

    /**
     * **WHAT:** Returns the count of elements with test IDs similar to (containing) the specified value
     * 
     * @param testId - Partial test ID value to match
     * 
     * @returns Promise<number> - Count of elements with similar test IDs
     */
    async getAvailableElementCountBySimilarTestId(testId: string){
        const finalXPath = this.common.getSelectorWithSimilarTestId(testId);
        return await this.getAvailableElementCount(finalXPath);
    }

    /**
     * **WHAT:** Returns the count of elements with the specified ID attribute
     * 
     * @param id - The id attribute value
     * 
     * @returns Promise<number> - Count of elements with that ID (typically 0 or 1)
     */
    async getAvailableElementCountById(id: string){
        const xpath = this.common.getXPathWithId(id);
        return await this.getAvailableElementCount(xpath);
    }
    
    /**
     * **WHAT:** Returns the count of elements with the specified placeholder text
     * 
     * @param placeholderTxt - The placeholder attribute value
     * @param [isExact=false] - Whether to match placeholder exactly
     * 
     * @returns Promise<number> - Count of elements with that placeholder
     */
    async getAvailableElementCountByPlaceholder(placeholderTxt: string, isExact: boolean = false){
        return await this.page.getByPlaceholder(placeholderTxt, {exact: isExact}).count();
    }
    /**
     * **WHAT:** Returns the count of table rows on the page
     * 
     * **WHEN TO USE:**
     * - Counting rows in a data table
     * - Verifying table data load
     * - Pagination validation
     * 
     * **ASSUMPTION:** Only one table exists on the page
     * 
     * @param [excludeHeaderRows=true] - If true, counts only tbody rows; if false, includes thead rows
     * 
     * @returns Promise<number> - Count of table rows
     * 
     * @example
     * // In Page Object
     * async getDataRowCount(): Promise<number> {
     *   return await this.pageElement.getTableRowCount(true);
     * }
     * // Result: Returns 10 if tbody has 10 data rows (excludes header)
     */
    async getTableRowCount(excludeHeaderRows: boolean = true){
        if(excludeHeaderRows){
            return await this.page.locator(`//${HtmlRoles.TABLE_BODY}/${HtmlRoles.TABLE_ROW}`).count();
        }else
        {
            return await this.page.locator(`//${HtmlRoles.TABLE_ROW}`).count();
        }
    }

    /**
     * **WHAT:** Locates a specific table cell by row and column index
     * 
     * **WHEN TO USE:**
     * - Need to interact with specific table cell
     * - Data extraction from table cells
     * - Cell-based validation
     * 
     * **ASSUMPTION:** Only one table exists on the page; uses tbody for row counting
     * 
     * @param rowIndex - 1-based row index within tbody
     * @param cellIndex - 1-based column/cell index within the row
     * 
     * @returns Promise<Locator> - Playwright locator for the table cell (td element)
     * 
     * @example
     * // In Page Object (get cell in row 2, column 3)
     * async getUserEmail(rowIndex: number): Promise<Locator> {
     *   return await this.pageElement.getTableCellElement(rowIndex, 3);
     * }
     */
    /*eslint @typescript-eslint/require-await: "off" */
    /**
     * Note: this method assumes there is only one table in the current page
     * @param rowIndex 
     * @param cellIndex 
     * @returns 
     */
    async getTableCellElement(rowIndex: number, cellIndex: number): Promise<Locator>{
        return this.page.locator(`(((//${HtmlRoles.TABLE_BODY}/${HtmlRoles.TABLE_ROW})[${rowIndex}])/${HtmlRoles.TABLE_DATA})[${cellIndex}]`)
    }

    /**
     * **WHAT:** Returns the count of elements with the specified ARIA role and optional name
     * 
     * @param roleName - The ARIA role (from HtmlRoles)
     * @param [elementTxt=""] - Optional name/label to filter by
     * @param [isExact=false] - Whether to match name exactly
     * 
     * @returns Promise<number> - Count of matching elements
     * 
     * @example
     * // Count all buttons
     * const btnCount = await pageElement.getAvailableElementCountByRole(HtmlRoles.BUTTON);
     * // Count "Submit" buttons
     * const submitCount = await pageElement.getAvailableElementCountByRole(HtmlRoles.BUTTON, "Submit");
     */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getAvailableElementCountByRole(roleName: any, elementTxt: string = "", isExact: boolean = false){
        if(elementTxt.length >= 0)
            return await this.page.getByRole(roleName, {name: elementTxt, exact: isExact}).count();
        else
            return await this.page.getByRole(roleName, {exact: isExact}).count();
    }

    /**
     * **WHAT:** Checks if an element located by XPath is currently visible on the page
     * 
     * @param xpath - XPath selector for the element
     * 
     * @returns Promise<boolean> - True if element is visible, false otherwise
     * 
     * @example
     * // In Page Object
     * async isErrorDisplayed(): Promise<boolean> {
     *   return await this.pageElement.isElementVisible("//div[@class='error']");
     * }
     */
    async isElementVisible(xpath: string) : Promise<boolean>{
        return await this.page.locator(xpath).isVisible();
    }

    // async isElementEnabled(xpath: string) : Promise<boolean>{
    //     return await this.page.locator(xpath).isEnabled();
    // }

    /**
     * **WHAT:** Checks if an element is clickable (not disabled) by checking the disabled attribute
     * 
     * @param xpath - XPath selector for the element
     * 
     * @returns Promise<boolean> - True if element has no disabled attribute (clickable), false otherwise
     * 
     * @example
     * // In Page Object
     * async canSubmit(): Promise<boolean> {
     *   return await this.pageElement.isElementClickable("//button[@id='submit']");
     * }
     */
    async isElementClickable(xpath: string) : Promise<boolean>{
        const element = await this.getElementByXPath(xpath);
        return await element.getAttribute('disabled') == null;
    }
    /**
     * **WHAT:** Checks if an element located by role is enabled (not disabled)
     * 
     * @param roleName - The ARIA role
     * @param [elementTxt=""] - Optional name/label to filter by
     * @param [isExact=false] - Whether to match name exactly
     * 
     * @returns Promise<boolean> - True if element exists and is enabled, false otherwise
     * 
     * @example
     * // Check if Submit button is enabled
     * const enabled = await pageElement.isElementByRoleEnabled(HtmlRoles.BUTTON, "Submit");
     */
    async isElementByRoleEnabled(roleName: any, elementTxt: string ="", isExact: boolean = false) : Promise<boolean>{
        let element: Locator = null;
        if(elementTxt.length >= 0)
            element = this.page.getByRole(roleName, {name: elementTxt, exact: isExact});
        else
            element = this.page.getByRole(roleName, {exact: isExact});

        if(element !== null)
            return await element.isEnabled();
        else
            return false;
    }

    /**
     * **WHAT:** Locates a paragraph element by its exact text content
     * 
     * @param paraText - The exact text content of the paragraph
     * 
     * @returns Playwright locator for the paragraph element
     * 
     * @example
     * // Find paragraph with specific text
     * const para = await pageElement.getElementByPara("Welcome to our site!");
     */
    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByPara(paraText: string){
        return this.page.locator(`//p[text()='${paraText}']`);
    }

    /**
     * **WHAT:** Locates an element within an iframe by XPath with optional visibility check
     * 
     * @param iFrameName - Value of the iframe's name attribute
     * @param xpath - XPath selector for the element within the iframe
     * @param [checkVisibility=false] - Whether to wait for element visibility
     * @param [timeout=90000] - Maximum wait time for visibility (if checkVisibility is true)
     * 
     * @returns Promise<Locator> - Playwright locator for the iframe element
     * 
     * @example
     * // Get visible element in iframe
     * const element = await pageElement.getVisibleIFrameElementByXPath(
     *   "contentFrame",
     *   "//button[@id='save']",
     *   true,
     *   5000
     * );
     */
    async getVisibleIFrameElementByXPath(iFrameName: string, xpath: string, checkVisibility: boolean = false, timeout: number = 90000): Promise<Locator>{
        const element = this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath);
        if(checkVisibility)
            await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }
}