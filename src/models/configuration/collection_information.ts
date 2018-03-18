import {MongoClient} from 'mongodb';
import {MongoLookup} from './lookup';

/**
 * Collection Information
 * 
 * @export
 * @class CollectionInformation
 */
export class CollectionInformation {
    /**
     * Collection Name
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    Name: string;
    /**
     * Lookups for the current Collection
     * 
     * @type {Array<MongoLookup>}
     * @memberof CollectionInformation
     */
    Joins: Array<MongoLookup>;
    /**
     * Indexes of the current Collection
     * 
     * @type {Function}
     * @memberof CollectionInformation
     */
    setIndex: Function;
    /**
     * 
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    allow: string;

    /**
     * Creates an instance of CollectionInformation.
     * @param {string} name 
     * @param {Array<MongoLookup>} [joins] 
     * @param {Function} [setIndex] 
     * @memberof CollectionInformation
     */
    constructor(name: string, joins?: Array<MongoLookup>, setIndex?: Function, allow?: string) {
        this.Name = name;
        if (joins) {
            this.Joins = joins;
        }
        if (setIndex) {
            this.setIndex = setIndex;
        }
        if (allow) {
            this.allow = allow;
        }
    }
}