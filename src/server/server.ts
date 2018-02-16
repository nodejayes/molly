import * as express from 'express';
import * as helmet from 'helmet';
import {Routes} from './routes';
import {RequestModel} from './models/request.model';
import {ResponseModel} from './models/response.model';
import {keys} from 'lodash';
import {promisify} from 'util';

/**
 * implement a small Express Server
 * 
 * @export
 * @class Server
 */
export class Server {
    /**
     * a Array of all Route Names
     * 
     * @private
     * @type {Array<string>}
     * @memberof Server
     */
    private _routeNames: Array<string>;

    /**
     * the Express Server Instance
     * 
     * @type {express.Application}
     * @memberof Server
     */
    App: express.Application;

    /**
     * Creates an instance of Server.
     * @memberof Server
     */
    constructor() {
        this._routeNames = keys(Routes);
        this.App = express();
        this._registerRoutes();
    }

    /**
     * map all Routes to the Express App
     * 
     * @private
     * @memberof Server
     */
    private _registerRoutes(): void {
        this.App.use(helmet());
        this.App.use(this._filterRequest.bind(this));
    }

    /**
     * check the incoming Request and Request the Route
     * 
     * @private
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.NextFunction} next 
     * @returns {void} 
     * @memberof Server
     */
    private _filterRequest(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if (req.method !== 'POST') {
            res.status(405);
            res.send(new ResponseModel(`not supported method ${req.method}`, true).toString());
            return;
        }
        try {
            let data = new RequestModel(req, this._routeNames);
            let result = <ResponseModel>Routes[data.Action](data);
            res.status(200);
            res.send(result.toString());
        } catch (err) {
            res.status(500);
            res.send(new ResponseModel(err.message, true).toString());
        }
    }

    /**
     * start the Express Server
     * 
     * @param {string} binding 
     * @param {number} port 
     * @returns {Promise<string>} 
     * @memberof Server
     */
    async start(binding: string, port: number): Promise<string> {
        let startServer = promisify(this.App.listen);
        await startServer.call(port, binding);
        return `server listen on http://${binding}:${port}/`;
    }
}