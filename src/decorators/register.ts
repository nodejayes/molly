import {Logic} from './../logic';
import {BaseTypes, JoinType} from './../index';
import {ObjectSchema, ArraySchema} from 'joi';
import {clone} from 'lodash';
import {CollectionInformation} from './../models/configuration/collection_information';
import {OperationInformation} from './../models/configuration/operation_information';
import {ValidationInformation} from './../models/configuration/validation_information';
import {ICollectionProperties} from './../interfaces/collection_properties';
import {IValidationProperties} from './../interfaces/validation_properties';

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
                tmp[p.name] = this._buildRead(p.existType);
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
                        tmp[p.name] = BaseTypes.mongoDbObjectId;
                        break;
                    case JoinType.ONEMANY:
                        tmp[p.name] = BaseTypes.typeArray(BaseTypes.mongoDbObjectId);
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

    static registerValidations() {
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
            new CollectionInformation(constructor.name, collectionProps.lookup, collectionProps.index)
        );
        if (validationPool.length > 0) {
            if (collectionProps.lookup) {
                for (let i = 0; i < collectionProps.lookup.length; i++) {
                    validationPool.push({
                        existType: collectionProps.lookup[i].From,
                        join: collectionProps.lookup[i].Type
                    });
                }
            }
            ValidationRules.rules.push({
                model: constructor.name,
                allow: collectionProps.allow,
                validation: clone(validationPool)
            });
            validationPool.splice(0, validationPool.length);
        }
    }
}

export function validation(validationProps: IValidationProperties) {
    return function(target, key: string) {
        validationProps.name = key;
        validationPool.push(validationProps);
    }
}

export function operation(target, key: string) {
    Logic.Configuration.operationInfos.push(
        new OperationInformation(key, target[key])
    );
}
