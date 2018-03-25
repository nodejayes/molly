import { Server as HttpServer, Server } from 'http';
import { createServer, Server as HttpsServer, ServerOptions } from 'https';
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import * as express from 'express';
import { Server as WsServer } from 'ws';
import * as helmet from 'helmet';
import * as compress from 'compression';
import * as statics from 'serve-static';
import * as bodyParser from 'body-parser';
import { keys } from 'lodash';
import { promisify } from 'util';
import { isAbsolute, join } from 'path';
import { exec } from 'child_process';

import { MongoDb, Routes, RouteInvoker, SwaggerGenerator } from 'modules';
import { RequestModel, ResponseModel, WebsocketMessage } from 'models';
import { IRequestModel, IServerConfiguration } from 'interfaces';
import { ValidationRules, Logic } from 'basic';

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
    private _server: HttpServer | HttpsServer;
    /**
     * Node Service Instance for Documentation
     * 
     * @private
     * @type {(HttpServer | HttpsServer)}
     * @memberof ExpressServer
     */
    private _docServer: HttpServer | HttpsServer;
    /**
     * Websocket Server
     * 
     * @private
     * @type {WsServer}
     * @memberof ExpressServer
     */
    private _WsServer: WsServer;
    /**
     * Route Invoker
     * 
     * @private
     * @type {RouteInvoker}
     * @memberof ExpressServer
     */
    private _invoker: RouteInvoker;
    /**
     * 
     * 
     * @private
     * @type {Function}
     * @memberof ExpressServer
     */
    private _authenticate: Function;

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
        this._invoker = new RouteInvoker();
        this._server = null;
        this._docServer = null;
        this._WsServer = null;
        this._routeNames = Routes.Names;
        this.App = express();
    }

    /**
     * Custom Compression Filter
     * 
     * @private
     * @param {any} req 
     * @param {any} res 
     * @returns 
     * @memberof ExpressServer
     */
    private _shouldCompress(req, res): boolean {
        if (req.headers['x-no-compression']) {
          return false
        }
        return true;
    }

    /**
     * map all Routes to the Express App
     * 
     * @private
     * @memberof Server
     */
    private _registerRoutes(cfg: IServerConfiguration): void {
        this.App.use(helmet());
        this.App.use(compress({
            filter: this._shouldCompress,
            level: 9
        }));
        if (cfg.staticFiles) {
            let staticPath = isAbsolute(cfg.staticFiles) ? cfg.staticFiles : join(process.cwd(), cfg.staticFiles);
            if (!existsSync(staticPath)) {
                console.warn(`you set the option for static files but folder not exists`);
            } else {
                this.App.use(statics(staticPath));
            }
        }
        this.App.use(bodyParser.json());
        this.App.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            this._filterRequest.bind(this)(req, res, next);
        });
    }

    /**
     * create the Events for Websockets
     * 
     * @private
     * @memberof ExpressServer
     */
    private _registerWebsocket(): void {
        if (this._authenticate instanceof Function) {
            this._WsServer = new WsServer({
                server: this._server,
                verifyClient: (info) => {
                    return this._authenticate(info);
                }
            });
        } else {
            this._WsServer = new WsServer({
                server: this._server,
            });
        }
        this._WsServer.on('connection', (ws) => {
            ws.on('message', async (msg: string) => {
                let tmp = null;
                let result: WebsocketMessage = null;
                try {
                    let data = <IRequestModel>JSON.parse(msg);
                    switch(data.Action) {
                        case 'create':
                            tmp = await this._invoker.create(data.Model, data.Parameter);
                            break;
                        case 'read':
                            data.Parameter = RequestModel.replaceStringIds(data.Parameter);
                            tmp = await this._invoker.read(data.Model, data.Parameter, data.Properties);
                            break;
                        case 'update':
                            tmp = await this._invoker.update(data.Model, data.Parameter);
                            break;
                        case 'delete':
                            tmp = await this._invoker.delete(data.Model, data.Parameter);
                            break;
                        case 'operation':
                            tmp = await this._invoker.operation(data.Model, data.Parameter);
                            break;
                    }
                    result = new WebsocketMessage(`${data.Action}_${data.Model}`, tmp);
                } catch (err) {
                    tmp = err.message;
                    result = new WebsocketMessage(`ERROR`, tmp);
                } finally {
                    ws.send(result.toString());
                }
            });
            ws.send(new WebsocketMessage('initFinish', true).toString());
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
            if (this._authenticate instanceof Function && this._authenticate(req) !== true) {
                res.status(403);
                res.end();
                return;
            }
            let data = new RequestModel(req, this._routeNames);
            let result = <ResponseModel>(await Routes[data.Action](data));
            res.status(200);
            res.send(result.toString());
        } catch (err) {
            res.status(500);
            res.send(new ResponseModel(err.message, true).toString());
        }
    }

    /**
     * start the Schema Build in MongoDb
     * 
     * @private
     * @param {boolean} clear 
     * @memberof ExpressServer
     */
    private async _buildSchema(clear: boolean): Promise<void> {
        await MongoDb.createCollections.bind(MongoDb, clear)();
    }

    /**
     * generate the Spectacle Documentation
     * 
     * @private
     * @param {ServerOptions} options 
     * @param {IServerConfiguration} cfg 
     * @returns {Promise<void>} 
     * @memberof ExpressServer
     */
    private async _buildDocumentation(options: ServerOptions, cfg: IServerConfiguration): Promise<void> {
        if (cfg.documentationPort > 0) {
            let useSsl = cfg.certFile !== undefined;
            let address = `${cfg.binding}:${cfg.port}`;
            let pack = JSON.parse(
                readFileSync(join(cfg.packageFolder || process.cwd(), 'package.json'))
                    .toString('utf8')
            );
            let gen = new SwaggerGenerator(address, useSsl, pack);
            let code = gen.toString();
            let tmpFile = join(__dirname, 'tmpapi.json');
            writeFileSync(tmpFile, code, {
                encoding: 'utf8'
            });
            let spectacle = promisify(exec);
            await spectacle(join(__dirname, '..', '..', '..', 'node_modules', '.bin', `spectacle -t ${join(__dirname, '..', '..', '..', 'docs')} ${tmpFile}`));
            unlinkSync(tmpFile);
            let docApp = express();
            docApp.use(express.static('docs'));
            if (options !== null) {
                this._docServer = createServer(options, docApp).listen(cfg.documentationPort, cfg.binding);
            } else {
                this._docServer = docApp.listen(cfg.documentationPort, cfg.binding);
            }
        }
    }

    /**
     * read the Certificate Files and build a ServerOptions Object
     * 
     * @private
     * @param {string} certFile 
     * @param {string} keyFile 
     * @param {string} caFile 
     * @returns {ServerOptions} 
     * @memberof ExpressServer
     */
    private _readCertificateInfo(certFile: string, keyFile: string, caFile: string): ServerOptions {
        let options: ServerOptions = null;
        if (existsSync(certFile) && existsSync(keyFile)) {
            options = {
                cert: readFileSync(certFile),
                key: readFileSync(keyFile)
            };
            if (existsSync(caFile)) {
                options.ca = readFileSync(caFile);
            }
        }
        return options;
    }

    /**
     * set defaults of the Configuration Parameter
     * 
     * @private
     * @param {IServerConfiguration} cfg 
     * @memberof ExpressServer
     */
    private _fixParameter(cfg: IServerConfiguration): void {
        if (cfg.mongoUrl[cfg.mongoUrl.length - 1] !== '/') {
            cfg.mongoUrl += '/';
        }
        cfg.archive = cfg.archive === true;
    }

    /**
     * start the Express Server
     * 
     * @param {string} binding
     * @param {number} port
     * @returns {Promise<string>} 
     * @memberof Server
     */
    async start(cfg: IServerConfiguration): Promise<string> {
        this._fixParameter(cfg);
        ValidationRules.registerValidations();
        this._authenticate = cfg.authentication;
        let options: ServerOptions = this._readCertificateInfo(cfg.certFile, cfg.keyFile, cfg.caFile);
        await this._buildDocumentation(options, cfg);
        await MongoDb.connect(`${cfg.mongoUrl}${cfg.mongoDatabase}`, cfg.mongoDatabase);
        await this._buildSchema(cfg.clear);
        return new Promise<string>((resolve, reject) => {
            this._registerRoutes(cfg);
            if (existsSync(cfg.certFile) && existsSync(cfg.keyFile)) {
                this._server = createServer(options, this.App).listen(cfg.port, cfg.binding, () => {
                    resolve(`server listen on https://${cfg.binding}:${cfg.port}/`);
                });
            } else {
                this._server = this.App.listen(cfg.port, cfg.binding, () => {
                    resolve(`server listen on http://${cfg.binding}:${cfg.port}/`);
                });
            }
            
            this._server.on('error', reject);
            if (cfg.useWebsocket) {
                this._registerWebsocket();
            }
        });
    }

    /**
     * clear the exist Configurations
     * 
     * @memberof ExpressServer
     */
    clearConfiguration(): void {
        Logic.Configuration.collectionInfos = [];
        Logic.Configuration.operationInfos = [];
        Logic.Configuration.validationInfos = [];
    }

    /**
     * stop a running Server
     * 
     * @memberof ExpressServer
     */
    stop(): void {
        if (this._server !== null) {
            this._server.close();
            this._server = null;
        }
        if (this._WsServer !== null) {
            this._WsServer.close();
            this._WsServer = null;
        }
        if (this._docServer !== null) {
            this._docServer.close();
            this._docServer = null;
        }
        MongoDb.close();
    }
}