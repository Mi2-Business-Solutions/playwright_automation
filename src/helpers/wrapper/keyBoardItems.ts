/**
 * @file Keyboard Key and Shortcut Constants
 * 
 * WHAT this file provides:
 * Defines constants for keyboard keys and key combinations used in browser automation.
 * These constants represent Playwright-compatible key names for simulating keyboard input.
 * 
 * WHY this exists:
 * - Centralizes keyboard key names used throughout the framework
 * - Prevents typos in key names ('Tab' vs 'tab', 'Enter' vs 'enter')
 * - Provides correct Playwright key syntax (case-sensitive)
 * - Makes keyboard interactions more readable
 * - Easy to extend with new key combinations
 * - Ensures cross-platform compatibility
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer
 * - Used by: PlaywrightWrapperKeyboard, Page Objects, Step Definitions
 * - Dependencies: None (pure constants)
 * - Referenced in: Keyboard navigation, form submission, page refresh, shortcuts
 * 
 * WHEN to use:
 * - When simulating keyboard key presses in tests
 * - For form navigation (Tab key to move between fields)
 * - For submitting forms (Enter key)
 * - For page refresh operations (F5 key)
 * - When implementing keyboard shortcuts in tests
 * 
 * Important notes:
 * - Key names are case-sensitive in Playwright
 * - These match Playwright's keyboard.press() API requirements
 * - Modifier keys use '+' syntax (Shift+Tab)
 */

/**
 * KeyBoardItems class
 * 
 * RESPONSIBILITY:
 * Provides named constants for keyboard keys and key combinations supported by Playwright's
 * keyboard API. Acts as a vocabulary for keyboard interactions in test automation.
 * 
 * KEYBOARD KEYS ENCAPSULATED:
 * - Navigation keys: Tab, Shift+Tab
 * - Action keys: Enter
 * - Function keys: F5
 * 
 * PLAYWRIGHT KEYBOARD API:
 * - Used with page.keyboard.press(key)
 * - Used with locator.press(key)
 * - Supports modifier combinations (Shift+, Ctrl+, Alt+)
 * 
 * WHEN TO USE:
 * - Always use these constants instead of string literals
 * - Reference in keyboard wrapper methods
 * - Use in form navigation and submission tests
 * - Include in keyboard shortcut implementations
 */
export default class KeyBoardItems{
    /**
     * Tab key - forward navigation
     * 
     * WHAT: The Tab keyboard key for forward focus navigation
     * WHEN: Use to move focus to the next interactive element
     * 
     * Browser Behavior:
     *   - Moves focus to next focusable element (inputs, buttons, links)
     *   - Follows DOM order by default
     *   - Respects tabindex attributes (custom tab order)
     *   - Can trigger focus/blur events
     * 
     * Common Use Cases:
     *   - Form field navigation (email → password → submit)
     *   - Testing tab order/accessibility
     *   - Moving through multiple inputs quickly
     *   - Triggering auto-complete or validation on blur
     *   - Focus trap testing in modals
     * 
     * Form Interaction Pattern:
     *   ```typescript
     *   await emailField.fill('user@example.com');
     *   await emailField.press(KeyBoardItems.TAB);
     *   // Focus moves to password field
     *   await passwordField.fill('password123');
     *   await passwordField.press(KeyBoardItems.TAB);
     *   // Focus moves to submit button
     *   ```
     * 
     * Accessibility Testing:
     *   - Verify all interactive elements are reachable via Tab
     *   - Check visible focus indicators appear
     *   - Ensure logical tab order matches visual layout
     *   - Test keyboard-only navigation through entire page
     * 
     * @example
     * // In keyboard wrapper - tab to next field
     * async tabOutFromCurrentElement(element: Locator) {
     *   await element.press(KeyBoardItems.TAB);
     * }
     * 
     * @example
     * // In Page Object - fill form using Tab navigation
     * async fillLoginForm(email, password) {
     *   await this.emailInput.fill(email);
     *   await this.emailInput.press(KeyBoardItems.TAB);
     *   await this.passwordInput.fill(password);
     * }
     * 
     * @example
     * // In test - verify tab order
     * await page.locator('#first').focus();
     * await page.keyboard.press(KeyBoardItems.TAB);
     * const focused = await page.locator(':focus').getAttribute('id');
     * expect(focused).toBe('second');
     */
    static readonly TAB = 'Tab';
    
