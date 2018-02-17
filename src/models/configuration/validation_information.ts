import {ObjectSchema} from 'joi';

/**
 * a Type Validation Info
 * 
 * @export
 * @class ValidationInformation
 */
export class ValidationInformation {
    createSchema: ObjectSchema;
    readSchema: ObjectSchema;
    updateSchema: ObjectSchema;
    deleteSchema: ObjectSchema;
}