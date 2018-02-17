import {MongoClient} from 'mongodb';

export class MongoDb {
    private _client: MongoClient;

    constructor(url) {
        this._client = null;
    }

    async connect(url) {
        this._client = await MongoClient.connect(url);
    }

    close() {
        if (this._client !== null) {
            this._client.close();
        }
    }
}