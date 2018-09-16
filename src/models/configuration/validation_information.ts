import {ObjectSchema, validate} from 'joi';
import {BaseTypes}              from '../..';
import {IValidationInformation} from '../../interfaces';

/**
 * Convert Joi to JSON Schema
 * @const
 */
const CONVERT = require('joi-to-json-schema');

/**
 * a Type Validation Info
 *
 * @export
 * @class ValidationInformation
 */
export class ValidationInformation implements IValidationInformation {
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
   * @type {ObjectSchema}
   * @memberof ValidationInformation
   */
  CreateSchema: ObjectSchema;

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
   * @param {ObjectSchema} [createSchema]
   * @param {ObjectSchema} [readSchema]
   * @param {ObjectSchema} [updateSchema]
   * @param {ObjectSchema} [deleteSchema]
   * @memberof ValidationInformation
   */
  constructor(name: string, createSchema?: ObjectSchema, readSchema?: ObjectSchema, updateSchema?: ObjectSchema, deleteSchema?: ObjectSchema) {
    this.Name = name;
    this.CreateSchema = createSchema ? createSchema : null;
    this.ReadSchema = readSchema;
    this.UpdateSchema = updateSchema ? updateSchema : null;
    this.DeleteSchema = deleteSchema ? deleteSchema : null;
  }

  /**
   * get JSON Schema (draft-04) for Create
   *
   * @readonly
   * @memberof ValidationInformation
   */
  get createJsonSchema(): any {
    return this.CreateSchema ?
      CONVERT(this.CreateSchema) : null;
  }

  /**
   * get JSON Schema (draft-04) for Read
   *
   * @readonly
   * @memberof ValidationInformation
   */
  get readJsonSchema(): any {
    return CONVERT(this.ReadSchema);
  }

  /**
   * get JSON Schema (draft-04) for Update
   *
   * @readonly
   * @memberof ValidationInformation
   */
  get updateJsonSchema(): any {
    return this.UpdateSchema ?
      CONVERT(this.UpdateSchema) : null;
  }

  /**
   * get JSON Schema (draft-04) for Delete
   *
   * @readonly
   * @memberof ValidationInformation
   */
  get deleteJsonSchema(): any {
    return this.DeleteSchema ?
      CONVERT(this.DeleteSchema) : null;
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
    let tmp = validate(input, BaseTypes.typeArray(this.ReadSchema));
    if (tmp.error) {
      // when objects saved with molly maybe the errors never happend
      // but otherwise we must check for errors
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
