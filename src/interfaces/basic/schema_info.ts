import { ObjectSchema } from 'joi';

/**
 * Schema Information Interface
 * 
 * @interface ISchemaInfo
 */
export interface ISchemaInfo {
    readSchema: ObjectSchema;
    createSchema?: ObjectSchema;
    updateSchema?: ObjectSchema;
    deleteSchema?: ObjectSchema;
}