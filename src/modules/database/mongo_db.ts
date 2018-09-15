import { MongoClient, Collection } from 'mongodb';
import { Logic } from '../../basic';
import { CollectionInformation } from '../../models';
import { CollectionStore } from '../../models';

/**
 * a MongoDb Instance
 *
 * @export
 * @class MongoDb
 */
export class MongoDb {
    /**
     *
     *
     * @private
     * @static
     * @type {boolean}
     * @memberof MongoDb
     */
    private static _archiveCollections: boolean;

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

    private static _session;

    /**
     * Database Collections
     *
     * @private
     * @static
     * @memberof MongoDb
     */
    private static _existCollections = [];

    /**
     * Collection List as CollectionStore Element
     *
     * @private
     * @static
     * @type {CollectionStore[]}
     * @memberof MongoDb
     */
    private static _collectionList: CollectionStore[];

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
     * get Delete on Collection was archieved
     *
     * @static
     * @memberof MongoDb
     */
    static get Archive() {
        return this._archiveCollections;
    }

    /**
     * set Delete on Collection was archieved
     *
     * @static
     * @memberof MongoDb
     */
    static set Archive(v) {
        this._archiveCollections = v;
    }

    /**
     * create Collection that not exists
     *
     * @private
     * @static
     * @param {CollectionInformation} info
     * @param {boolean} clear
     * @returns {Promise<void>}
     * @memberof MongoDb
     */
    private static async _createCollection(info: CollectionInformation, clear: boolean): Promise<void> {
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
     * @returns {Promise<void>}
     * @memberof MongoDb
     */
    static async createCollections(clear: boolean): Promise<void> {
        this._collectionList = [];
        this._existCollections = await this._client.db(this._db).collections();
        for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
            let ci = Logic.Configuration.collectionInfos[i];
            await this._createCollection.bind(this)(ci, clear);
        }
    }

    /**
     * start a transaction Session
     */
    static beginTransaction() {
        this._session = this._client.startSession();
        this._session.startTransaction();
        return this._session;
    }

    /**
     * commit a Transaction Session
     */
    static async commitTransaction() {
        await this._session.commitTransaction();
        this._session.endSession();
        this._session = null;
    }

    /**
     * abort a Transaction Session
     */
    static async rollbackTransaction() {
        await this._session.abortTransaction();
        this._session.endSession();
        this._session = null;
    }

    /**
     * connect to Database
     *
     * @static
     * @param {any} url
     * @returns {Promise<void>}
     * @memberof MongoDb
     */
    static async connect(url, database): Promise<void> {
        this._db = database;
        this._client = await MongoClient.connect(`${url}${database}`, {
            appname: 'Molly',
            autoReconnect: true,
            poolSize: 25,
            useNewUrlParser: true,
        });
    }

    /**
     * close the Connection to Database
     *
     * @static
     * @memberof MongoDb
     */
    static async close(): Promise<void> {
        if (this._client !== null) {
            await this._client.close();
            this._client = null;
        }
    }
}
