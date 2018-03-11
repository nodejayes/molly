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
        return validate(input, this.DeleteSchema).value;
    }
}