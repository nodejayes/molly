import {MongoLookup} from '../..';

/**
 * Collection Information Interface
 *
 * @export
 * @interface ICollectionInformation
 */
export interface ICollectionInformation {
  Name: string;
  Joins: MongoLookup[];
  setIndex: Function;
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
