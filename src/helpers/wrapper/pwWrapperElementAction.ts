/**
 * @file Element Action Wrapper for Playwright
 * 
 * WHAT this file provides:
 * This wrapper encapsulates Playwright's element interaction APIs, providing simplified methods for clicking,
 * scrolling, enabling/disabling checks, and interacting with various element types (buttons, links, labels,
 * tables, dropdowns). It handles complex interaction patterns like conditional clicking, indexed elements,
 * and role-based element selection.
 * 
 * WHY this wrapper exists:
 * - Simplifies element interactions with semantic method names
 * - Handles common click patterns (by text, role, label, test-id, XPath)
 * - Provides enable/disable state checking before interactions
 * - Centralizes focus and scroll logic before clicks
 * - Supports conditional clicking (ignore if disabled, force click)
 * - Reduces boilerplate in Page Objects for element interactions
 * - Provides unified interface for buttons, links, checkboxes, dropdowns
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Core Wrapper Layer (element action operations)
 * - Used by: Page Objects for user interactions, Step Definitions for actions
 * - Dependencies: PlaywrightWrapperCommon, PlaywrightWrapperPageElement
 * - Position: Specialized wrapper for interactive elements
 * 
 * WHEN tests should use this wrapper:
 * - When clicking buttons, links, or any clickable elements
 * - When checking if elements are enabled before interaction
 * - When scrolling elements into viewport
 * - When clicking table cells or dropdown options
 * - For conditional clicking based on element state
 * - When working with indexed elements (multiple matches)
 * - For interactions requiring focus before click
 * 
 * Key patterns:
 * - waitAndClick*: Wait for element, then click
 * - click*: Direct click operations
 * - can*: Check if element can be interacted with
 * - clickIndexed*: Click specific element when multiple match
 * - clickChild*: Click element within parent context
 */

/* eslint @typescript-eslint/no-explicit-any: \"off\" */
import { Locator, Page } from "@playwright/test";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
/**
 * PlaywrightWrapperElementAction class
 * 
 * RESPONSIBILITY:
 * Provides methods for interacting with clickable elements on web pages. Handles clicking buttons, links,
 * table cells, and other interactive elements using various location strategies (text, role, ID, test-id,
 * XPath, label). Includes state checking, conditional clicking, and viewport scrolling.
 * 
 * PLAYWRIGHT FEATURES ENCAPSULATED:
 * - locator.click() - Click element
 * - locator.isEnabled() - Check if element enabled
 * - locator.focus() - Set focus on element
 * - locator.scrollIntoViewIfNeeded() - Scroll element into viewport
 * - getByRole(), getByText(), getByLabel(), getByTestId() - Element location
 * - locator.nth() - Select specific element from multiple matches
 * 
 * INTERACTION PATTERNS:
 * - By Role: waitAndClickButtonByRole(), clickElementByRole()
 * - By Text: waitAndClickButtonByText(), clickElementByText(), clickItemByText()
 * - By Label: clickElementByLabel(), selectDropdownOptionByParentLabel()
 * - By TestID: clickElementByTestId(), clickItemByTestIdAndRole()
 * - By ID: clickElementById(), clickIndexedElementById()
 * - By XPath: clickElement(), clickIndexedElement()
 * - Conditional: clickElement() with state checks
 * 
 * WHEN TO USE:
 * - Use for all element click operations in tests
 * - Use in Page Object action methods
 * - Use instead of direct locator.click() calls
 * - Use when element state validation needed before click
 */
export default class PlaywrightWrapperElementAction {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    /**
     * Scrolls element into viewport if not already visible
     * 
     * WHAT: Ensures element is visible in viewport by scrolling if needed.
     * WHEN: Use before clicking elements that may be below fold or hidden by scroll.
     * HOW: Uses Playwright's scrollIntoViewIfNeeded() which only scrolls if necessary.
     * 
     * @param element - The element to bring into view
     * 
     * @returns Promise<void>
     * 
     * Scroll Behavior:
     *   - Only scrolls if element not currently in viewport
     *   - Scrolls minimum amount needed
     *   - Centers element in viewport if possible
     * 
     * @example
     * const button = await page.locator('#submit-btn');
     * await elementAction.bringElementIntoViewPort(button);
     * await button.click();
     */
    async bringElementIntoViewPort(element: Locator){
        await element.scrollIntoViewIfNeeded();
    }

