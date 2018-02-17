import {ObjectSchema, ArraySchema, validate} from 'joi';

/**
 * a Type Validation Info
 * 
 * @export
 * @class ValidationInformation
 */
export class ValidationInformation {
    Name: string;
    CreateSchema: ArraySchema;
    ReadSchema: ObjectSchema;
    UpdateSchema: ObjectSchema;
    DeleteSchema: ObjectSchema;

    constructor(name: string, createSchema?: ArraySchema, readSchema?: ObjectSchema, updateSchema?: ObjectSchema, deleteSchema?: ObjectSchema) {
        if (!createSchema && !readSchema && !updateSchema && !deleteSchema) {
            throw new Error(`you must define a create, read, update or delete schema`);
        }
        if (name.length < 1) {
            throw new Error(`name must be specified for validation information`);
        }
        this.Name = name;
        this.CreateSchema = createSchema ? createSchema : null;
        this.ReadSchema = readSchema ? readSchema : null;
        this.UpdateSchema = updateSchema ? updateSchema : null;
        this.DeleteSchema = deleteSchema ? deleteSchema : null;
    }

    checkCreate(input: any): any {
        if (!this.CreateSchema) {
            throw new Error(`create not allowed for ${this.Name}`);
        }
        return validate(input, this.CreateSchema).value;
    }

    checkRead(input: any): any {
        if (!this.ReadSchema) {
            throw new Error(`read not allowed for ${this.Name}`);
        }
        return validate(input, this.ReadSchema).value;
    }

    checkUpdate(input: any): any {
        if (!this.UpdateSchema) {
            throw new Error(`update not allowed for ${this.Name}`);
        }
        return validate(input, this.UpdateSchema).value;
    }

    checkDelete(input: any): any {
        if (!this.DeleteSchema) {
            throw new Error(`delete not allowed for ${this.Name}`);
        }
        return validate(input, this.DeleteSchema).value;
    }
}