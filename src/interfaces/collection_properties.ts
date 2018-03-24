import {MongoLookup} from './../models/configuration/lookup';

/**
 * Collection Informations
 * 
 * @export
 * @interface ICollectionProperties
 */
export interface ICollectionProperties {
    lookup?: MongoLookup[];
    index?: Function;
    allow: string;
    createDescription?: string;
    createSummary?: string;
    readDescription?: string;
    readSummary?: string;
    updateDescription?: string;
    updateSummary?: string;
    deleteDescription?: string;
    deleteSummary?: string;
}