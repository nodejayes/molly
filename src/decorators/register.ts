import {Logic} from './../logic';
import {BaseTypes, JoinType} from './../index';
import {ObjectSchema, ArraySchema} from 'joi';
import {clone} from 'lodash';
import {CollectionInformation} from './../models/configuration/collection_information';
import {OperationInformation} from './../models/configuration/operation_information';
import {ValidationInformation} from './../models/configuration/validation_information';
import {ICollectionProperties} from './../interfaces/collection_properties';
import {IValidationProperties} from './../interfaces/validation_properties';

const convert = require('joi-to-json-schema');

const validationPool: IValidationProperties[] = [];

export interface IValidationRules {
    model: string;
    allow: string;
    validation: IValidationProperties[];
}

interface ISchemaInfo {
    readSchema: ObjectSchema;
    createSchema?: ArraySchema;
    updateSchema?: ObjectSchema;
    deleteSchema?: ObjectSchema;
}

export class ValidationRules {
    static rules: IValidationRules[] = [];

    private static _getValidations(model: string): IValidationProperties[] {
        let tmp = this.rules.filter((e) => e.model === model)[0];
        return tmp.validation;
    }

    private static _buildRead(model: string): ObjectSchema {
        let schema = null;
        let tmp = {};
        let props = this._getValidations(model);
        for (let i = 0; i < props.length; i++) {
            let p = props[i];
            if (p.type) {
                tmp[p.name] = p.type;
            } else if (p.existType) {
                tmp[p.name] = p.join === JoinType.ONEONE ? 
                    this._buildRead(p.existType) : 
                    BaseTypes.typeArray(this._buildRead(p.existType));
            }
        }
        schema = BaseTypes.type(tmp);
        return schema;
    }

    private static _buildCreate(model: string): ArraySchema {
        let schema = null;
        let tmp = {};
        let props = this._getValidations(model);
        for (let i = 0; i < props.length; i++) {
            let p = props[i];
            if (p.name === '_id') {
                continue;
            }
            if (p.type) {
                tmp[p.name] = p.type;
            } else if (p.existType) {
                switch(p.join) {
                    case JoinType.ONEONE:
                        tmp[p.name] = BaseTypes.mongoDbObjectId.allow(null);
                        break;
                    case JoinType.ONEMANY:
                        tmp[p.name] = BaseTypes.typeArray(BaseTypes.mongoDbObjectId.allow(null));
                        break;
                }
            }
        }
        schema = BaseTypes.typeArray(BaseTypes.type(tmp));
        return schema;
    }

    private static _buildUpdate(model: string): ObjectSchema {
        let schema: ObjectSchema = null;
        let tmp = {
            id: null,
            updateSet: {}
        };
        let props = this._getValidations(model);
        for (let i = 0; i < props.length; i++) {
            let p = props[i];
            if (p.name === '_id') {
                tmp.id = p.type.required();
            } else if (p.type) {
                tmp.updateSet[p.name] = p.type.optional();
            } else if (p.existType) {
                switch(p.join) {
                    case JoinType.ONEONE:
                        tmp.updateSet[p.name] = BaseTypes.mongoDbObjectId.optional();
                        break;
                    case JoinType.ONEMANY:
                        tmp.updateSet[p.name] = BaseTypes.typeArray(BaseTypes.mongoDbObjectId).optional();
                        break;
                }
            }
        }
        schema = BaseTypes.type(tmp);
        return schema;
    }

    private static _buildDelete(model: string): ObjectSchema {
        let schema: ObjectSchema = null;
        let tmp = {
            id: null
        };
        let props = this._getValidations(model);
        for (let i = 0; i < props.length; i++) {
            let p = props[i];
            if (p.name === '_id') {
                tmp.id = p.type.required();
            }
        }
        schema = BaseTypes.type(tmp);
        return schema;
    }

    private static _buildValidation(model: string, allow: string): ISchemaInfo {
        let schemaRead = this._buildRead(model);
        let schemaCreate = null;
        let schemaUpdate = null;
        let schemaDelete = null;
        if (allow.indexOf('C') === 0) {
            schemaCreate = this._buildCreate(model);
        }
        if (allow.indexOf('U') === 1) {
            schemaUpdate = this._buildUpdate(model);
        }
        if (allow.indexOf('D') === 2) {
            schemaDelete = this._buildDelete(model);
        }
        return {
            readSchema: schemaRead,
            createSchema: schemaCreate,
            updateSchema: schemaUpdate,
            deleteSchema: schemaDelete
        };
    }

    private static _addCollectionInfoValidations(ci: CollectionInformation, tmp: IValidationProperties[]): void {
        if (ci.Joins) {
            for (let i = 0; i < ci.Joins.length; i++) {
                if (ci.Joins[i].LocalField.indexOf('.') !== -1) {
                    continue;
                }
                tmp.push({
                    name: ci.Joins[i].LocalField,
                    classname: ci.Name,
                    existType: ci.Joins[i].From,
                    join: ci.Joins[i].Type
                });
            }
        }
    }

    private static _readValidationRules(model: string, ci: CollectionInformation, allCis: CollectionInformation[]) {
        let tmp = validationPool.filter((e) => {
            return e.classname === ci.Name;
        });
        if (tmp.length > 0) {
            this._addCollectionInfoValidations(ci, tmp);            
            for (let j = 0; j < tmp[0].prototypes.length; j++) {
                let proto = tmp[0].prototypes[j];
                let subCi = allCis.filter((e) => {
                    return e.Name === proto;
                })[0];
                let protoValidations = validationPool.filter((e) => {
                    return e.classname === proto;
                });
                if (protoValidations && protoValidations.length > 0 && subCi) {
                    this._addCollectionInfoValidations(subCi, tmp);
                    tmp = tmp.concat(protoValidations);
                } else if (protoValidations) {
                    tmp = tmp.concat(protoValidations);
                }
            }
            ValidationRules.rules.push({
                model: ci.Name,
                allow: ci.allow,
                validation: clone(tmp)
            });
        }
    }

    private static _fillValidationRules() {
        for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
            let ci = Logic.Configuration.collectionInfos[i];
            this._readValidationRules(ci.Name, ci, Logic.Configuration.collectionInfos);
        }
    }

    static registerValidations() {
        this._fillValidationRules();
        for (let i = 0; i < this.rules.length; i++) {
            let rule = this.rules[i];
            let schema = this._buildValidation(rule.model, rule.allow);
            Logic.Configuration.validationInfos.push(
                new ValidationInformation(rule.model, schema.createSchema, schema.readSchema, schema.updateSchema, schema.deleteSchema)
            );
        }
    }
}

export function collection(collectionProps: ICollectionProperties) {
    return function(constructor: Function) {
        Logic.Configuration.collectionInfos.push(
            new CollectionInformation(constructor.name, collectionProps.lookup, collectionProps.index, collectionProps.allow)
        );
    }
}

function getClassName(obj: any): string {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec(obj.constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
}

export function validation(validationProps: IValidationProperties) {
    return function(target, key: string) {
        if (!validationProps.classname) {
            validationProps.classname = target.constructor.name;
        }
        if (!validationProps.prototypes) {
            validationProps.prototypes = [];
            let look = Object.getPrototypeOf(target);
            let tmp: string;
            while((tmp = getClassName(look)) !== 'Object') {
                validationProps.prototypes.push(tmp);
                look = Object.getPrototypeOf(look);
            }
        }
        validationProps.name = key;
        validationPool.push(validationProps);
    }
}

export function operation(target, key: string) {
    Logic.Configuration.operationInfos.push(
        new OperationInformation(key, target[key])
    );
}
