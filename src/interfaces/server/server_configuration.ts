/**
 * Server Configuration Data
 *
 * @export
 * @interface IServerConfiguration
 */
import {MongoClientOptions} from "mongodb";

export interface IServerConfiguration {
  binding: string;
  port: number;
  mongoUrl: string;
  mongoDatabase: string;
  mongoOptions?: MongoClientOptions;
  models?: any[];
  clear?: boolean;
  useWebsocket?: boolean;
  certFile?: string;
  keyFile?: string;
  caFile?: string;
  staticFiles?: string;
  documentationPort?: number;
  packageFolder?: string;
  authentication?: Function;
  archive?: boolean;
  corsOrigin?: string;
  corsHeaders?: string;
  corsCredentials?: string;
  transactionLockTimeout?: number;
}
