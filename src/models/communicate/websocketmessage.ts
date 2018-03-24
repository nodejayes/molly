import { IWebsocketMessage } from 'interfaces';

/**
 * Websocket Message
 * 
 * @export
 * @class WebsocketMessage
 * @implements {IWebsocketMessage}
 */
export class WebsocketMessage implements IWebsocketMessage {
    /**
     * Id of the Event
     * 
     * @type {string}
     * @memberof WebsocketMessage
     */
    id: string;
    /**
     * Data that comes from the Event
     * 
     * @type {*}
     * @memberof WebsocketMessage
     */
    data: any;

    /**
     * Creates an instance of WebsocketMessage.
     * @param {string} id 
     * @param {*} data 
     * @memberof WebsocketMessage
     */
    constructor(id: string, data: any) {
        this.id = id;
        this.data = data;
    }

    /**
     * Convert the Message to a JSON String
     * 
     * @returns {string} 
     * @memberof WebsocketMessage
     */
    toString(): string {
        return JSON.stringify({
            id: this.id,
            data: this.data
        });
    }
}