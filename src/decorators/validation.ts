import { IValidationProperties } from 'interfaces';
import { ValidationRules } from 'basic';

/**
 * read the Class Name
 * 
 * @param {*} obj 
 * @returns {string} 
 */
function getClassName(obj: any): string {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec(obj.constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
}

/**
 * decorate a Class Property with Validations
 * 
 * @export
 * @param {IValidationProperties} validationProps 
 * @returns 
 */
export function validation(validationProps: IValidationProperties) {
    return function(target, key: string) {
        if (!validationProps.classname) {
            validationProps.classname = target.constructor.name;
        }
        if (!validationProps.prototypes) {
            validationProps.prototypes = [];
            let look = Object.getPrototypeOf(target);
            let tmp: string;
            while((tmp = getClassName(look)) !== 'Object') {
                validationProps.prototypes.push(tmp);
                look = Object.getPrototypeOf(look);
            }
        }
        validationProps.name = key;
        ValidationRules.validationPool.push(validationProps);
    }
}