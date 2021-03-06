import {ObjectId}                  from 'mongodb';
import {Request}                   from 'express';
import {hasIn, isObject, isString} from 'lodash';
import {IRequestModel}             from '../../interfaces';
import {CollectionStore} from "..";

/**
 * holds the Request Parameter
 *
 * @export
 * @class RequestModel
 * @implements {IRequestModel}
 */
export class RequestModel implements IRequestModel {
  /**
   * the Action of the Request
   *
   * @type {string}
   * @memberof RequestModel
   */
  Action: string;

  /**
   * the Model where the Action is executed
   *
   * @type {string}
   * @memberof RequestModel
   */
  Model: string;

  /**
   * the Parameters for the Action
   *
   * @type {*}
   * @memberof RequestModel
   */
  Parameter: any;

  /**
   * the Return Filter for the Read Operation of the Model
   *
   * @type {*}
   * @memberof RequestModel
   */
  Properties: any;

  /**
   * parse a Express Request and create a IRequestModel Object
   * @param {Request} req
   * @param {string[]} routeNames
   * @memberof RequestModel
   */
  constructor(req: Request, routeNames: string[]) {
    let tmp = req.path.split('/').filter((e) => {
      return e.length > 0;
    });
    if (tmp.length < 1 || routeNames.indexOf(tmp[0]) === -1) {
      throw new Error(`invalid route ${req.path}`);
    }
    this.Action = tmp[0];
    this.Model = tmp.length > 1 ? tmp[1] : null;
    if (!hasIn(req.body, 'params')) {
      throw new Error(`invalid request body ${req.body}`);
    }
    this.Parameter = req.body.params;
    if (hasIn(req.body, 'props')) {
      this.Properties = req.body.props;
    } else {
      this.Properties = null;
    }
  }

  static async performUpdate(input: any, col: CollectionStore): Promise<any> {
    const obj = await col.collection.findOne({_id: new ObjectId(input.id)});
    const oldVersion = parseInt(obj.version);
    if (isNaN(oldVersion)) {
      input.updateSet.version = 0;
    } else {
      input.updateSet.version = oldVersion + 1;
    }
    return input;
  }

  /**
   * replace the String MongoDb Object ids with ObjectId
   *
   * @static
   * @param {*} source
   * @returns {*}
   * @memberof RequestModel
   */
  static replaceStringIds(source: any): any {
    for (let key in source) {
      if (key === '_id') {
        if (typeof source[key] === 'string' && source[key].length === 24) {
          source[key] = new ObjectId(source[key]);
        } else if (isObject(source[key])) {
          for (let innerKey in source[key]) {
            switch (innerKey) {
              case '$in':
                let tmp = [];
                for (let i = 0; i < source[key][innerKey].length; i++) {
                  tmp.push(new ObjectId(source[key][innerKey][i]));
                }
                source[key][innerKey] = tmp;
                break;
              case '$eq':
              case '$ne':
                source[key][innerKey] = new ObjectId(source[key][innerKey]);
                break;
            }
          }
        }
      } else if (['$and', '$or'].indexOf(key) > -1) {
        for (let i = 0; i < source[key].length; i++) {
          source[key][i] = this.replaceStringIds(source[key][i]);
        }
      } else {
        if (isObject(source[key])) {
          this.replaceStringIds(source[key]);
        } else if (isString(source[key]) && source[key].length === 24) {
          try {
            let oid = new ObjectId(source[key]);
            source[key] = oid;
          } catch (err) {
          }
        }
      }
    }
    return source;
  }

  static replaceObjectIdWithString(source: any) {
    for (let key in source) {
      if (source[key] instanceof ObjectId) {
        source[key] = source[key].toString();
      }
      if (isObject(source[key])) {
        source[key] = this.replaceObjectIdWithString(source[key]);
      }
    }
    return source;
  }
}
