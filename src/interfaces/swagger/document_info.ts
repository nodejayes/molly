import { ISwaggerContact, ISwaggerLicense } from 'interfaces';

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