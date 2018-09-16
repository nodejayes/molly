import {ObjectSchema} from 'joi';

/**
 * Validation Information Interface
 *
 * @export
 * @interface IValidationInformation
 */
export interface IValidationInformation {
  Name: string;
  CreateSchema: ObjectSchema;
  ReadSchema: ObjectSchema;
  UpdateSchema: ObjectSchema;
  DeleteSchema: ObjectSchema;
}
