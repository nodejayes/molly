import {CollectionInsertOneOptions, CommonOptions, ObjectId} from 'mongodb';
import {
  hasIn,
  isArray,
  keys,
  unset
}                                                            from 'lodash';
import {IRequestModel}                                       from '../../interfaces';
import {
  CollectionStore,
  MongoLookup,
  OperationInformation,
  RequestModel,
  ResponseModel,
  ValidationInformation
}                                                            from '../../models';
import {Logic}                                               from '../../basic';
import {MongoDb}                                             from '..';

/**
 * holds all available Routes
 *
 * @export
 * @class Routes
 */
export class Routes {
  /**
   * get the List of names for valid Routes
   *
   * @readonly
   * @static
   * @type {string[]}
   * @memberof Routes
   */
  static get Names(): string[] {
    return [
      'create', 'read', 'update', 'delete', 'operation', 'schema', 'transaction'
    ];
  }

  /**
   * return the JSON Schema (draft-4) for the Model
   *
   * @static
   * @param {IRequestModel} data
   * @returns {Promise<ResponseModel>}
   * @memberof Routes
   */
  static async schema(data: IRequestModel): Promise<ResponseModel> {
    let validation = Routes._getValidation(data.Action, data.Model);
    if (validation === null) {
      throw new Error(`no validation found for model ${data.Model}`);
    }
    switch (data.Parameter.type) {
      case 'create':
        return new ResponseModel(validation.createJsonSchema, false);
      case 'read':
        return new ResponseModel(validation.readJsonSchema, false);
      case 'update':
        return new ResponseModel(validation.updateJsonSchema, false);
      case 'delete':
        return new ResponseModel(validation.deleteJsonSchema, false);
      default:
        return new ResponseModel(`schematype ${data.Parameter.type} not found`, true);
    }
  }

  /**
   * read a Model from Database
   *
   * @static
   * @param {IRequestModel} data
   * @returns {ResponseModel}
   * @memberof Routes
   */
  static async read(data: IRequestModel): Promise<ResponseModel> {
    let validation = Routes._getValidation(data.Action, data.Model);
    if (validation === null) {
      throw new Error(`no validation found for model ${data.Model}`);
    }
    let col = Routes._getCollection(data.Model);
    let pipe = Routes._getPipeline(col.joins, data);
    let tmp = await col.collection.aggregate(pipe).toArray();
    tmp = validation.checkRead(RequestModel.replaceObjectIdWithString(tmp));
    return new ResponseModel(tmp, false);
  }

  /**
   * create Model(s) in Database
   *
   * @static
   * @param {IRequestModel} data
   * @param {CommonOptions} opts
   * @returns {ResponseModel}
   * @memberof Routes
   */
  static async create(data: IRequestModel, opts?: CollectionInsertOneOptions): Promise<ResponseModel> {
    let validation = Routes._getValidation(data.Action, data.Model);
    if (validation === null) {
      throw new Error(`no validation found for model ${data.Model}`);
    }
    let col = Routes._getCollection(data.Model);
    let input = RequestModel.replaceStringIds(validation.checkCreate(data.Parameter));
    let tmp = await col.collection.insertOne(input, opts);
    return new ResponseModel(tmp.ops[0], false);
  }

  /**
   * update a Model in Database
   *
   * @static
   * @param {IRequestModel} data
   * @param {CommonOptions} opts
   * @returns {ResponseModel}
   * @memberof Routes
   */
  static async update(data: IRequestModel, opts?: CommonOptions): Promise<ResponseModel> {
    let validation = Routes._getValidation(data.Action, data.Model);
    if (validation === null) {
      throw new Error(`no validation found for model ${data.Model}`);
    }
    let col = Routes._getCollection(data.Model);
    let input = RequestModel.replaceStringIds(validation.checkUpdate(data.Parameter));
    input = await RequestModel.performUpdate(input, col);
    await col.collection.updateMany({
      _id: new ObjectId(input.id)
    }, {
      '$set': input.updateSet
    }, opts);
    return new ResponseModel(true, false);
  }

  /**
   * delete Model(s) from Database
   *
   * @static
   * @param {IRequestModel} data
   * @param {CommonOptions} opts
   * @returns {ResponseModel}
   * @memberof Routes
   */
  static async delete(data: IRequestModel, opts?: CommonOptions): Promise<ResponseModel> {
    let validation = Routes._getValidation(data.Action, data.Model);
    if (validation === null) {
      throw new Error(`no validation found for model ${data.Model}`);
    }
    let col = Routes._getCollection(data.Model);
    let input = RequestModel.replaceStringIds(validation.checkDelete(data.Parameter));
    await col.collection.deleteOne({
      _id: new ObjectId(input.id)
    }, opts);
    return new ResponseModel(true, false);
  }

