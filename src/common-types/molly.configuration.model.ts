import {CollectionInformation} from './collection.information.model';

export class MollyConfiguration {
    public address: String
    public port: Number
    public collectionInfo: Array<CollectionInformation>;
}