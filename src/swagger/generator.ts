import {Logic} from './../logic';
import { BaseTypes } from '..';

const PKG = require('./../../package.json');
const convert = require('joi-to-json-schema');

export class SwaggerGenerator {
    private _host: string;
    private _useSsl: boolean;

    constructor(host: string, useSsl: boolean) {
        this._host = host;
        this._useSsl = useSsl;
    }

    private _getMain(tags: any[], paths: any): any {
        return {
            swagger: '2.0',
            info: {
                description: PKG.description || '',
                version: PKG.version || '',
                title: PKG.name || '',
                contact: {
                    email: PKG.author ? PKG.author.email || '' : ''
                },
                license: {
                    name: PKG.license || 'UNLICENSED'
                }
            },
            host: this._host,
            basePath: '/',
            tags: tags,
            schemes: [this._useSsl ? 'https' : 'http'],
            paths: paths
        };
    }

    private _getTag(name: string, description: string): any {
        return {
            name: name,
            description: description
        };
    }

    private _getObject(key: string, type: string) {
        let result = {};
        let typeTemplate = {
            type: type
        };
        return result[key] = typeTemplate;
    }

    private _getPath(path: string, tag: string, requestProps: any, resultProps: any): any {
        return {
            post: {
                tags: [tag],
                summary: '',
                description: '',
                operationId: path,
                consumes: ['application/json'],
                produces: ['application/json'],
                parameters: [
                    {
                        in: 'body',
                        name: 'body',
                        description: '',
                        required: true,
                        schema: convert(requestProps)
                    }
                ],
                responses: {
                    200: {
                        description: '',
                        schema: convert(resultProps)
                    }
                }
            }
        };
    }

    toString(): any {
        let collections = Logic.Configuration.collectionInfos;
        let operations = Logic.Configuration.operationInfos;
        let tags = [];
        let paths = {};

        for (let i = 0; i < collections.length; i++) {
            let col = collections[i];
            tags.push(this._getTag(col.Name, ''));
            let validations = Logic.Configuration.validationInfos.filter((e) => e.Name === col.Name)[0];
            if (col.allow.indexOf('C') === 0) {
                let createRequest = BaseTypes.type({
                    params: validations.CreateSchema
                });
                let createResponse = validations.ReadSchema;
                paths[`/create/${col.Name}`] = this._getPath(`/create/${col.Name}`, col.Name, createRequest, createResponse);
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
            paths[`/read/${col.Name}`] = this._getPath(`/read/${col.Name}`, col.Name, readRequest, readResponse); 
            if (col.allow.indexOf('U') === 1) {
                let updateRequest = BaseTypes.type({
                    params: validations.UpdateSchema
                });
                let updateResponse = BaseTypes.bool;
                paths[`/update/${col.Name}`] = this._getPath(`/update/${col.Name}`, col.Name, updateRequest, updateResponse);
            } 
            if (col.allow.indexOf('D') === 2) {
                let deleteRequest = BaseTypes.type({
                    params: validations.DeleteSchema
                });
                let deleteResponse = BaseTypes.bool;
                paths[`/delete/${col.Name}`] = this._getPath(`/delete/${col.Name}`, col.Name, deleteRequest, deleteResponse);
            }
        }

        for (let i = 0; i < operations.length; i++) {
            let op = operations[i];
            tags.push(this._getTag(op.Name, ''));
            let operationRequest = BaseTypes.type({
                params: BaseTypes.typeArray(BaseTypes.custom.any())
            });
            let operationResponse = BaseTypes.custom.any();
            paths[`/operation/${op.Name}`] = this._getPath(`/operation/${op.Name}`, op.Name, operationRequest, operationResponse);
        }

        return JSON.stringify(this._getMain(tags, paths));
    }
}