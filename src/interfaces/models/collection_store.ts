import { Collection } from 'mongodb';
import { MongoLookup } from '../..';

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