import {IResponseModel} from './../../interfaces/response_model';

export class ResponseModel implements IResponseModel {
    data: any;
    errors: string;

    constructor(msg: any, iserror: boolean) {
        if (iserror) {
            this.data = null;
            this.errors = msg;
        } else {
            this.data = msg;
            this.errors = null;
        }
    }

    toString() {
        return JSON.stringify(this);
    }
}