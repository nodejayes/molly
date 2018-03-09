import {MongoLookup} from './../models/configuration/lookup';

export interface ICollectionProperties {
    lookup: MongoLookup[];
    index: Function;
    allow: string;
}