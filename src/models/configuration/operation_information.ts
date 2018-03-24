import { Collection } from "mongodb";
import { RouteInvoker } from 'modules';
import { IOperationInformation } from 'interfaces';

/**
 * a Operation Information Definition
 * 
 * @export
 * @class OperationInformation
 */
export class OperationInformation implements IOperationInformation {
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
     * a Description
     * 
     * @type {string}
     * @memberof OperationInformation
     */
    Description: string;
    /**
     * a Summary
     * 
     * @type {string}
     * @memberof OperationInformation
     */
    Summary: string;

    /**
     * Creates an instance of OperationInformation.
     * @param {string} name 
     * @param {Function} call 
     * @memberof OperationInformation
     */
    constructor(name: string, call: Function, des?: string, sum?: string) {
        this.Name = name;
        this.Call = call;
        this.Description = des || '';
        this.Summary = sum || '';
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