import { MongoClient } from 'mongodb';
import { MongoLookup } from 'models/index';
import { ICollectionInformation } from 'interfaces/index';

/**
 * Collection Information
 * 
 * @export
 * @class CollectionInformation
 */
export class CollectionInformation implements ICollectionInformation {
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
     * allow Create Update or Delete
     * Syntax: CUD CXD CXX XUD XXD
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    allow: string;
    /**
     * a Description for create Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    createDescription?: string;
    /**
     * a Summary for create Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    createSummary?: string;
    /**
     * a Description for read Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    readDescription?: string;
    /**
     * a Summary for read Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    readSummary?: string;
    /**
     * a Description for update Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    updateDescription?: string;
    /**
     * a Summary for update Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    updateSummary?: string;
    /**
     * a Description for delete Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    deleteDescription?: string;
    /**
     * a Summary for delete Route
     * 
     * @type {string}
     * @memberof CollectionInformation
     */
    deleteSummary?: string;

    /**
     * Creates an instance of CollectionInformation.
     * @param {string} name 
     * @param {Array<MongoLookup>} [joins] 
     * @param {Function} [setIndex] 
     * @memberof CollectionInformation
     */
    constructor(name: string, joins?: Array<MongoLookup>, setIndex?: Function, allow?: string, 
        createDes?: string, createSum?: string, readDes?: string, readSum?: string,
        updateDes?: string, updateSum?: string, deleteDes?: string, deleteSum?: string) {
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
        this.createDescription = createDes;
        this.createSummary = createSum;
        this.readDescription = readDes;
        this.readSummary = readSum;
        this.updateDescription = updateDes;
        this.updateSummary = updateSum;
        this.deleteDescription = deleteDes;
        this.deleteSummary = deleteSum;
    }
}