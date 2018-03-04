import { IWebsocketMessage } from './../../interfaces/websocket_message';

export class WebsocketMessage implements IWebsocketMessage {
    id: string;
    data: any;

    constructor(id: string, data: any) {
        this.id = id;
        this.data = data;
    }

    toString(): string {
        return JSON.stringify({
            id: this.id,
            data: this.data
        });
    }
}