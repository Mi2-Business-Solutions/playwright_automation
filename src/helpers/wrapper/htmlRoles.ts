/**
 * @file ARIA Roles and HTML Element Type Constants
 * 
 * WHAT this file provides:
 * Comprehensive collection of ARIA role names and HTML element types used for element identification
 * in Playwright tests. These constants represent semantic roles and element names that Playwright's
 * getByRole() method and XPath selectors use to find elements.
 * 
 * WHY this exists:
 * - Centralizes all ARIA role and element type strings in one place
 * - Prevents typos in role/element names ('button' vs 'buton')
 * - Provides IntelliSense/autocomplete for available roles
 * - Makes code more readable and self-documenting
 * - Enables easy updates if role names change
 * - Supports accessibility-first element location strategy
 * 
 * WHERE this fits:
 * - Layer: Constants/Configuration Layer  
 * - Used by: All wrapper classes, Page Objects, Step Definitions
 * - Dependencies: None (pure constants)
 * - Referenced in: getByRole(), XPath builders, element selection methods
 * 
 * WHEN to use:
 * - Always use these constants with getByRole() methods
 * - Use when building XPath selectors with element names
 * - Reference when finding elements by semantic role
 * - Use in accessibility-first testing strategies
 * 
 * Important notes:
 * - These match ARIA role specifications and HTML element names
 * - Roles are case-sensitive in Playwright
 * - Prefer role-based selectors for better test resilience
 */

/**
 * HtmlRoles class
 * 
 * RESPONSIBILITY:
 * Provides named constants for ARIA roles and HTML element types used throughout the automation
 * framework. Acts as a comprehensive vocabulary for semantic element identification.
 * 
 * ARIA ROLES INCLUDED:
 * - Form controls: button, textbox, combobox, checkbox, etc.
 * - Navigation: link, navigation, tab, menuitem
 * - Structure: table, row, cell, heading
 * - Containers: list, listitem
 * 
 * HTML ELEMENT TYPES INCLUDED:
 * - Standard elements: input, img, body, textarea
 * - Table elements: table, tbody, tr, td
 * - List elements: li
 * 
 * WHEN TO USE:
 * - Always use these constants instead of string literals for roles
 * - Reference in wrapper methods that accept role parameters
 * - Use with Playwright's getByRole() for accessible element selection
 * - Include in XPath expressions with element type filters
 */
export default class HtmlRoles{
    /** 
     * Combobox role - dropdown/select elements
     * ARIA role for dropdown menus and autocomplete inputs.
     * Applies to: <select>, <input role="combobox">
     * Use for: Dropdown selections, searchable selects, autocomplete fields
     * @example page.getByRole(HtmlRoles.COMBOBOX, { name: 'Country' })
     */
    static readonly COMBOBOX = 'combobox';
    
    /** 
     * Option role - dropdown option items
     * ARIA role for individual options within a combobox/listbox.
     * Applies to: <option>, elements with role="option"
     * Use for: Selecting specific dropdown values
     * @example page.getByRole(HtmlRoles.OPTION, { name: 'United States' })
     */
    static readonly OPTION = 'option';
    
    /** 
     * Textbox role - text input fields
     * ARIA role for single-line text input elements.
     * Applies to: <input type="text">, <input type="email">, etc.
     * Use for: Text fields, email inputs, search boxes
     * @example page.getByRole(HtmlRoles.TEXT_BOX, { name: 'Email' })
     */
    static readonly TEXT_BOX = 'textbox';
    
    /** 
     * Textarea HTML element
     * HTML element name for multi-line text input.
     * Use in XPath: //textarea[@id='comments']
     * @example const xpath = `//${HtmlRoles.TEXT_AREA}[@name='description']`
     */
    static readonly TEXT_AREA = 'textarea';
    
    /** 
     * Table role - data table container
     * ARIA role for table structures.
     * Applies to: <table>, elements with role="table"
     * Use for: Locating table containers
     * @example page.getByRole(HtmlRoles.TABLE)
     */
    static readonly TABLE = 'table';
    
    /** 
     * Table body HTML element
     * HTML element name for table body section.
     * Use in XPath: //tbody/tr
     * @example `//${HtmlRoles.TABLE_BODY}/${HtmlRoles.TABLE_ROW}`
     */
    static readonly TABLE_BODY = 'tbody';
    
    /** 
     * Row role - table row with ARIA role
     * ARIA role for table rows.
     * Applies to: <tr role="row">, grid rows
     * Use for: Finding rows in ARIA grids
     * @example page.getByRole(HtmlRoles.TABLE_ROW_ROLE)
     */
    static readonly TABLE_ROW_ROLE = 'row';
    
