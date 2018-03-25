import { Routes } from 'modules';
import { RequestModel } from 'models';
import { IRouteInvoker } from 'interfaces';

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
     * @returns {Promise<Object[]>} 
     * @memberof RouteInvoker
     */
    async create(model: string, params: any): Promise<Object[]> {
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
     * @returns {Promise<Object[]>} 
     * @memberof RouteInvoker
     */
    async read(model: string, params: any, props?: any): Promise<Object[]> {
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