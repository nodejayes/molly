import {CollectionInformation} from './collection_information';
import {ValidationInformation} from './validation_information';

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
    collectionInfos: Array<CollectionInformation>;
    validationInfos: Array<ValidationInformation>;
}