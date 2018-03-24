import { JoinType } from 'models';

/**
 * Mongo Lookup Interface
 * 
 * @export
 * @interface IMongoLookup
 */
export interface IMongoLookup {
    From: string;
    LocalField: string;
    ForeignField: string;
    Type: JoinType;
}