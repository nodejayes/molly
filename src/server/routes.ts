import {IRequestModel} from './models/request.model';
import {ResponseModel} from './models/response.model';

/**
 * holds all available Routes
 * 
 * @export
 * @class Routes
 */
export class Routes {
    /**
     * read a Model from Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static read(data: IRequestModel): ResponseModel {
        return new ResponseModel('', false);
    }

    /**
     * create Model(s) in Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static create(data: IRequestModel): ResponseModel {
        return new ResponseModel('', false);
    }

    /**
     * update a Model in Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static update(data: IRequestModel): ResponseModel {
        return new ResponseModel('', false);
    }

    /**
     * delete Model(s) from Database
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static delete(data: IRequestModel): ResponseModel {
        return new ResponseModel('', false);
    }

    /**
     * execute a defined Operation
     * 
     * @static
     * @param {IRequestModel} data 
     * @returns {ResponseModel} 
     * @memberof Routes
     */
    static operation(data: IRequestModel): ResponseModel {
        return new ResponseModel('', false);
    }
}