import * as express from 'express';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import {keys} from 'lodash';
import {promisify} from 'util';
import { Server } from 'http';

import {MongoDb} from './../database/mongo_db';
import {Routes} from './routes';
import {RequestModel} from './../models/communicate/request';
import {ResponseModel} from './../models/communicate/response';

/**
 * implement a small Express Server
 * 
 * @export
 * @class ExpressServer
 */
export class ExpressServer {
    /**
     * a Array of all Route Names
     * 
     * @private
     * @type {Array<string>}
     * @memberof Server
     */
    private _routeNames: Array<string>;

    /**
     * running Node Server Instance
     * 
     * @private
     * @type {Server}
     * @memberof ExpressServer
     */
    private _server: Server;

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
        this._server = null;
        this._routeNames = Routes.Names;
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
        this.App.use(express.static('docs'));
        this.App.use(bodyParser.json());
        this.App.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            this._filterRequest.bind(this)(req, res, next);
        });
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
    private async _filterRequest(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        if (req.method !== 'POST') {
            res.status(405);
            res.send(new ResponseModel(
                `not supported method ${req.method}`, 
                true).toString());
            return;
        }
        try {
            let data = new RequestModel(req, this._routeNames);
            let result = <ResponseModel>(await Routes[data.Action](data));
            res.status(200);
            res.send(result.toString());
        } catch (err) {
            res.status(500);
            res.send(new ResponseModel(err.message, true).toString());
        }
    }

    private async _buildSchema(clear: boolean) {
        await MongoDb.createCollections.bind(MongoDb, clear)();
    }

    /**
     * start the Express Server
     * 
     * @param {string} binding
     * @param {number} port
     * @returns {Promise<string>} 
     * @memberof Server
     */
    async start(binding: string, port: number, mongoUrl: string, mongoDatabase: string, clear = false): Promise<string> {
        if (mongoUrl[mongoUrl.length - 1] !== '/') {
            mongoUrl += '/';
        }
        await MongoDb.connect(`${mongoUrl}${mongoDatabase}`, mongoDatabase);
        await this._buildSchema(clear);
        return new Promise<string>((resolve, reject) => {
            this._server = this.App.listen(port, binding, () => {
                resolve(`server listen on http://${binding}:${port}/`);
            });
            this._server.on('error', reject);
        });
    }

    /**
     * stop a running Server
     * 
     * @memberof ExpressServer
     */
    stop() {
        if (this._server !== null) {
            this._server.close();
            this._server = null;
        }
        MongoDb.close();
    }
}