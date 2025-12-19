/**
 * **WHAT:** Constant definitions for Angular-specific element identifiers and selectors
 * 
 * **WHY:** Centralized Angular component identifiers for consistent element location
 * 
 * **WHERE USED:**
 * - Page objects interacting with Angular components
 * - SharedPageBehavior for Angular dropdown selection
 * - Custom Angular element interactions
 * 
 * **WHEN TO USE:**
 * - Interacting with ng-select dropdowns
 * - Working with Material Design components
 * - Locating Angular-specific attributes
 * 
 * **ANGULAR COMPONENTS:**
 * - ng_select: Angular select/dropdown component
 * - matTooltip: Material Design tooltip attribute
 * - matCheckbox: Material Design checkbox component
 * - dropdown_panel: Angular dropdown panel container
 * 
 * @example
 * // In page object
 * import AngularElements from './angularElements';
 * const selectLocator = `${AngularElements.ng_select}[placeholder='Select User']`;
 * await this.page.locator(selectLocator).click();
 * 
 * @example
 * // Dropdown panel interaction
 * const panel = await this.page.locator(AngularElements.dropdown_panel);
 * await panel.locator('text=Option 1').click();
 */
export default class AngularElements{
    static readonly ng_select = "ng-select";
    static readonly matTooltip = "mattooltip";
    static readonly matCheckbox = "mat-checkbox";
    static readonly dropdown_panel = "ng-dropdown-panel";
}