export interface IResponseModel {
    data: string;
    errors: string;
}

export class ResponseModel implements IResponseModel {
    data: string;
    errors: string;

    constructor(msg: string, iserror: boolean) {
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