import { Collection } from 'mongodb';
import { MongoLookup } from 'index';

/**
 * Collection Store Interface
 * 
 * @export
 * @interface ICollectionStore
 */
export interface ICollectionStore {
    collection: Collection<any>
    joins: MongoLookup[]
}