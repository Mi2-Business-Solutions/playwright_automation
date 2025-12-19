/**
 * @file Keyboard Interaction Wrapper for Playwright
 * 
 * WHAT this file abstracts:
 * This wrapper encapsulates Playwright's keyboard interaction APIs, providing simplified methods for
 * simulating keyboard input, form navigation via Tab key, and focus management. It abstracts both
 * page-level keyboard events and element-specific key presses.
 * 
 * WHY this wrapper exists:
 * - Simplifies keyboard interactions with unified pressKeyBoard() method
 * - Provides semantic methods for common patterns (Tab navigation, focus tracking)
 * - Handles both page-level and element-level keyboard events consistently
 * - Enables easy form navigation testing without repetitive code
 * - Supports accessibility testing through keyboard-only navigation
 * - Centralizes keyboard interaction logic for maintainability
 * 
 * WHERE this fits in automation architecture:
 * - Layer: Core Wrapper Layer (keyboard interactions)
 * - Used by: Page Objects, Step Definitions, Form Navigation Tests
 * - Dependencies: PlaywrightWrapperCommon, KeyBoardItems constants
 * - Position: Specialized wrapper for keyboard-only interactions
 * 
 * WHEN tests should use this wrapper:
 * - When simulating user keyboard input (Tab, Enter, F5, etc.)
 * - For form field navigation using Tab key
 * - When testing keyboard accessibility (keyboard-only workflows)
 * - For focus management and focus tracking
 * - When implementing keyboard shortcuts in tests
 * - For testing auto-complete or on-blur validations triggered by Tab
 * 
 * Important dependencies:
 * - Playwright Page and Locator objects
 * - KeyBoardItems constants for key names
 * - CssItems for focus pseudo-selector
 * - StringValidator for input validation
 */

/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Locator, Page } from "@playwright/test";
import KeyBoardItems from "./keyBoardItems";
import StringValidator from "../types/stringValidator";
import CssItems from "./cssItems";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperCommon from "./pwWrapperCommon";

/**
 * PlaywrightWrapperKeyboard class
 * 
 * RESPONSIBILITY:
 * Provides keyboard interaction methods for simulating user keyboard input in browser automation.
 * Handles both page-level keyboard events and element-specific key presses with consistent interface.
 * 
 * PLAYWRIGHT FEATURES ENCAPSULATED:
 * - page.keyboard.press() - Page-level keyboard events
 * - locator.press() - Element-specific key presses
 * - Focus tracking with :focus pseudo-selector
 * - Tab navigation for form field traversal
 * 
 * WHEN TO USE:
 * - Use for any keyboard input simulation in tests
 * - Use for form navigation with Tab/Shift+Tab
 * - Use when testing keyboard accessibility
 * - Use instead of calling page.keyboard.press() or locator.press() directly
 */
export default class PlaywrightWrapperKeyboard{

    constructor(private page: Page, private common: PlaywrightWrapperCommon) { }

    /**
     * Presses a keyboard key either on specific element or at page level
     * 
     * WHAT: Simulates pressing a keyboard key, with support for both element-focused and page-level key presses.
     * WHEN: Use when you need to simulate any keyboard key press (Tab, Enter, Arrow keys, F-keys, etc.).
     * HOW: Routes to element.press() if element provided, otherwise uses page.keyboard.press() for page-level events.
     * 
     * @param element - The element to press key on (null for page-level key press)
     *   Parameter Type: Locator | null
     *   
     *   Element Behavior:
     *     - If element provided: Key press targets that specific element (must have focus)
     *     - If null/undefined: Key press at page level (affects focused element or page)
     *   
     *   When to use element-specific:
     *     - Pressing key on specific input field
     *     - Form submission via Enter on password field
     *     - Tab out from known element
     *   
     *   When to use page-level (null):
     *     - Page refresh (F5)
     *     - Global keyboard shortcuts
     *     - When you don't know which element has focus
     * 
     * @param keyToPress - The keyboard key name to press
     *   Parameter Type: string (required)
     *   
     *   Key Name Format:
     *     - Single keys: 'Tab', 'Enter', 'Escape', 'A', '1'
     *     - Function keys: 'F1', 'F5', 'F12'
     *     - Modifiers combinations: 'Shift+Tab', 'Ctrl+A', 'Alt+F4'
     *     - Special keys: 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete'
     *   
     *   Best Practice:
     *     - Use KeyBoardItems constants instead of string literals
     *     - Example: KeyBoardItems.TAB instead of 'Tab'
     * 
     * @param delayOrTimeoutInMillSec - Delay in milliseconds between key down and key up events
     *   Parameter Type: number (default: 0)
     *   Default: 0ms (immediate key press and release)
     *   
     *   Delay Purpose:
     *     - Simulates human typing speed
     *     - Useful for triggering key-down/key-up event handlers
     *     - Can help with timing-sensitive UI updates
     *   
     *   When to use delay:
     *     - Testing real-time validation during typing
     *     - Simulating slow typing users
     *     - When UI updates based on key press duration
     *   
     *   Note: Only applies to page-level key press (not element-specific)
     * 
     * Return Type: Promise<void>
     * 
     * Use Cases:
     *   - Tab navigation:
     *     ```
     *     await keyboard.pressKeyBoard(emailField, KeyBoardItems.TAB);
     *     ```
     *   - Page refresh:
     *     ```
     *     await keyboard.pressKeyBoard(null, KeyBoardItems.F5);
     *     ```
     *   - Form submission:
     *     ```
     *     await keyboard.pressKeyBoard(passwordField, KeyBoardItems.ENTER);
     *     ```
     * 
     * @returns Promise<void> - Resolves when key press complete
     * 
     * @example
     * // Element-specific key press - Tab out from email field
     * const emailField = await page.locator('#email');
     * await keyboard.pressKeyBoard(emailField, KeyBoardItems.TAB);
     * 
     * @example
     * // Page-level key press - Refresh page
     * await keyboard.pressKeyBoard(null, KeyBoardItems.F5);
     * 
     * @example
     * // With delay for slower typing
     * await keyboard.pressKeyBoard(null, 'A', 500); // 500ms delay
     */
    async pressKeyBoard(element: Locator, keyToPress: string, delayOrTimeoutInMillSec: number = 0){
        const options = {delay: 0};
        if(delayOrTimeoutInMillSec >= 0)
            options.delay = delayOrTimeoutInMillSec

        if(element == undefined || element == null)
            await this.page.keyboard.press(keyToPress, options);
        else{
            await element.press(keyToPress);
        }
    }

