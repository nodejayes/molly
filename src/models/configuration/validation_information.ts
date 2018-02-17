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

    constructor(createSchema?: ObjectSchema, readSchema?: ObjectSchema, updateSchema?: ObjectSchema, deleteSchema?: ObjectSchema) {
        if (!createSchema && !readSchema && !updateSchema && !deleteSchema) {
            throw new Error(`you must define a create, read, update or delete schema`);
        }
        this.createSchema = createSchema ? createSchema : null;
        this.readSchema = readSchema ? readSchema : null;
        this.updateSchema = updateSchema ? updateSchema : null;
        this.deleteSchema = deleteSchema ? deleteSchema : null;
    }
}