    /**
     * Checks if button is visible and enabled (can be clicked)
     * 
     * WHAT: Validates button can be interacted with by checking enabled state.
     * WHEN: Use before clicking to verify button is interactive.
     * HOW: Gets button by role and name, then checks isEnabled().
     * 
     * @param btnName - Accessible name of the button
     * @returns Promise<boolean> - true if button visible and enabled, false otherwise
     * 
     * @example
     * if (await elementAction.canClickButton('Submit')) {
     *   await elementAction.waitAndClickButtonByRole('Submit');
     * }
     */
    async canClickButton(btnName: string){
        const button = await this.pageElement.getButton(btnName);
        return await button.isEnabled();
    }

    /**
     * Checks if element with test-id is enabled
     * 
     * WHAT: Verifies element located by data-testid is in enabled state.
     * WHEN: Use to check if test-id element can be clicked before interaction.
     * HOW: Gets element by test-id, checks isEnabled().
     * 
     * @param testId - The data-testid attribute value
     * @returns Promise<boolean> - true if enabled, false otherwise
     * 
     * @example
     * const canSubmit = await elementAction.canClickItemByTestId('submit-btn');
     * expect(canSubmit).toBe(true);
     */
    async canClickItemByTestId(testId: string){
        const item = await this.pageElement.getElementByTestId(testId);
        return await item.isEnabled();
    }

    /**
     * Waits for element to become visible, then clicks it
     * 
     * WHAT: Waits for element at locator path to be visible, then performs click.
     * WHEN: Use when element may not be immediately visible (dynamic loading).
     * HOW: Calls getVisibleElement() to wait for visibility, then clicks.
     * 
     * @param locator - CSS selector or XPath to locate element
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.waitAndClick('#submit-button');
     */
    async waitAndClick(locator: string) {
        const element = await this.pageElement.getVisibleElement(locator);
        await element.click();
    }

    /**
     * Waits for button with text, scrolls into view, then clicks
     * 
     * WHAT: Finds button by text content, ensures visibility in viewport, then clicks.
     * WHEN: Use for text-based button identification when button may be off-screen.
     * HOW: Gets element by text, scrolls into view if needed, performs click.
     * 
     * @param btnTxt - Button text content
     * @param isExact - Whether text must match exactly (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.waitAndClickButtonByText('Submit');
     */
    async waitAndClickButtonByText(btnTxt: string, isExact: boolean = false) {
        const element = this.pageElement.getElementByText(btnTxt, isExact);
        await this.bringElementIntoViewPort(element);
        await element.click();
    }

    /**
     * Waits for button by ARIA role and accessible name, then clicks
     * 
     * WHAT: Locates button by role="button" and accessible name, waits for it, clicks.
     * WHEN: Use for accessibility-friendly button clicking (recommended approach).
     * HOW: Uses getButton() with timeout, then performs click.
     * 
     * @param btnName - Accessible name of button
     * @param timeout - Wait timeout in milliseconds (default: 90000)
     * @param isExact - Exact name match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.waitAndClickButtonByRole('Submit', 60000);
     */
    async waitAndClickButtonByRole(btnName: string, timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getButton(btnName, timeout, isExact);
        //await this.bringElementIntoViewPort(element);
        await element.click();
    }

