import {Collection} from 'mongodb';
import {MongoLookup} from './lookup';

export class CollectionStore {
    collection: Collection<any>;
    joins: Array<MongoLookup>;

    constructor(col: Collection<any>, joins: Array<MongoLookup>) {
        this.collection = col;
        this.joins = joins;
    }
}