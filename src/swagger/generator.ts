import {Logic} from './../logic';

const PKG = require('./../../package.json');

export interface ISwaggerDocument {
    version: string;
    host: string;
    basePath: string;
    schemes: string[];
    info: ISwaggerInfo;
    tags: ISwaggerTag[];
    paths: ISwaggerPath[];
    definitions: ISwaggerDefinition[];
}

export interface ISwaggerInfo {
    description: string;
    version: string;
    title: string;
    contact: ISwaggerContact;
    license: ISwaggerLicense;
}

export interface ISwaggerContact {
    email: string;
}

export interface ISwaggerLicense {
    name: string;
    url: string;
}

export interface ISwaggerPath {
    route: string;
    method: HttpMethod;
    tags: string[];
    summary: string;
    description: string;
    operationId: string;
    consumes: string[];
    produces: string[];
    parameters: ISwaggerParameter[];
    responses: ISwaggerResponse[];
}

export interface ISwaggerParameter {
    in: string;
    name: string;
    description: string;
    required: boolean;
    ref: string;
}

export interface ISwaggerResponse {
    status: number;
    description: string;
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

export interface ISwaggerTag {
    name: string;
    description: string;
}

export interface ISwaggerDefinition {
    name: string;
    type: string;
    properties: ISwaggerProperty[];
}

export interface ISwaggerProperty {
    name: string;
    type: string;
}

export interface ISwaggerBaseInfos {
    host: string;
    version: string;
    useSsl: boolean;
    contactEmail: string;
    title: string;
    licenseType: string;
    description: string;
}

export class SwaggerDocument implements ISwaggerDocument {
    version: string;
    host: string;
    basePath: string;
    schemes: string[];
    info: ISwaggerInfo;
    tags: ISwaggerTag[];
    paths: ISwaggerPath[];
    definitions: ISwaggerDefinition[];

    constructor(info: ISwaggerBaseInfos) {
        this.host = info.host;
        this.version = '2.0';
        this.basePath = '/';
        if (info.useSsl) {
            this.schemes = ['https'];
        } else {
            this.schemes = ['http'];
        }
        this.info = {
            contact: {
                email: PKG.author ? PKG.author.email || '' : ''
            },
            description: PKG.description || '',
            license: {
                name: PKG.license || 'UNLICENSED',
                url: ''
            },
            title: PKG.name,
            version: PKG.version
        }
    }

    private _getMain(host: string, useSsl: boolean, email: string, license: string,
                    description: string, version: string, title: string, tags: string, paths: string): string {
        return `
swagger: "2.0"
info:
  description: "${description}"
  version: "${version}"
  title: "${title}"
  contact:
    email: "${email}"
  license:
    name: "${license}"
host: "${host}"
basePath: "/"
tags:
${tags}
schemes:
- "${useSsl ? 'https' : 'http'}"
paths:
${paths}
        `;
    }

    private _getTag(name: string, description: string): string {
        return `
- name: "${name}"
description: "${description}"
        `;
    }

    private _getPath(path: string, tag: string): string {
        return `
  ${path}:
    post:
      tags:
      - "${tag}"
      summary: ""
      description: ""
      operationId: "${path}"
      consumes:
      - "application/json"
      produces:
      - "application/json"
      parameters:
      - in: "body"
        name: "body"
        description: ""
        required: true
        schema:
          type: 'object'
          properties:
          params:
            type: 'object'
            properties:
            key:
              type: 'string'
            RESTRICTIONS:
              type: 'object'
              limit: 'number'
      responses:
        200:
          description: ""
          schema:
            type: 'object'
          properties:
            _id:
              type: 'string'
            key:
              type: 'string'
            active:
              type: 'boolean'
        `;
    }

    private _readConfiguration() {
        let collections = Logic.Configuration.collectionInfos;
        let operations = Logic.Configuration.operationInfos;

        for (let i = 0; i < collections.length; i++) {
            let col = collections[i];
            this.tags.push({
                name: col.Name,
                description: ''
            });
            if (col.allow.indexOf('C') === 0) {
                this.paths.push({
                    method: HttpMethod.POST,
                    description: '',
                    operationId: `/create/${col.Name}`,
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    route: `/create/${col.Name}`,
                    tags: [],
                    parameters: [],
                    responses: [],
                    summary: ''
                });
            } else if (col.allow.indexOf('U') === 1) {
                this.paths.push({
                    method: HttpMethod.POST,
                    description: '',
                    operationId: `/update/${col.Name}`,
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    route: `/update/${col.Name}`,
                    tags: [],
                    parameters: [],
                    responses: [],
                    summary: ''
                });
            } else if (col.allow.indexOf('D') === 2) {
                this.paths.push({
                    method: HttpMethod.POST,
                    description: '',
                    operationId: `/delete/${col.Name}`,
                    consumes: ['application/json'],
                    produces: ['application/json'],
                    route: `/delete/${col.Name}`,
                    tags: [],
                    parameters: [],
                    responses: [],
                    summary: ''
                });
            }
            this.paths.push({
                method: HttpMethod.POST,
                description: '',
                operationId: `/read/${col.Name}`,
                consumes: ['application/json'],
                produces: ['application/json'],
                route: `/read/${col.Name}`,
                tags: [],
                parameters: [],
                responses: [],
                summary: ''
            });
        }

        for (let i = 0; i < operations.length; i++) {
            let op = operations[i];
            this.paths.push({
                method: HttpMethod.POST,
                description: '',
                operationId: `/operation/${op.Name}`,
                consumes: ['application/json'],
                produces: ['application/json'],
                route: `/operation/${op.Name}`,
                tags: [],
                parameters: [],
                responses: [],
                summary: ''
            });
        }
    }

    toString() {
        this._readConfiguration();
    }
}