import { SwaggerDocumentVersion } from '../../enums';
import { ISwaggerDocumentInfo, ISwaggerTag } from '..';

/**
 * Swagger Document Structure
 * 
 * @export
 * @interface ISwaggerDocument
 */
export interface ISwaggerDocument {
    swagger: SwaggerDocumentVersion;
    info: ISwaggerDocumentInfo,
    host: string;
    basePath: string;
    tags: ISwaggerTag[];
    schemes: string[];
    paths: any;
    definitions: any;
}