    /**
     * Presses Tab key to move focus from current element to next
     * 
     * WHAT: Simulates pressing Tab key on a specific element to move focus forward.
     * WHEN: Use to navigate to the next form field or interactive element.
     * HOW: Calls pressKeyBoard() with TAB key on the specified element.
     * 
     * @param element - The element currently focused that will have Tab pressed on it
     * 
     * @returns Promise<void>
     * 
     * @example
     * // In Page Object - move from email to password field
     * await this.emailField.fill('user@example.com');
     * await keyboard.tabOutFromCurrentElement(this.emailField);
     * // Focus now on password field
     */
    async tabOutFromCurrentElement(element: Locator) {
        //await element.press(KeyBoardItems.TAB);
        await this.pressKeyBoard(element, KeyBoardItems.TAB);
    }
    
    /**
     * Presses Tab key multiple times and returns the finally focused element
     * 
     * WHAT: Navigates forward through focusable elements using Tab key and returns the element that ends up focused.
     * WHEN: Use when you need to tab through multiple fields and get reference to the final focused element.
     * HOW: Presses Tab specified number of times, tracking focus with :focus pseudo-selector.
     * 
     * @param currentElementLocatorIdentifier - CSS selector for starting element (optional)
     *   Parameter Type: string
     *   If empty/invalid: Starts from currently focused element (:focus)
     *   If provided: Starts Tab navigation from this element
     * 
     * @param noOfTimesToTabOut - Number of times to press Tab key
     *   Parameter Type: number (required)
     *   
     *   Behavior:
     *     - 0 or less: Returns starting element without tabbing
     *     - 1: Presses Tab once, returns next focused element
     *     - 2+: Presses Tab multiple times, returns final focused element
     * 
     * @returns Promise<Locator> - Locator for the element that has focus after tabbing
     * 
     * @example
     * // Tab through 3 fields starting from email
     * const finalElement = await keyboard.tabOutFromCurrentAndGetFocusedElement('#email', 3);
     * // finalElement is the 3rd field after email
     * 
     * @example
     * // Tab from currently focused element
     * const nextField = await keyboard.tabOutFromCurrentAndGetFocusedElement('', 1);
     */
    async tabOutFromCurrentAndGetFocusedElement(currentElementLocatorIdentifier: string, noOfTimesToTabOut: number){
        //const PSEUDO_CSS_FOR_FOCUS = '*:focus';
        let tempLocator = currentElementLocatorIdentifier;
        if(!StringValidator.isValidString(tempLocator))
            tempLocator = CssItems.FOCUS;
        
        const tempElement = this.page.locator(tempLocator);
        if (noOfTimesToTabOut < 1)
            return tempElement;

        await this.pressKeyBoard(tempElement, KeyBoardItems.TAB);

        if (noOfTimesToTabOut > 1)
        {
            for (let index = 0; index < noOfTimesToTabOut - 1; index++) {
                const tempFocusedElement = this.page.locator(CssItems.FOCUS);
                await this.pressKeyBoard(tempFocusedElement, KeyBoardItems.TAB);
            }
        }
        return this.page.locator(CssItems.FOCUS);
    }

    /**
     * Presses Shift+Tab to move focus to previous element
     * 
     * WHAT: Simulates pressing Shift+Tab at page level to move focus backward.
     * WHEN: Use to navigate to the previous form field or go back in tab order.
     * HOW: Presses Shift+Tab on page body element.
     * 
     * @returns Promise<void>
     * 
     * @example
     * // In test - go back to previous field to correct input
     * await passwordField.fill('wrong');
     * await keyboard.tabOutToPreviousElement();
     * // Focus returns to email field
     */
    async tabOutToPreviousElement(){
        await this.page.locator(HtmlRoles.PAGE_BODY).press(KeyBoardItems.SHIFT_TAB); 
    }

    /**
     * Presses Tab to move focus to next element at page level
     * 
     * WHAT: Simulates pressing Tab at page level to move focus forward.
     * WHEN: Use when you don't have reference to current element but need to tab forward.
     * HOW: Presses Tab on page body element.
     * 
     * @returns Promise<void>
     * 
     * @example
     * // In test - tab to next interactive element
     * await keyboard.tabOutToNextElement();
     * const focused = await page.locator(':focus');
     */
    async tabOutToNextElement(){
        await this.page.locator(HtmlRoles.PAGE_BODY).press(KeyBoardItems.TAB); 
    }
}