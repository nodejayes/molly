import {MongoLookup} from './../models/configuration/lookup';

/**
 * Collection Informations
 * 
 * @export
 * @interface ICollectionProperties
 */
export interface ICollectionProperties {
    lookup: MongoLookup[];
    index: Function;
    allow: string;
}