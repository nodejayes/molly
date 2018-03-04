export interface IWebsocketMessage {
    id: string;
    data: any;
    toString(): string;
}