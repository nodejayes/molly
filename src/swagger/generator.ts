import {Logic} from './../logic';

const PKG = require('./../../package.json');

export class SwaggerGenerator {
    private _host: string;
    private _useSsl: boolean;

    constructor(host: string, useSsl: boolean) {
        this._host = host;
        this._useSsl = useSsl;
    }

    private _getMain(tags: string, paths: string): string {
        return `swagger: "2.0"
info:
  description: "${PKG.description || ''}"
  version: "${PKG.version || ''}"
  title: "${PKG.name || ''}"
  contact:
    email: "${PKG.author ? PKG.author.email || '' : ''}"
  license:
    name: "${PKG.license || 'UNLICENSED'}"
host: "${this._host}"
basePath: "/"
tags:${tags}
schemes:
- "${this._useSsl ? 'https' : 'http'}"
paths:${paths}`;
    }

    private _getTag(name: string, description: string): string {
        return `
- name: "${name}"
  description: "${description}"`;
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
              type: 'boolean'`;
    }

    toString(): string {
        let collections = Logic.Configuration.collectionInfos;
        let operations = Logic.Configuration.operationInfos;
        let tags = '';
        let paths = '';

        for (let i = 0; i < collections.length; i++) {
            let col = collections[i];
            tags += this._getTag(col.Name, '');
            if (col.allow.indexOf('C') === 0) {
                paths += this._getPath(`/create/${col.Name}`, col.Name);
            } 
            if (col.allow.indexOf('U') === 1) {
                paths += this._getPath(`/update/${col.Name}`, col.Name);
            } 
            if (col.allow.indexOf('D') === 2) {
                paths += this._getPath(`/delete/${col.Name}`, col.Name);
            }
            paths += this._getPath(`/read/${col.Name}`, col.Name);
        }

        for (let i = 0; i < operations.length; i++) {
            let op = operations[i];
            tags += this._getTag(op.Name, '');
            paths += this._getPath(`/create/${op.Name}`, op.Name);
        }

        return this._getMain(tags, paths);
    }
}