    /**
     * Waits for button by custom role (not standard button role), then clicks
     * 
     * WHAT: Locates button-like element by custom ARIA role and name.
     * WHEN: Use when button has non-standard role (e.g., role="tab", role="menuitem").
     * HOW: Uses getButtonByNonDefaultRole() with specified role, then clicks.
     * 
     * @param btnName - Accessible name
     * @param role - Custom ARIA role (from HtmlRoles)
     * @param timeout - Wait timeout (default: 90000ms)
     * @param isExact - Exact name match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.waitAndClickButtonByNonDefaultRole('Settings', HtmlRoles.TAB, 60000);
     */
    async waitAndClickButtonByNonDefaultRole(btnName: string, role:HtmlRoles,  timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getButtonByNonDefaultRole(btnName, role, timeout, isExact);
        //await this.bringElementIntoViewPort(element);
        await element.click();
    }

    /**
     * Waits for button inside iframe by role, then clicks
     * 
     * WHAT: Accesses iframe, finds button by role and name, clicks it.
     * WHEN: Use for clicking buttons inside iframe elements.
     * HOW: Uses getIFrameButton() to access iframe context, then clicks.
     * 
     * @param iFrameName - Name attribute of iframe
     * @param btnName - Accessible name of button
     * @param timeout - Wait timeout (default: 90000ms)
     * @param isExact - Exact name match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.waitAndClickIFrameButtonByRole('payment-frame', 'Pay Now');
     */
    async waitAndClickIFrameButtonByRole(iFrameName: string, btnName: string, timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getIFrameButton(iFrameName, btnName, timeout, isExact);
        await element.click();
    }

    /**
     * Clicks element by ID attribute
     * 
     * WHAT: Locates element by ID and performs click.
     * WHEN: Use when element has unique ID attribute.
     * HOW: Constructs XPath with ID, performs page.click().
     * 
     * @param id - Element's id attribute value
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementById('submit-btn');
     */
    async clickElementById(id: string){
        await this.page.click(this.common.getXPathWithId(id));
    }

    /**
     * Clicks specific element when multiple elements share same ID
     * 
     * WHAT: Selects Nth element matching ID, then clicks.
     * WHEN: Use when multiple elements incorrectly share same ID.
     * HOW: Locates all with ID, uses nth() to select specific one, clicks.
     * 
     * @param id - Shared id attribute value
     * @param elementIndex - Zero-based index (0 = first element)
     * @returns Promise<void>
     * 
     * Note: Multiple elements with same ID is invalid HTML but may occur in practice.
     * 
     * @example
     * // Click second element with id="option"
     * await elementAction.clickIndexedElementById('option', 1);
     */
    async clickIndexedElementById(id: string, elementIndex: number){
        const ele = this.page.locator(this.common.getXPathWithId(id)).nth(elementIndex);
        await ele.click();
    }

    /**
     * Clicks element by placeholder attribute
     * 
     * WHAT: Locates input element by placeholder text, then clicks.
     * WHEN: Use for input fields identified by placeholder.
     * HOW: Gets element by placeholder, performs click.
     * 
     * @param placeholderText - Placeholder attribute value
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementByPlaceholder('Enter email address');
     */
    async clickElementByPlaceholder(placeholderText: string){
        await (await this.pageElement.getElementByPlaceholder(placeholderText)).click();
    }

