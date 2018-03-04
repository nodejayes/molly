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
     * Creates an instance of CollectionInformation.
     * @param {string} name 
     * @param {Array<MongoLookup>} [joins] 
     * @param {Function} [setIndex] 
     * @memberof CollectionInformation
     */
    constructor(name: string, joins?: Array<MongoLookup>, setIndex?: Function) {
        if (name.length < 1) {
            throw new Error(`no empty names allowed`);
        }
        this.Name = name;
        if (joins) {
            this.Joins = joins;
        }
        if (setIndex) {
            this.setIndex = setIndex;
        }
    }
}