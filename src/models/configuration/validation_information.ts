import {ObjectSchema, ArraySchema, validate} from 'joi';

/**
 * a Type Validation Info
 * 
 * @export
 * @class ValidationInformation
 */
export class ValidationInformation {
    /**
     * the Name of the Model
     * 
     * @type {string}
     * @memberof ValidationInformation
     */
    Name: string;
    /**
     * the Create Validation
     * 
     * @type {ArraySchema}
     * @memberof ValidationInformation
     */
    CreateSchema: ArraySchema;
    /**
     * the Read Validation
     * 
     * @type {ObjectSchema}
     * @memberof ValidationInformation
     */
    ReadSchema: ObjectSchema;
    /**
     * the Update Validation
     * 
     * @type {ObjectSchema}
     * @memberof ValidationInformation
     */
    UpdateSchema: ObjectSchema;
    /**
     * the Delete Validation
     * 
     * @type {ObjectSchema}
     * @memberof ValidationInformation
     */
    DeleteSchema: ObjectSchema;

    /**
     * Creates an instance of ValidationInformation.
     * @param {string} name 
     * @param {ArraySchema} [createSchema] 
     * @param {ObjectSchema} [readSchema] 
     * @param {ObjectSchema} [updateSchema] 
     * @param {ObjectSchema} [deleteSchema] 
     * @memberof ValidationInformation
     */
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

    /**
     * check the Create Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkCreate(input: any): any {
        if (!this.CreateSchema) {
            throw new Error(`create not allowed for ${this.Name}`);
        }
        return validate(input, this.CreateSchema).value;
    }

    /**
     * check the Read Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkRead(input: any): any {
        if (!this.ReadSchema) {
            throw new Error(`read not allowed for ${this.Name}`);
        }
        return validate(input, this.ReadSchema).value;
    }

    /**
     * check the Update Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkUpdate(input: any): any {
        if (!this.UpdateSchema) {
            throw new Error(`update not allowed for ${this.Name}`);
        }
        return validate(input, this.UpdateSchema).value;
    }

    /**
     * check the Delete Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkDelete(input: any): any {
        if (!this.DeleteSchema) {
            throw new Error(`delete not allowed for ${this.Name}`);
        }
        return validate(input, this.DeleteSchema).value;
    }
}