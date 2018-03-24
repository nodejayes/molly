import { MongoClient, Collection } from 'mongodb';
import { Logic } from 'basic';
import { CollectionInformation } from 'models';
import { CollectionStore } from 'models';

/**
 * a MongoDb Instance
 * 
 * @export
 * @class MongoDb
 */
export class MongoDb {
    /**
     * Database Name
     * 
     * @private
     * @static
     * @type {string}
     * @memberof MongoDb
     */
    private static _db: string;
    /**
     * Database Instance
     * 
     * @private
     * @static
     * @type {MongoClient}
     * @memberof MongoDb
     */
    private static _client: MongoClient;
    /**
     * Database Collections
     * 
     * @private
     * @static
     * @memberof MongoDb
     */
    private static _existCollections = new Array<Collection<any>>();
    /**
     * Collection List as CollectionStore Element
     * 
     * @private
     * @static
     * @type {Array<CollectionStore>}
     * @memberof MongoDb
     */
    private static _collectionList: Array<CollectionStore>;

    /**
     * Refer an CollectionList
     * 
     * @readonly
     * @static
     * @memberof MongoDb
     */
    static get Collections() {
        return this._collectionList;
    }

    /**
     * create Collection that not exists
     * 
     * @private
     * @static
     * @param {CollectionInformation} info 
     * @param {boolean} clear 
     * @memberof MongoDb
     */
    private static async _createCollection(info: CollectionInformation, clear: boolean) {
        let names = this._existCollections.filter((col: Collection<any>) => {
            return col.collectionName === info.Name;
        });
        if (names.length < 1 || clear) {
            let db = this._client.db(this._db);
            if (clear && names.length > 0) {
                await db.dropCollection(info.Name);
            }
            let newCollection = await db.createCollection(info.Name, {});
            if (info.setIndex) {
                info.setIndex(newCollection);
            }
            this._collectionList.push(new CollectionStore(newCollection, info.Joins));
        } else {
            this._collectionList.push(new CollectionStore(names[0], info.Joins));
        }
    }

    /**
     * create Collection that not exists
     * 
     * @static
     * @param {boolean} clear 
     * @memberof MongoDb
     */
    static async createCollections(clear: boolean) {
        this._collectionList = new Array<CollectionStore>();
        this._existCollections = await this._client.db(this._db).collections();
        for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
            let ci = Logic.Configuration.collectionInfos[i];
            await this._createCollection.bind(this)(ci, clear);
        }
    }

    /**
     * connect to Database
     * 
     * @static
     * @param {any} url 
     * @param {any} database 
     * @memberof MongoDb
     */
    static async connect(url, database) {
        this._db = database;
        this._client = await MongoClient.connect(`${url}${database}`, {
            appname: 'Molly',
            autoReconnect: true,
            poolSize: 25
        });
    }

    /**
     * close the Connection to Database
     * 
     * @static
     * @memberof MongoDb
     */
    static close() {
        if (this._client !== null) {
            this._client.close();
            this._client = null;
        }
    }
}