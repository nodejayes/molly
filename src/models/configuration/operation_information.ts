import { Collection } from "mongodb";
import {RouteInvoker} from './../../serve/routeinvoker';

export class OperationInformation {
    private _invoker: RouteInvoker;
    Name: string;
    Call: Function;

    constructor(name: string, call: Function) {
        if (name.length < 1) {
            throw new Error(`invalid name for operation ${name}`);
        }
        this.Name = name;
        this.Call = call;
        this._invoker = new RouteInvoker();
    }

    async invoke(params: any): Promise<any> {
        return await this.Call(this._invoker, params);
    }
}