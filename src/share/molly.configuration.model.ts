import {CollectionInformation} from './collection.information.model';
import {ValidationInformation} from './validation.information.model';

/**
 * Configuration Object
 * 
 * @export
 * @class MollyConfiguration
 * @prop address the Server Address where the Server listen
 * @property port the Port where the Server listen
 * @property collectionInfo a Array of Collection definitions
 * @property validationInfo a Array of Validations for Types
 */
export class MollyConfiguration {
    address: String;
    port: Number;
    collectionInfo: Array<CollectionInformation>;
    validationInfo: Array<ValidationInformation>;
}