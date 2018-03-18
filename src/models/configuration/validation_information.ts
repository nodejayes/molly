import {ObjectSchema, ArraySchema, validate} from 'joi';

const convert = require('joi-to-json-schema');

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
     * get JSON Schema (draft-04) for Create
     * 
     * @readonly
     * @memberof ValidationInformation
     */
    get createJsonSchema() {
        return this.CreateSchema ? 
            convert(this.CreateSchema) : null;
    }

    /**
     * get JSON Schema (draft-04) for Read
     * 
     * @readonly
     * @memberof ValidationInformation
     */
    get readJsonSchema() {
        return this.ReadSchema ? 
            convert(this.ReadSchema) : null;
    }

    /**
     * get JSON Schema (draft-04) for Update
     * 
     * @readonly
     * @memberof ValidationInformation
     */
    get updateJsonSchema() {
        return this.UpdateSchema ? 
            convert(this.UpdateSchema) : null;
    }

    /**
     * get JSON Schema (draft-04) for Delete
     * 
     * @readonly
     * @memberof ValidationInformation
     */
    get deleteJsonSchema() {
        return this.DeleteSchema ? 
            convert(this.DeleteSchema) : null;
    }

    /**
     * check the Create Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkCreate(input: any): any {
        let tmp = validate(input, this.CreateSchema);
        if (tmp.error) {
            console.info(input);
            console.info(this.createJsonSchema);
            console.error(tmp.error);
            throw tmp.error;
        }
        return tmp.value;
    }

    /**
     * check the Read Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkRead(input: any): any {
        let tmp = validate(input, this.ReadSchema);
        if (tmp.error) {
            console.error(tmp.error.message);
            console.info(JSON.stringify(input, null, 4));
            console.info(JSON.stringify(this.readJsonSchema, null, 4));
            throw tmp.error;
        }
        return tmp.value;
    }

    /**
     * check the Update Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkUpdate(input: any): any {
        let tmp = validate(input, this.UpdateSchema);
        if (tmp.error) {
            throw tmp.error;
        }
        return tmp.value;
    }

    /**
     * check the Delete Validation Schema
     * 
     * @param {*} input 
     * @returns {*} 
     * @memberof ValidationInformation
     */
    checkDelete(input: any): any {
        let tmp = validate(input, this.DeleteSchema);
        if (tmp.error) {
            throw tmp.error;
        }
        return tmp.value;
    }
}