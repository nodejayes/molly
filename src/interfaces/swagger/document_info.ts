import { ISwaggerContact, ISwaggerLicense } from '..';

/**
 * Swagger Main Info
 * 
 * @export
 * @interface ISwaggerDocumentInfo
 */
export interface ISwaggerDocumentInfo {
    description: string;
    version: string;
    title: string;
    contact: ISwaggerContact;
    license: ISwaggerLicense
}