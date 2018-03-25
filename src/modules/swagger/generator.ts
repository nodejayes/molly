import { Logic } from 'basic';
import { BaseTypes } from 'index';
import { ISwaggerDocument, ISwaggerTag, ISwaggerMollyPath } from 'interfaces';
import { SwaggerDocumentVersion } from 'enums';

/**
 * Joi Validation to JSON Schema
 * @const
 */
const CONVERT = require('joi-to-json-schema');

/**
 * generate Swagger Configuration from ValidationRules
 * 
 * @export
 * @class SwaggerGenerator
 */
export class SwaggerGenerator {
    /**
     * Host of the API
     * 
     * @private
     * @type {string}
     * @memberof SwaggerGenerator
     */
    private _host: string;

    /**
     * is HTTPS secure
     * 
     * @private
     * @type {boolean}
     * @memberof SwaggerGenerator
     */
    private _useSsl: boolean;

    /**
     * Package Config Information
     * 
     * @private
     * @type {*}
     * @memberof SwaggerGenerator
     */
    private _pack: any;

    /**
     * Creates an instance of SwaggerGenerator.
     * @param {string} host 
     * @param {boolean} useSsl 
     * @param {*} pack 
     * @memberof SwaggerGenerator
     */
    constructor(host: string, useSsl: boolean, pack: any) {
        this._host = host;
        this._useSsl = useSsl;
        this._pack = pack;
    }

    /**
     * construct the Main Body of Configuration
     * 
     * @private
     * @param {ISwaggerTag[]} tags 
     * @param {*} paths 
     * @param {*} def 
     * @returns {ISwaggerDocument} 
     * @memberof SwaggerGenerator
     */
    private _getMain(tags: ISwaggerTag[], paths: any, def: any): ISwaggerDocument {
        return {
            swagger: SwaggerDocumentVersion.V2,
            info: {
                description: this._pack.description || '',
                version: this._pack.version || '',
                title: this._pack.name || '',
                contact: {
                    email: this._pack.author ? this._pack.author.email || '' : ''
                },
                license: {
                    name: this._pack.license || 'UNLICENSED'
                }
            },
            host: this._host,
            basePath: '/',
            tags: tags,
            schemes: [this._useSsl ? 'https' : 'http'],
            paths: paths,
            definitions: def
        };
    }

    /**
     * construct a Tag Name
     * 
     * @private
     * @param {string} name 
     * @param {string} description 
     * @returns {ISwaggerTag} 
     * @memberof SwaggerGenerator
     */
    private _getTag(name: string, description: string): ISwaggerTag {
        return {
            name: name,
            description: description
        };
    }

    /**
     * construct a Path for Paths Section
     * 
     * @private
     * @param {string} path 
     * @param {string} tag 
     * @param {*} requestProps 
     * @param {*} resultProps 
     * @param {string} sum 
     * @param {string} des 
     * @returns {ISwaggerMollyPath} 
     * @memberof SwaggerGenerator
     */
    private _getPath(path: string, tag: string, requestProps: any, resultProps: any, sum: string, des: string): ISwaggerMollyPath {
        return {
            post: {
                tags: [tag],
                summary: sum,
                description: des,
                operationId: path,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        description: '',
                        required: true,
                        schema: CONVERT(requestProps)
                    }
                ],
                responses: {
                    200: {
                        description: '',
                        schema: CONVERT(resultProps)
                    }
                }
            }
        };
    }

    /**
     * start the generation and Output the JSON String
     * 
     * @returns {string} 
     * @memberof SwaggerGenerator
     */
    toString(): string {
        let collections = Logic.Configuration.collectionInfos;
        let operations = Logic.Configuration.operationInfos;
        let tags = [];
        let paths = {};
        let definitions = {};

        for (let i = 0; i < collections.length; i++) {
            let col = collections[i];

            tags.push(this._getTag(col.Name, ''));
            let validations = Logic.Configuration.validationInfos.filter((e) => e.Name === col.Name)[0];
            definitions[col.Name] = validations.readJsonSchema;
            if (col.allow.indexOf('C') === 0) {
                let createRequest = BaseTypes.type({
                    params: validations.CreateSchema
                });
                let createResponse = validations.ReadSchema;
                paths[`/create/${col.Name}`] = this._getPath(`/create/${col.Name}`, col.Name, 
                    createRequest, createResponse, col.createSummary || `save Model ${col.Name}`, 
                    col.readDescription || '');
            }
            let readRequest = BaseTypes.type({
                params: BaseTypes.type({
                    _id: BaseTypes.mongoDbObjectId.optional(),
                    RESTRICTIONS: BaseTypes.type({
                        sort: BaseTypes.type({
                            _id: BaseTypes.integer.min(0).max(1)
                        }).optional(),
                        limit: BaseTypes.integer.optional(),
                        skip: BaseTypes.integer.optional()
                    }).optional()
                }),
                props: BaseTypes.type({
                    _id: BaseTypes.integer.min(0).max(1)
                })
            });
            let readResponse = validations.ReadSchema;
            paths[`/read/${col.Name}`] = this._getPath(`/read/${col.Name}`, 
                col.Name, readRequest, readResponse, col.readSummary || `get Model ${col.Name}`,
                col.readDescription || ''); 
            if (col.allow.indexOf('U') === 1) {
                let updateRequest = BaseTypes.type({
                    params: validations.UpdateSchema
                });
                let updateResponse = BaseTypes.bool;
                paths[`/update/${col.Name}`] = this._getPath(`/update/${col.Name}`, 
                    col.Name, updateRequest, updateResponse, col.updateSummary || `update Model ${col.Name}`,
                    col.updateDescription || '');
            } 
            if (col.allow.indexOf('D') === 2) {
                let deleteRequest = BaseTypes.type({
                    params: validations.DeleteSchema
                });
                let deleteResponse = BaseTypes.bool;
                paths[`/delete/${col.Name}`] = this._getPath(`/delete/${col.Name}`, 
                    col.Name, deleteRequest, deleteResponse, col.deleteSummary || `delete Model ${col.Name}`,
                    col.deleteDescription || '');
            }
        }

        for (let i = 0; i < operations.length; i++) {
            let op = operations[i];
            tags.push(this._getTag(op.Name, ''));
            let operationRequest = BaseTypes.type({
                params: BaseTypes.typeArray(BaseTypes.custom.any())
            });
            let operationResponse = BaseTypes.custom.any();
            paths[`/operation/${op.Name}`] = this._getPath(`/operation/${op.Name}`, 
                op.Name, operationRequest, operationResponse, op.Summary, op.Description);
        }

        return JSON.stringify(this._getMain(tags, paths, definitions));
    }
}