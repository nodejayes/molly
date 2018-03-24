import { ObjectSchema } from 'joi';
import { JoinType, BaseTypes } from 'index';
import { CollectionInformation, ValidationInformation } from 'models';
import { clone } from 'lodash';
import { Logic } from 'basic';
import { IValidationRules, IValidationProperties, ISchemaInfo } from 'interfaces/index';

/**
 * Combines Validation and Collection Informations to Validation Rules
 * 
 * @export
 * @class ValidationRules
 */
export class ValidationRules {
    /**
     * a temporary Pool for Validations
     * 
     * @static
     * @type {IValidationProperties[]}
     * @memberof ValidationRules
     */
    static readonly validationPool: IValidationProperties[] = [];
    /**
     * Pool of all Validation Rules
     * 
     * @static
     * @type {IValidationRules[]}
     * @memberof ValidationRules
     */
    static rules: IValidationRules[] = [];

    /**
     * get a Validation of a Model
     * 
     * @private
     * @static
     * @param {string} model 
     * @returns {IValidationProperties[]} 
     * @memberof ValidationRules
     */
    private static _getValidations(model: string): IValidationProperties[] {
        let tmp = this.rules.filter((e) => e.model === model)[0];
        return tmp.validation;
    }

    /**
     * build Read Validation for a Model
     * 
     * @private
     * @static
     * @param {string} model 
     * @returns {ObjectSchema} 
     * @memberof ValidationRules
     */
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

    /**
     * build create Validation for a Model
     * 
     * @private
     * @static
     * @param {string} model 
     * @returns {ObjectSchema} 
     * @memberof ValidationRules
     */
    private static _buildCreate(model: string): ObjectSchema {
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
        schema = BaseTypes.type(tmp);
        return schema;
    }

    /**
     * build update Validation for a Model
     * 
     * @private
     * @static
     * @param {string} model 
     * @returns {ObjectSchema} 
     * @memberof ValidationRules
     */
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

    /**
     * build delete Validation for a Model
     * 
     * @private
     * @static
     * @param {string} model 
     * @returns {ObjectSchema} 
     * @memberof ValidationRules
     */
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

    /**
     * initiate Validation builds for CRUD Operations
     * 
     * @private
     * @static
     * @param {string} model 
     * @param {string} allow 
     * @returns {ISchemaInfo} 
     * @memberof ValidationRules
     */
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

    /**
     * add Validations from joined Collections
     * 
     * @private
     * @static
     * @param {CollectionInformation} ci 
     * @param {IValidationProperties[]} tmp 
     * @memberof ValidationRules
     */
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
        let tmp = this.validationPool.filter((e) => {
            return e.classname === ci.Name;
        });
        if (tmp.length > 0) {
            this._addCollectionInfoValidations(ci, tmp);            
            for (let j = 0; j < tmp[0].prototypes.length; j++) {
                let proto = tmp[0].prototypes[j];
                let subCi = allCis.filter((e) => {
                    return e.Name === proto;
                })[0];
                let protoValidations = this.validationPool.filter((e) => {
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

    /**
     * 
     * 
     * @private
     * @static
     * @memberof ValidationRules
     */
    private static _fillValidationRules() {
        for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
            let ci = Logic.Configuration.collectionInfos[i];
            this._readValidationRules(ci.Name, ci, Logic.Configuration.collectionInfos);
        }
    }

    /**
     * generate Validations
     * 
     * @static
     * @memberof ValidationRules
     */
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