    /**
     * Shift+Tab key combination - backward navigation
     * 
     * WHAT: Shift+Tab key combination for reverse focus navigation
     * WHEN: Use to move focus to the previous interactive element
     * 
     * Browser Behavior:
     *   - Moves focus to previous focusable element
     *   - Reverses normal Tab key direction
     *   - Follows reverse DOM order
     *   - Respects tabindex in reverse
     * 
     * Common Use Cases:
     *   - Going back to previous form field
     *   - Correcting input in earlier field
     *   - Testing reverse tab order
     *   - Keyboard-only navigation backwards
     *   - Accessibility testing (bidirectional navigation)
     * 
     * Why Reverse Navigation Matters:
     *   - Users need to fix mistakes in previous fields
     *   - Accessibility requires bidirectional keyboard navigation
     *   - Form workflows may require back-and-forth movement
     *   - Testing edge cases in tab order
     * 
     * @example
     * // In keyboard wrapper - tab backwards
     * async tabOutToPreviousElement() {
     *   await this.page.locator('body').press(KeyBoardItems.SHIFT_TAB);
     * }
     * 
     * @example
     * // In test - go back to previous field
     * await passwordField.fill('wrong');
     * await page.keyboard.press(KeyBoardItems.SHIFT_TAB);
     * // Focus returns to email field
     * await emailField.fill('correct@email.com');
     * 
     * @example
     * // Testing reverse tab order
     * await page.locator('#last').focus();
     * await page.keyboard.press(KeyBoardItems.SHIFT_TAB);
     * const focused = await page.locator(':focus').getAttribute('id');
     * expect(focused).toBe('second');
     */
    static readonly SHIFT_TAB = 'Shift+Tab';
    
    /**
     * Enter key - form submission and activation
     * 
     * WHAT: The Enter/Return keyboard key
     * WHEN: Use to submit forms, activate buttons, or trigger actions
     * 
     * Browser Behavior:
     *   - Submits forms when focus is on input field
     *   - Activates focused button (simulates click)
     *   - Triggers default action of focused element
     *   - May trigger Enter key event handlers
     * 
     * Common Use Cases:
     *   - Submitting login/search forms
     *   - Activating buttons without clicking
     *   - Confirming dialogs
     *   - Adding items to lists (Enter to add)
     *   - Multi-line text: Shift+Enter for new line
     * 
     * Form Submission Pattern:
     *   - Focus in text input + Enter = submit form
     *   - Focus on button + Enter = click button
     *   - Focus on link + Enter = navigate to link
     * 
     * Important Notes:
     *   - Only submits if form has submit button or onsubmit handler
     *   - May behave differently in single vs multi-input forms
     *   - Some inputs prevent default Enter behavior
     *   - Textarea uses Enter for line breaks (not submission)
     * 
     * @example
     * // In Page Object - submit form with Enter
     * async loginWithEnter(email, password) {
     *   await this.emailInput.fill(email);
     *   await this.passwordInput.fill(password);
     *   await this.passwordInput.press(KeyBoardItems.ENTER);
     *   // Form submits
     * }
     * 
     * @example
     * // In test - search using Enter key
     * await searchBox.fill('playwright');
     * await searchBox.press(KeyBoardItems.ENTER);
     * await page.waitForURL('**'/search?q=playwright');
     * 
     * @example
     * // Activate button with keyboard
     * await submitButton.focus();
     * await page.keyboard.press(KeyBoardItems.ENTER);
     * // Same as clicking the button
     */
    static readonly ENTER = 'Enter';
    
    /**
     * F5 function key - page refresh
     * 
     * WHAT: The F5 function key that triggers browser page refresh
     * WHEN: Use to reload the current page (same as clicking browser refresh button)
     * 
     * Browser Behavior:
     *   - Reloads current page from server/cache
     *   - Equivalent to clicking browser refresh button
     *   - Resubmits forms if refreshing POST request
     *   - Clears JavaScript state but preserves cookies/storage
     *   - May show "Confirm Form Resubmission" dialog
     * 
     * Common Use Cases:
     *   - Testing page behavior after refresh
     *   - Verifying data persistence across reloads
     *   - Simulating user refreshing page
     *   - Clearing temporary page state
     *   - Testing if unsaved changes warning appears
     * 
     * When to Use vs page.reload():
     *   - F5: Simulates real user refresh action (keyboard)
     *   - page.reload(): Direct API call (more reliable for testing)
     *   - F5: Tests keyboard shortcut functionality
     *   - page.reload(): Better for routine page reloading
     * 
     * Important Notes:
     *   - Triggers beforeunload event (can show confirmation dialog)
     *   - May be intercepted by page JavaScript
     *   - Loses JavaScript variable state
     *   - Preserves cookies, localStorage, sessionStorage
     *   - URL stays the same after refresh
     * 
     * @example
     * // In wrapper - refresh page with F5
     * async refreshCurrentPage() {
     *   await this.keyBoard.pressKeyBoard(null, KeyBoardItems.F5);
     *   await this.page.waitForLoadState('domcontentloaded');
     * }
     * 
     * @example
     * // In test - verify data persists after refresh
     * await page.fill('#note', 'Important data');
     * await page.keyboard.press(KeyBoardItems.F5);
     * await page.waitForLoadState();
     * const value = await page.locator('#note').inputValue();
     * expect(value).toBe('Important data'); // If saved to localStorage
     * 
     * @example
     * // Testing unsaved changes warning
     * await page.fill('#form-field', 'Unsaved data');
     * page.once('dialog', dialog => dialog.accept());
     * await page.keyboard.press(KeyBoardItems.F5);
     * // Dialog may appear asking to confirm page leave
     */
    static readonly F5 = 'F5';
}