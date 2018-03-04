import { Collection } from "mongodb";
import {RouteInvoker} from './../../serve/routeinvoker';

/**
 * a Operation Information Definition
 * 
 * @export
 * @class OperationInformation
 */
export class OperationInformation {
    /**
     * a Route Invoker Instance
     * 
     * @private
     * @type {RouteInvoker}
     * @memberof OperationInformation
     */
    private _invoker: RouteInvoker;
    /**
     * Name of the Operation in the Route
     * 
     * @type {string}
     * @memberof OperationInformation
     */
    Name: string;
    /**
     * the Function to Operate
     * 
     * @type {Function}
     * @memberof OperationInformation
     */
    Call: Function;

    /**
     * Creates an instance of OperationInformation.
     * @param {string} name 
     * @param {Function} call 
     * @memberof OperationInformation
     */
    constructor(name: string, call: Function) {
        if (name.length < 1) {
            throw new Error(`invalid name for operation ${name}`);
        }
        this.Name = name;
        this.Call = call;
        this._invoker = new RouteInvoker();
    }

    /**
     * invoke the Operation
     * 
     * @param {*} params 
     * @returns {Promise<any>} 
     * @memberof OperationInformation
     */
    async invoke(params: any): Promise<any> {
        return await this.Call(this._invoker, params);
    }
}