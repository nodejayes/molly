/**
 * Server Configuration Data
 *
 * @export
 * @interface IServerConfiguration
 */
export interface IServerConfiguration {
    binding: string;
    port: number;
    models: any[];
    mongoUrl: string;
    mongoDatabase: string;
    mongoReplicaSet?: string;
    mongoAuthDatabase?: string;
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
}
