/**
 * **WHAT:** Enum validation utility for checking if values or keys exist in TypeScript enums
 * 
 * **WHY:** Provides type-safe enum validation at runtime
 * 
 * **WHERE USED:**
 * - Validating dropdown selections against enum values
 * - Checking test data matches expected enum values
 * - Runtime enum validation for dynamic inputs
 * 
 * **WHEN TO USE:**
 * - Need to verify string matches enum value
 * - Validate enum keys at runtime
 * - Type-safe validation of user inputs against enums
 * 
 * @example
 * enum Status { ACTIVE: "Active", INACTIVE: "Inactive" }
 * EnumValidator.validateEnumStringValue(Status, "Active"); // true
 * EnumValidator.validateEnumKey(Status, "ACTIVE"); // true
 */

/**
 * **EnumValidator Class**
 * 
 * **RESPONSIBILITY:** Provides static methods for enum validation
 */
export default abstract class EnumValidator {
    /**
     * Verifies if given value exists in the specified enum that has string values.
     * For example for the enum TestEnum { ACCOUNT_NO: "Account Number" }, this method returns false for any string except "Account Number"
     * 
     * @param enumType type of the enum
     * @param value value to be verified
     * @returns true if value exists
     */
    static validateEnumStringValue<T extends Record<string, string>>(
        enumType: T,
        value: string
    ): boolean {

        /** THIS HAS A PERFORMACNE IMPACT AS WE DYNAMICALLY READ AND ITERATE ALL VALUES */
        const enumValues = Object.values(enumType);

        return enumValues.includes(value);
    }

    /**
     * Verifies if given key exists in the specified enum.
     * For example for the enum TestEnum { ACCOUNT_NO: "Account Number" }, this method returns false for any string except "ACCOUNT_NO"
     * 
     * @param enumType type of the enum
     * @param value key to be verified
     * @returns true if value exists
     */
    static validateEnumKey<T>(
        enumType: T,
        value: string
    ): boolean {
        return enumType[value] !== undefined;
    }
}