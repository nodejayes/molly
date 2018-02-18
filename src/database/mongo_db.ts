import {MongoClient, Collection} from 'mongodb';
import {Logic} from '../logic';
import {CollectionInformation} from '../models/configuration/collection_information';
import {CollectionStore} from '../models/configuration/collection_store';

export class MongoDb {
    private static _db: string;
    private static _client: MongoClient;
    private static _existCollections = new Array<Collection<any>>();
    private static _collectionList: Array<CollectionStore>;

    static get Collections() {
        return this._collectionList;
    }

    private static async _createCollection(info: CollectionInformation, clear: boolean) {
        let names = this._existCollections.filter((col: Collection<any>) => {
            return col.collectionName === info.Name;
        });
        if (names.length < 1 || clear) {
            let db = this._client.db(this._db);
            if (clear && names.length > 0) {
                await db.dropCollection(info.Name);
            }
            let newCollection = await db.createCollection(info.Name, {

            });
            if (info.setIndex) {
                info.setIndex(newCollection);
            }
            this._collectionList.push(new CollectionStore(newCollection, info.Joins));
        } else {
            this._collectionList.push(new CollectionStore(names[0], info.Joins));
        }
    }

    static async createCollections(clear: boolean) {
        this._collectionList = new Array<CollectionStore>();
        this._existCollections = await this._client.db(this._db).collections();
        for (let i = 0; i < Logic.Configuration.collectionInfos.length; i++) {
            let ci = Logic.Configuration.collectionInfos[i];
            await this._createCollection.bind(this)(ci, clear);
        }
    }

    static async connect(url, database) {
        this._db = database;
        this._client = await MongoClient.connect(`${url}${database}`, {
            appname: 'Molly',
            autoReconnect: true,
            poolSize: 25
        });
    }

    static close() {
        if (this._client !== null) {
            this._client.close();
        }
    }
}