  /**
   * execute a defined Operation
   *
   * @static
   * @param {IRequestModel} data
   * @returns {ResponseModel}
   * @memberof Routes
   */
  static async operation(data: IRequestModel): Promise<ResponseModel> {
    let operation = Routes._getOperation(data.Action, data.Model);
    if (operation === null) {
      throw new Error(`operation not found ${data.Model}`);
    }
    return new ResponseModel(await operation.invoke(data.Parameter), false);
  }

  /**
   * make a list of operations in Transaction
   * only wirte Operations are supported!
   * @param data
   */
  static async transaction(data: IRequestModel): Promise<ResponseModel> {
    if (!isArray(data.Parameter)) {
      throw new Error(`transaction params must be an array`);
    }
    if (data.Parameter.length <= 0) {
      return new ResponseModel(true, false);
    }
    const session = MongoDb.beginTransaction();
    try {
      for (let i = 0; i < data.Parameter.length; i++) {
        const d = data.Parameter[i];
        switch (d.Action) {
          case 'create':
            await this.create(d, {session});
            break;
          case 'update':
            await this.update(d, {session});
            break;
          case 'delete':
            await this.delete(d, {session});
            break;
        }
      }
      await MongoDb.commitTransaction();
      return new ResponseModel(true, false);
    } catch (err) {
      await MongoDb.rollbackTransaction();
      throw new Error(`error on transaction ${err.message}`);
    }
  }

  /**
   * Get the Operation based on Request
   *
   * @private
   * @static
   * @param {string} action
   * @param {string} model
   * @returns {OperationInformation}
   * @memberof Routes
   */
  private static _getOperation(action: string, model: string): OperationInformation {
    let op = Logic.Configuration.operationInfos.filter((e: OperationInformation) => {
      return e.Name === model;
    });
    if (op.length < 1) {
      return null;
    }
    return op[0];
  }

  /**
   * get the Validation based on Request
   *
   * @private
   * @static
   * @param {string} action
   * @param {string} model
   * @returns {ValidationInformation}
   * @memberof Routes
   */
  private static _getValidation(action: string, model: string): ValidationInformation {
    let validations = Logic.Configuration.validationInfos.filter((e: ValidationInformation) => {
      return e.Name === model;
    });
    if (validations.length < 1) {
      return null;
    }
    return validations[0];
  }

  /**
   * get Collection for Model based on Request
   *
   * @private
   * @static
   * @param {string} model
   * @returns {CollectionStore}
   * @memberof Routes
   */
  private static _getCollection(model: string): CollectionStore {
    let collections = MongoDb.Collections.filter((e: CollectionStore) => {
      return e.collection.collectionName === model;
    });
    return collections[0];
  }

  /**
   * get the Pipeline for Read
   *
   * @private
   * @static
   * @param {MongoLookup[]} joins
   * @param {IRequestModel} data
   * @returns {Object[]}
   * @memberof Routes
   */
  private static _getPipeline(joins: MongoLookup[], data: IRequestModel): Object[] {
    let restrictions = null;
    let params = RequestModel.replaceStringIds(data.Parameter);
    let hasRestrictions = hasIn(params, 'RESTRICTIONS');
    if (hasRestrictions) {
      restrictions = params['RESTRICTIONS'];
      unset(params, 'RESTRICTIONS');
    }
    let pipe = [];
    if (joins) {
      for (let i = 0; i < joins.length; i++) {
        let j = joins[i];
        pipe = pipe.concat(j.getAggregate());
      }
    }
    if (keys(params).length > 0) {
      pipe.push({
        '$match': params
      });
    }
    if (hasRestrictions) {
      if (hasIn(restrictions, 'sort')) {
        pipe.push({
          '$sort': restrictions.sort
        });
      }
      if (hasIn(restrictions, 'skip')) {
        pipe.push({
          '$skip': parseInt(restrictions.skip)
        });
      }
      if (hasIn(restrictions, 'limit')) {
        pipe.push({
          '$limit': parseInt(restrictions.limit)
        });
      }
    }
    if (data.Properties) {
      pipe.push({
        '$project': data.Properties
      });
    }
    return pipe;
  }
}
