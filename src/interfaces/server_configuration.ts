export interface IServerConfiguration {
    binding: string;
    port: number;
    mongoUrl: string;
    mongoDatabase: string;
    clear?: boolean;
    useWebsocket?: boolean;
    certFile?: string;
    keyFile?: string;
    caFile?: string;
}