    /**
     * Clicks element by XPath with conditional click logic
     * 
     * WHAT: Locates element by XPath and clicks with optional state-based conditions.
     * WHEN: Use when you need to conditionally click based on enabled/disabled state.
     * HOW: Checks element state, optionally ignores disabled elements, performs click.
     * 
     * @param elementXPath - XPath to locate element
     * @param shouldIgnoreIfDisabled - Skip click if element disabled (default: false)
     * @param disabledStatusAttribute - Custom attribute to check disabled state (default: '')
     * @param shouldForceClick - Force click even if element not actionable (default: false)
     * @returns Promise<Locator> - Clicked element locator, or null if not clicked
     * 
     * State Checking:
     *   - If shouldIgnoreIfDisabled=false: Attempts click regardless of state
     *   - If shouldIgnoreIfDisabled=true: Skips click if disabled
     *   - If disabledStatusAttribute provided: Checks custom attribute for "true"
     *   - If shouldForceClick=true: Forces click bypassing actionability checks
     * 
     * @example
     * // Click only if enabled
     * const clicked = await elementAction.clickElement('//button[@id="submit"]', true);
     * if (clicked) console.log('Button was clicked');
     * 
     * @example
     * // Force click hidden element
     * await elementAction.clickElement('//div[@class="overlay"]', false, '', true);
     */
    async clickElement(elementXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = '', shouldForceClick: boolean = false): Promise<Locator>{
        const element = this.page.locator(elementXPath);
        const result = await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute, shouldForceClick);
        return result ? element: null;
    }

    /**
     * Clicks element by exact text match with conditional logic
     * 
     * WHAT: Finds element containing exact text, clicks conditionally based on state.
     * WHEN: Use when clicking by visible text with state checking.
     * HOW: Constructs XPath with text match, delegates to clickElement().
     * 
     * @param elementText - Exact text content of element
     * @param shouldIgnoreIfDisabled - Skip if disabled (default: false)
     * @param disabledStatusAttribute - Custom disabled attribute (default: '')
     * @returns Promise<Locator> - Clicked element, or null if skipped
     * 
     * @example
     * await elementAction.clickElementHavingText('Submit Form', true);
     */
    async clickElementHavingText(elementText: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = ''): Promise<Locator>{
        const elementXPath = `//*[text()='${elementText}']`;
        return await this.clickElement(elementXPath, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }

    /**
     * Clicks element by text content (partial or exact match)
     * 
     * WHAT: Finds element containing text and performs click.
     * WHEN: Use for simple text-based clicking without conditional logic.
     * HOW: Uses getByText() to locate, then clicks.
     * 
     * @param elementText - Text to search for
     * @param isExactText - Exact text match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementByText('Submit'); // Partial match
     * await elementAction.clickElementByText('Submit', true); // Exact match
     */
    async clickElementByText(elementText: string, isExactText: boolean = false){
        await this.page.getByText(elementText, {exact: isExactText}).click();
    }

    /**
     * Clicks radio button option by text
     * 
     * WHAT: Selects radio button by its text label with conditional logic.
     * WHEN: Use for radio button selection by visible text.
     * HOW: Delegates to clickElementHavingText() for text-based clicking.
     * 
     * @param elementText - Radio button label text
     * @param shouldIgnoreIfDisabled - Skip if disabled (default: false)
     * @param disabledStatusAttribute - Custom disabled attribute (default: '')
     * @returns Promise<Locator> - Clicked radio button element
     * 
     * @example
     * await elementAction.clickRadioButtonOption('Male');
     */
    async clickRadioButtonOption(elementText: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = ''): Promise<Locator>{
        return await this.clickElementHavingText(elementText, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }
    /**
     * Clicks Nth element matching XPath with conditional logic
     * 
     * WHAT: Selects specific element by index when multiple match XPath, clicks conditionally.
     * WHEN: Use when XPath matches multiple elements and you need specific one.
     * HOW: Locates all matching elements, selects by nth(), checks state, clicks.
     * 
     * @param elementIndex - Zero-based index (0 = first matching element)
     * @param elementXPath - XPath expression matching multiple elements
     * @param shouldIgnoreIfDisabled - Skip if disabled (default: false)
     * @param disabledStatusAttribute - Custom disabled attribute (default: '')
     * @returns Promise<Locator> - Clicked element locator
     * 
     * @example
     * // Click third checkbox in form
     * await elementAction.clickIndexedElement(2, '//input[@type="checkbox"]', true);
     */
    async clickIndexedElement(elementIndex: number, elementXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute: string = ''): Promise<Locator> {
        const element = this.page.locator(elementXPath).nth(elementIndex);
        await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute);
        return element;
    }

    /**
     * Clicks child element within parent element context
     * 
     * WHAT: Finds child element relative to parent using XPath, clicks conditionally.
     * WHEN: Use for clicking elements within known parent container.
     * HOW: Uses parent.locator() with relative XPath, checks state, clicks.
     * 
     * @param parentElement - Parent element locator (starting context)
     * @param referenceXPath - Relative XPath from parent (e.g., './/button', './div/span')
     * @param shouldIgnoreIfDisabled - Skip if disabled (default: false)
     * @param disabledStatusAttribute - Custom disabled attribute (default: '')
     * @returns Promise<void>
     * 
     * @example
     * const card = await page.locator('.card');
     * await elementAction.clickReferenceElement(card, './/button[@class="submit"]');
     */
    async clickReferenceElement(parentElement: Locator, referenceXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute: string = ''){
        const element = parentElement.locator(referenceXPath);
        await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }
    
    /**
     * PRIVATE: Performs click with state validation and focus handling
     * 
     * WHAT: Central logic for conditional clicking based on element state.
     * WHEN: Used internally by all conditional click methods.
     * HOW: Checks disabled state (via attribute or isDisabled()), focuses, then clicks.
     * 
     * Logic Flow:
     *   1. If shouldIgnoreIfDisabled: Check if element disabled
     *   2. If disabledStatusAttribute provided: Check custom attribute === "true"
     *   3. If disabled: Return false (skip click)
     *   4. Focus element
     *   5. Click with optional force
     *   6. Return true (clicked)
     * 
     * @returns boolean - true if clicked, false if skipped
     */
    private async clickElementIfAppropriate(element:Locator, shouldIgnoreIfDisabled: boolean, disabledStatusAttribute:string, shouldForceClick: boolean = false){
        //fixture.logger.info('entering clickElementIfAppropriate');
        if (shouldIgnoreIfDisabled) {
            let isDisabled: boolean = false;
            if(disabledStatusAttribute){
                const temp = await element.getAttribute(disabledStatusAttribute);
                if(temp.toLowerCase() == "true")
                    isDisabled = true;
            }else{
                isDisabled = await element.isDisabled();
            }
            
            if (isDisabled)
                return false;
        }else{
            const isDisabled = await element.isDisabled();
            if(isDisabled)
                return false;
        }
        //fixture.logger.info('clickElementIfAppropriate before focus');
        await element.focus();
        //fixture.logger.info('clickElementIfAppropriate before click');
        await element.click({force: shouldForceClick});
        return true;
    }

    /**
     * Clicks text within labelled container
     * 
     * WHAT: Finds element by label, then clicks specific text within it.
     * WHEN: Use for clicking text inside labelled sections or form groups.
     * HOW: Gets element by label, finds child by text, clicks.
     * 
     * @param label - Label text to find container
     * @param txtToClick - Text within container to click
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickLabelledTextElement('Preferences', 'Email notifications');
     */
    async clickLabelledTextElement(label: string, txtToClick: string){
        await this.page.getByLabel(label).getByText(txtToClick).click();
    }

    /**
     * Clicks link by text content
     * 
     * WHAT: Locates link (<a> element) by text and clicks.
     * WHEN: Use for clicking hyperlinks by visible text.
     * HOW: Uses getByText() to find link, performs click.
     * 
     * @param linkTxt - Link text content
     * @param isExact - Exact text match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickLinkElement('Learn More');
     */
    async clickLinkElement(linkTxt: string, isExact: boolean = false){
        await this.page.getByText(linkTxt, {exact: isExact}).click();
    }

    /**
     * Clicks element by associated label
     * 
     * WHAT: Finds input element by its label text, clicks it.
     * WHEN: Use for form inputs identified by their label.
     * HOW: Gets element by label, performs click, returns locator.
     * 
     * @param labelName - Label text associated with element
     * @param isExact - Exact label match (default: false)
     * @returns Promise<Locator> - Clicked element
     * 
     * @example
     * await elementAction.clickElementByLabel('Agree to terms');
     */
    async clickElementByLabel(labelName: string, isExact: boolean = false): Promise<Locator>{
        const element = await this.pageElement.getElementByLabel(labelName, isExact);
        await element.click();
        return element;
    }

    /**
     * Selects dropdown option by clicking label then selecting value
     * 
     * WHAT: Clicks dropdown by label, then selects specific option.
     * WHEN: Use for <select> dropdowns identified by label.
     * HOW: Clicks element by label, calls selectOption() with value.
     * 
     * @param dropDownLabelName - Label text for dropdown
     * @param optionToSelect - Option value or text to select
     * @param isExact - Exact label match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.selectDropdownOptionByParentLabel('Country', 'USA');
     */
    async selectDropdownOptionByParentLabel(dropDownLabelName: string, optionToSelect: string, isExact: boolean = false){
        const locator = await this.clickElementByLabel(dropDownLabelName, isExact);
        await locator.selectOption(optionToSelect);
    }
    /**
     * Clicks element by data-testid attribute
     * 
     * WHAT: Locates element by test-id, optionally selects by index, clicks.
     * WHEN: Use for elements with data-testid (recommended testing practice).
     * HOW: Gets element by test-id with optional index, performs click.
     * 
     * @param testId - data-testid attribute value
     * @param index - Element index if multiple match (default: 0)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementByTestId('submit-button');
     * await elementAction.clickElementByTestId('option', 2); // Click 3rd option
     */
    async clickElementByTestId(testId: string, index: number = 0){
        const element = await this.pageElement.getElementByTestId(testId,index);
        await element.click();
    }

    /**
     * Clicks element within test-id container by role
     * 
     * WHAT: Finds container by test-id, then clicks child element by role.
     * WHEN: Use when element is inside test-id container and has ARIA role.
     * HOW: Gets parent by test-id, finds child by role, clicks.
     * 
     * @param testId - Parent element's data-testid
     * @param role - ARIA role of child element to click
     * @returns Promise<Locator> - Parent element locator
     * 
     * @example
     * await elementAction.clickItemByTestIdAndRole('modal', HtmlRoles.BUTTON);
     */
    async clickItemByTestIdAndRole(testId: string, role: any): Promise<Locator>{
        const element = await this.pageElement.getElementByTestId(testId);
        /*eslint @typescript-eslint/no-unsafe-argument: "off" */
        await element.getByRole(role).click();
        return element;
    }

    /**
     * Clicks element by combining locator path and ARIA role
     * 
     * WHAT: Finds element matching both locator and role, then clicks.
     * WHEN: Use when element needs both location and role specification.
     * HOW: Gets element by locator and role combination, clicks.
     * 
     * @param locator - CSS selector or XPath
     * @param role - ARIA role from HtmlRoles
     * @returns Promise<Locator> - Clicked element
     * 
     * @example
     * await elementAction.clickItemByLocatorAndRole('.toolbar', HtmlRoles.BUTTON);
     */
    async clickItemByLocatorAndRole(locator: string, role: any): Promise<Locator>{
        const element = await this.pageElement.getElementByLocatorAndRole(locator, role);
        /*eslint @typescript-eslint/no-unsafe-argument: "off" */
        await element.click();
        return element;
    }

    /**
     * Clicks element by ARIA role with optional accessible name
     * 
     * WHAT: Finds element by ARIA role, optionally filtered by name, clicks.
     * WHEN: Use for accessibility-friendly element identification.
     * HOW: Uses getByRole() with optional name filter, performs click.
     * 
     * @param role - ARIA role (e.g., HtmlRoles.BUTTON, HtmlRoles.LINK)
     * @param name - Optional accessible name filter (default: "")
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementByRole(HtmlRoles.BUTTON, 'Submit');
     * await elementAction.clickElementByRole(HtmlRoles.CHECKBOX); // Any checkbox
     */
    async clickElementByRole(role: any, name: string =""){
        if(name.length == 0)
            await this.page.getByRole(role).click();
        else
            await this.page.getByRole(role, {name : name}).click();
    }

    /**
     * Clicks child element by role within parent XPath context
     * 
     * WHAT: Finds parent by XPath, then clicks child by role and optional name.
     * WHEN: Use for clicking role-based elements within specific container.
     * HOW: Locates parent by XPath, finds child by role, clicks.
     * 
     * @param parentElementXPath - XPath of parent container
     * @param role - ARIA role of child element
     * @param name - Optional accessible name (default: "")
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickChildElementByRole('//div[@id="toolbar"]', HtmlRoles.BUTTON, 'Save');
     */
    async clickChildElementByRole(parentElementXPath: string, role: any, name: string =""){
        if(name.length == 0)
            await this.page.locator(parentElementXPath).getByRole(role).click();
        else
            await this.page.locator(parentElementXPath).getByRole(role, {name : name}).click();
    }

    /**
     * Clicks child element by placeholder within parent XPath context
     * 
     * WHAT: Finds parent by XPath, then clicks child by placeholder text.
     * WHEN: Use for clicking inputs by placeholder inside specific container.
     * HOW: Locates parent, finds child by placeholder, clicks.
     * 
     * @param parentElementXPath - XPath of parent container
     * @param placeholderTxt - Placeholder text of child element
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickChildElementByPlaceholder('//form', 'Search...');
     */
    async clickChildElementByPlaceholder(parentElementXPath: string, placeholderTxt: any){
        await this.page.locator(parentElementXPath).getByPlaceholder(placeholderTxt).click();
    }

    /**
     * Clicks child element by text within parent XPath context
     * 
     * WHAT: Finds parent by XPath, then clicks child containing text.
     * WHEN: Use for clicking text elements within specific container.
     * HOW: Locates parent, finds child by text, clicks.
     * 
     * @param parentElementXPath - XPath of parent container
     * @param text - Text content of child element
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickChildElementByText('//nav', 'Settings');
     */
    async clickChildElementByText(parentElementXPath: string, text: any){
        await this.page.locator(parentElementXPath).getByText(text).click();
    }
    /**
     * Clicks table cell by accessible name
     * 
     * WHAT: Finds table cell by role="cell" and accessible name, clicks.
     * WHEN: Use for clicking cells in accessible tables.
     * HOW: Uses getByRole(TABLE_CELL) with name filter, clicks.
     * 
     * @param cellName - Accessible name of table cell
     * @param isExact - Exact name match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickTableCell('John Doe');
     * await elementAction.clickTableCell('Edit', true);
     */
    async clickTableCell(cellName: string, isExact: boolean = false){
        let element: Locator;
        if(isExact)
        {
            element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: cellName, exact: true})
        }else{
            element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: cellName})
        }
        await element.click();
    }

    /**
     * Clicks any element containing text
     * 
     * WHAT: Finds any element with matching text, clicks it.
     * WHEN: Use as generic text-based click when element type unknown.
     * HOW: Uses getByText() to locate, performs click.
     * 
     * @param textToClick - Text content to find and click
     * @param isExact - Exact text match (default: false)
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickItemByText('Continue');
     */
    async clickItemByText(textToClick: string, isExact: boolean = false){
        await this.page.getByText(textToClick, {exact: isExact}).click();
    }

    /**
     * Clicks element by tag name and attribute value
     * 
     * WHAT: Finds element by tag name and specific attribute value, clicks.
     * WHEN: Use when element identified by tag + attribute combination.
     * HOW: Gets element by name and attribute, performs click.
     * 
     * @param elementName - HTML tag name (e.g., 'div', 'button', 'input')
     * @param attributeName - Attribute name (e.g., 'data-id', 'class')
     * @param attributeValue - Expected attribute value
     * @returns Promise<void>
     * 
     * @example
     * await elementAction.clickElementByNameAndAttributeValue('button', 'data-action', 'submit');
     */
    async clickElementByNameAndAttributeValue(elementName: string, attributeName: string, attributeValue:string){
        await (await this.pageElement.getElementByNameAndAttributeValue(elementName, attributeName, attributeValue)).click();
    }
}