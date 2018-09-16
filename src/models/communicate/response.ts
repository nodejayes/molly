import {IResponseModel} from '../../interfaces';

/**
 * The Response Model
 *
 * @export
 * @class ResponseModel
 * @implements {IResponseModel}
 */
export class ResponseModel implements IResponseModel {
  /**
   * Data that was generated from Action
   *
   * @type {*}
   * @memberof ResponseModel
   */
  data: any;

  /**
   * Errors that are thrown by Action
   *
   * @type {string}
   * @memberof ResponseModel
   */
  errors: string;

  /**
   * Creates an instance of ResponseModel.
   * @param {*} msg
   * @param {boolean} iserror
   * @memberof ResponseModel
   */
  constructor(msg: any, iserror: boolean) {
    if (iserror) {
      this.data = null;
      this.errors = msg;
    } else {
      this.data = msg;
      this.errors = null;
    }
  }

  /**
   * convert the ResponseModel to a JSON String
   *
   * @returns {string}
   * @memberof ResponseModel
   */
  toString(): string {
    return JSON.stringify(this);
  }
}
