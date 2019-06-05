import * as Joi                                               from 'joi';
import {ObjectSchema}                                         from 'joi';
import {BaseTypes, JoinType}                                  from '..';
import {CollectionInformation, ValidationInformation}         from '../models';
import * as _                                                 from 'lodash';
import {clone, includes}                                      from 'lodash';
import {Logic}                                                from '.';
import {ISchemaInfo, IValidationProperties, IValidationRules} from '../interfaces';

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
   * generate Validations
   *
   * @static
   * @memberof ValidationRules
   */
  static registerValidations(): void {
    this._fillValidationRules();
    for (let i = 0; i < this.rules.length; i++) {
      let rule = this.rules[i];
      let schema = this._buildValidation(rule.model, rule.allow);
      Logic.Configuration.validationInfos.push(
        new ValidationInformation(rule.model, schema.createSchema, schema.readSchema, schema.updateSchema, schema.deleteSchema)
      );
    }
  }

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
    return tmp ? tmp.validation : [];
  }

  /**
   * build Read Validation for a Model
   *
   * @private
   * @static
   * @param {string} model
   * @param {string[]} existing
   * @returns {ObjectSchema}
   * @memberof ValidationRules
   */
  private static _buildRead(model: string, existing: string[]): ObjectSchema {
    let schema: ObjectSchema;
    let tmp = {};
    let props = this._getValidations(model);
    for (let i = 0; i < props.length; i++) {
      let p = props[i];
      if (p.type) {
        tmp[p.name] = p.type;
      } else if (p.existType) {
        existing.push(model);
        if (!includes(existing, p.existType)) {
          tmp[p.name] = p.join === JoinType.ONEONE ?
            this._buildRead(p.existType, existing) :
            BaseTypes.typeArray(this._buildRead(p.existType, existing));
        } else {
          tmp[p.name] = Joi.any().allow(null);
        }
      }
    }
    tmp['_id'] = BaseTypes.mongoDbObjectId.allow(null);
    tmp['createdAt'] = BaseTypes.date;
    tmp['modifiedAt'] = BaseTypes.date.allow(null);
    tmp['version'] = BaseTypes.integer.greater(-1);
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
    let schema: ObjectSchema;
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
        switch (p.join) {
          case JoinType.ONEONE:
            tmp[p.name] = BaseTypes.mongoDbObjectId.allow(null);
            break;
          case JoinType.ONEMANY:
            tmp[p.name] = BaseTypes.typeArray(BaseTypes.mongoDbObjectId.allow(null));
            break;
        }
      }
    }
    tmp['_id'] = BaseTypes.mongoDbObjectId.allow(null).default(null);
    tmp['createdAt'] = BaseTypes.date.default(new Date());
    tmp['modifiedAt'] = BaseTypes.date.allow(null).default(null);
    tmp['version'] = BaseTypes.integer.greater(-1).default(0);
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
    let schema: ObjectSchema;
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
        switch (p.join) {
          case JoinType.ONEONE:
            tmp.updateSet[p.name] = BaseTypes.mongoDbObjectId.optional();
            break;
          case JoinType.ONEMANY:
            tmp.updateSet[p.name] = BaseTypes.typeArray(BaseTypes.mongoDbObjectId).optional();
            break;
        }
      }
    }

    // set BaseModel Validations
    tmp.updateSet['modifiedAt'] = BaseTypes.date.default(new Date());
    tmp.updateSet['version'] = BaseTypes.integer.greater(-1).optional();
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
    let schema: ObjectSchema;
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
    let schemaRead = this._buildRead(model, []);
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

  /**
   *
   *
   * @private
   * @static
   * @param {string} model
   * @param {CollectionInformation} ci
   * @param {CollectionInformation[]} allCis
   * @memberof ValidationRules
   */
  private static _readValidationRules(model: string, ci: CollectionInformation, allCis: CollectionInformation[]): void {
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
      if (!_.find(ValidationRules.rules, (r) => r.model === ci.Name))
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
  private static _fillValidationRules(): void {
    for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
      let ci = Logic.Configuration.collectionInfos[i];
      this._readValidationRules(ci.Name, ci, Logic.Configuration.collectionInfos);
    }
  }
}
