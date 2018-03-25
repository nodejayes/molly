import { IValidationProperties } from 'interfaces';

/**
 * Validation Rule Interface
 * 
 * @export
 * @interface IValidationRules
 */
export interface IValidationRules {
    model: string;
    allow: string;
    validation: IValidationProperties[];
}