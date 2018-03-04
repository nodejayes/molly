import {Routes} from './routes';
import { RequestModel } from '../models/communicate/request';
import {IRouteInvoker} from './../interfaces/route_invoker';

export class RouteInvoker implements IRouteInvoker {
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