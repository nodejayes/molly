import {Routes} from './routes';
import { RequestModel } from '../models/communicate/request';
import {IRouteInvoker} from './../interfaces/route_invoker';

/**
 * invoke the Standard CRUD and Operation Routes
 * 
 * @export
 * @class RouteInvoker
 * @implements {IRouteInvoker}
 */
export class RouteInvoker implements IRouteInvoker {
    /**
     * invoke Create
     * 
     * @param {string} model 
     * @param {*} params 
     * @returns {Promise<Array<object>>} 
     * @memberof RouteInvoker
     */
    async create(model: string, params: any): Promise<Array<object>> {
        let res = await Routes.create({
            Action: 'create',
            Model: model,
            Parameter: params,
            Properties: undefined
        });
        if (res.errors) {
            throw new Error(res.errors);
        }
        return res.data
    }
    /**
     * invoke Read
     * 
     * @param {string} model 
     * @param {*} params 
     * @param {*} [props] 
     * @returns {Promise<Array<object>>} 
     * @memberof RouteInvoker
     */
    async read(model: string, params: any, props?: any): Promise<Array<object>> {
        let res = await Routes.read({
            Action: 'read',
            Model: model,
            Parameter: params,
            Properties: props
        });
        if (res.errors) {
            throw new Error(res.errors);
        }
        return res.data;
    }
    /**
     * invoke Update
     * 
     * @param {string} model 
     * @param {*} params 
     * @returns {Promise<boolean>} 
     * @memberof RouteInvoker
     */
    async update(model: string, params: any): Promise<boolean> {
        let res = await Routes.update({
            Action: 'update',
            Model: model,
            Parameter: params,
            Properties: undefined
        });
        if (res.errors) {
            throw new Error(res.errors);
        }
        return res.data;
    }
    /**
     * invoke Delete
     * 
     * @param {string} model 
     * @param {*} params 
     * @returns {Promise<boolean>} 
     * @memberof RouteInvoker
     */
    async delete(model: string, params: any): Promise<boolean> {
        let res = await Routes.delete({
            Action: 'delete',
            Model: model,
            Parameter: params,
            Properties: undefined
        });
        if (res.errors) {
            throw new Error(res.errors);
        }
        return res.data;
    }
    /**
     * invoke Operation
     * 
     * @param {string} model 
     * @param {*} params 
     * @returns {Promise<any>} 
     * @memberof RouteInvoker
     */
    async operation(model: string, params: any): Promise<any> {
        let res = await Routes.operation({
            Action: 'operation',
            Model: model,
            Parameter: params,
            Properties: undefined
        });
        if (res.errors) {
            throw new Error(res.errors);
        }
        return res.data;
    }
}