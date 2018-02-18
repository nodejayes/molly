import {Request} from 'express';
import {hasIn} from 'lodash';

/**
 * Interface for RequestModel
 * 
 * @export
 * @interface IRequestModel
 */
export interface IRequestModel {
    Action: string;
    Model: string;
    Parameter: any;
    Properties: any;
}

/**
 * holds the Request Parameter
 * 
 * @export
 * @class RequestModel
 * @implements {IRequestModel}
 */
export class RequestModel implements IRequestModel {
    Action: string;
    Model: string;
    Parameter: any;
    Properties: any;

    /**
     * parse a Express Request and create a IRequestModel Object
     * @param {Request} req 
     * @param {Array<string>} routeNames 
     * @memberof RequestModel
     */
    constructor(req: Request, routeNames: Array<string>) {
        let tmp = req.path.split('/').filter((e) => { return e.length > 0; });
        if (tmp.length !== 2 || routeNames.indexOf(tmp[0]) === -1) {
            throw new Error(`invalid route ${req.path}`);
        }
        this.Action = tmp[0];
        this.Model = tmp[1];
        if (!hasIn(req.body, 'params')) {
            throw new Error(`invalid request body ${req.body}`);
        }
        this.Parameter = req.body.params;
        if (hasIn(req.body, 'props')) {
            this.Properties = req.body.props;
        } else {
            this.Properties = null;
        }
    }
}