    /** 
     * Table row HTML element
     * HTML element name for table row.
     * Use in XPath: //tr[1]
     * @example `//${HtmlRoles.TABLE_ROW}[${rowIndex}]`
     */
    static readonly TABLE_ROW = 'tr';
    
    /** 
     * Table data HTML element
     * HTML element name for table data cells.
     * Use in XPath: //td[2]
     * @example `//tr[1]/${HtmlRoles.TABLE_DATA}[2]`
     */
    static readonly TABLE_DATA = 'td';
    
    /** 
     * Cell role - table/grid cell
     * ARIA role for table cells in grids.
     * Applies to: <td role="cell">, grid cells
     * Use for: Finding cells in ARIA grids
     * @example page.getByRole(HtmlRoles.TABLE_CELL)
     */
    static readonly TABLE_CELL = 'cell';
    
    /** 
     * Link role - hyperlink elements
     * ARIA role for clickable links.
     * Applies to: <a href="...">, elements with role="link"
     * Use for: Navigation links, hyperlinks
     * @example page.getByRole(HtmlRoles.LINK, { name: 'Learn More' })
     */
    static readonly LINK = 'link';
    
    /** 
     * Button role - clickable button elements
     * ARIA role for interactive buttons.
     * Applies to: <button>, <input type="button">, elements with role="button"
     * Use for: All button interactions
     * @example page.getByRole(HtmlRoles.BUTTON, { name: 'Submit' })
     */
    static readonly BUTTON = 'button';
    
    /** 
     * Input HTML element
     * HTML element name for input fields.
     * Use in XPath: //input[@type='text']
     * @example `//${HtmlRoles.INPUT}[@name='username']`
     */
    static readonly INPUT = 'input';
    
    /** 
     * List item HTML element
     * HTML element name for list items.
     * Use in XPath: //ul/li[1]
     * @example `//${HtmlRoles.LIST_ITEM}[contains(text(), 'Item 1')]`
     */
    static readonly LIST_ITEM = 'li';
    
    /** 
     * Body HTML element
     * HTML element name for document body.
     * Use for: Page-level keyboard events
     * @example page.locator(HtmlRoles.PAGE_BODY).press('Tab')
     */
    static readonly PAGE_BODY = 'body';
    
    /** 
     * Options list role - listbox containing options
     * ARIA role for option containers.
     * Applies to: Dropdown menus, listboxes
     * @example page.getByRole(HtmlRoles.OPTIONS_LIST)
     */
    static readonly OPTIONS_LIST = 'Options list';
    
    /** 
     * Heading role - header elements (h1-h6)
     * ARIA role for heading elements.
     * Applies to: <h1>, <h2>, ..., <h6>, elements with role="heading"
     * Use for: Finding page headings
     * @example page.getByRole(HtmlRoles.HEADING, { name: 'Dashboard' })
     */
    static readonly HEADING = 'heading';
    
    /** 
     * Menu item role - clickable menu options
     * ARIA role for items in menus.
     * Applies to: Menu items, dropdown options
     * Use for: Selecting from context menus, dropdowns
     * @example page.getByRole(HtmlRoles.MENU_ITEM, { name: 'Settings' })
     */
    static readonly MENU_ITEM = 'menuitem';
    
    /** 
     * Tab role - tab navigation elements
     * ARIA role for tab controls in tab panels.
     * Applies to: Tab navigation buttons
     * Use for: Switching between tab panels
     * @example page.getByRole(HtmlRoles.TAB, { name: 'Profile' })
     */
    static readonly TAB = 'tab';
    
    /** 
     * Image HTML element
     * HTML element name for images.
     * Use in XPath: //img[@alt='Logo']
     * @example `//${HtmlRoles.IMG}[@src='logo.png']`
     */
    static readonly IMG = 'img';
    
    /** 
     * Checkbox role - checkbox input elements
     * ARIA role for checkbox controls.
     * Applies to: <input type="checkbox">, elements with role="checkbox"
     * Use for: Checkbox interactions
     * @example page.getByRole(HtmlRoles.CHECKBOX, { name: 'I agree' })
     */
    static readonly CHECKBOX = 'checkbox';
    
    /** 
     * Navigation role - navigation landmark
     * ARIA role for navigation sections.
     * Applies to: <nav>, elements with role="navigation"
     * Use for: Finding navigation menus
     * @example page.getByRole(HtmlRoles.NAVIGATION, { name: 'Main' })
     */
    static readonly NAVIGATION = 'navigation';
}