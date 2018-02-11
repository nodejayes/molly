import {MongoClient} from 'mongodb';

/**
 * MongoDbModul Instance
 *
 * @export
 * @class MongoDbModul
 */
export class MongoDbModul {
    /**
     * Creates an instance of MongoDbModul.
     * @param {string} connection
     * @param {object} collectionInfo
     * @memberof MongoDbModul
     */
    constructor(connection, collectionInfo) {
        this.connection = connection;
        this.collectionInfo = collectionInfo;
        this._cnn = null;
    }

    /**
     * setup the connection and create collections when not exists
     *
     * @memberof MongoDbModul
     */
    async setup() {
        this._cnn = new MongoClient();
        await this._cnn.connect(this.connection);
    }
}
