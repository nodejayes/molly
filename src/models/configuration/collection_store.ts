import {Collection}       from 'mongodb';
import {MongoLookup}      from '..';
import {ICollectionStore} from '../../interfaces';

/**
 * Collection Store Wrapper
 *
 * @export
 * @class CollectionStore
 */
export class CollectionStore implements ICollectionStore {
  /**
   * the MongoDb Collection Instance
   *
   * @type {Collection<any>}
   * @memberof CollectionStore
   */
  collection: Collection<any>;

  /**
   * The Lookups for the Collection based on the Lookups that registred on Molly
   *
   * @type {Array<MongoLookup>}
   * @memberof CollectionStore
   */
  joins: Array<MongoLookup>;

  /**
   * Creates an instance of CollectionStore.
   * @param {Collection<any>} col
   * @param {Array<MongoLookup>} joins
   * @memberof CollectionStore
   */
  constructor(col: Collection<any>, joins: Array<MongoLookup>) {
    this.collection = col;
    this.joins = joins;
  }
}
