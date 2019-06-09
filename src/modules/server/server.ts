import {Server as HttpServer, Server} from 'http';
import {createServer, Server as HttpsServer, ServerOptions} from 'https';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import * as express from 'express';
import {Server as WsServer} from 'ws';
import * as helmet from 'helmet';
import * as compress from 'compression';
import * as bodyParser from 'body-parser';
import {isAbsolute, join} from 'path';

import {MongoDb, RouteInvoker, Routes, SwaggerGenerator} from '..';
import {RequestModel, ResponseModel, WebsocketMessage} from '../../models';
import {IRequestModel, IServerConfiguration} from '../../interfaces';
import {ValidationRules} from '../../basic';
import {ClientTypes} from "../../interfaces/server/client_types";

/**
 * implement a small Express Server
 *
 * @export
 * @class ExpressServer
 */
export class ExpressServer {
  /**
   * the Express Server Instance
   *
   * @type {express.Application}
   * @memberof Server
   */
  App: express.Application;
  /**
   * a Array of all Route Names
   *
   * @private
   * @type {Array<string>}
   * @memberof Server
   */
  private readonly _routeNames: Array<string>;
  /**
   * the Server uses HTTPs
   *
   * @private
   * @type {boolean}
   * @memberof Server
   */
  private _isSecure: boolean;
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
   * start the Express Server
   *
   * @returns {Promise<string>}
   * @memberof Server
   * @param cfg
   */
  async start(cfg: IServerConfiguration): Promise<string> {
    this._fixParameter(cfg);
    ValidationRules.registerValidations();
    this._authenticate = cfg.authentication;
    MongoDb.Archive = cfg.archive === true;
    let options: ServerOptions = this._readCertificateInfo(cfg.certFile, cfg.keyFile, cfg.caFile);
    await this._buildDocumentation(options, cfg);
    await MongoDb.connect(`${cfg.mongoUrl}`, cfg.mongoDatabase, cfg.mongoReplicaSet || 'rs0', cfg.mongoAuthDatabase || 'admin', cfg.transactionLockTimeout || 200);
    await this._buildSchema(cfg.clear);
    return new Promise<string>((resolve, reject) => {
      this._registerRoutes(cfg);
      if (existsSync(cfg.certFile) && existsSync(cfg.keyFile)) {
        this._isSecure = true;
        this._server = createServer(options, this.App).listen(cfg.port, cfg.binding, () => {
          resolve(`server listen on https://${cfg.binding}:${cfg.port}/`);
          this._generateClient(cfg);
        });
      } else {
        this._isSecure = false;
        this._server = this.App.listen(cfg.port, cfg.binding, () => {
          resolve(`server listen on http://${cfg.binding}:${cfg.port}/`);
          this._generateClient(cfg);
        });
      }

      this._server.on('error', reject);
      if (cfg.useWebsocket) {
        this._registerWebsocket();
      }
    });
  }

  /**
   * stop a running Server
   *
   * @memberof ExpressServer
   */
  async stop(): Promise<void> {
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
    await MongoDb.close();
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
    return !req.headers['x-no-compression'];
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
        this.App.use(express.static(staticPath));
      }
    }
    this.App.use(bodyParser.json());
    this.App.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      this._filterRequest.bind(this)(req, res, next, cfg);
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
          switch (data.Action) {
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
            case 'transaction':
              tmp = await this._invoker.transaction(data);
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
   * @param {IServerConfiguration} cfg
   * @returns {void}
   * @memberof Server
   */
  private async _filterRequest(req: express.Request, res: express.Response, next: express.NextFunction, cfg: IServerConfiguration): Promise<void> {
    if (req.method !== 'POST') {
      if (req.method === 'OPTIONS') {
        res.status(200);
        res.setHeader('Access-Control-Allow-Origin', cfg.corsOrigin || `${this._isSecure ? 'https' : 'http'}://${cfg.binding}:${cfg.port}`);
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', cfg.corsHeaders || '');
        res.setHeader('Access-Control-Allow-Credentials', cfg.corsCredentials || 'false');
        res.send(``);
        return;
      }
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
      let tmpFile = join(__dirname, '..', '..', '..', 'api-doc', 'swagger.json');
      writeFileSync(tmpFile, code, {
        encoding: 'utf8'
      });

      let docApp = express();
      docApp.use(express.static(join(__dirname, '..', '..', '..', 'api-doc')));
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
    cfg.archive = cfg.archive === true;
  }

  private _generateClient(cfg: IServerConfiguration): void {
    if (!cfg.client) {
      return;
    }
    switch (cfg.client.type) {
      case ClientTypes.ANGULAR:
        this._generateAngularClient(cfg.client.interfacePath);
        break;
    }
  }

  private _generateAngularClient(target: string): void {
    // TODO: implement Interface generation for Client
  }
}
