/**
 * Interface for WebsocketMessage
 * 
 * @export
 * @interface IWebsocketMessage
 */
export interface IWebsocketMessage {
    id: string;
    data: any;
    toString(): string;
}