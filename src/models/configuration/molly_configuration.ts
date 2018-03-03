import {CollectionInformation} from './collection_information';
import {ValidationInformation} from './validation_information';
import {OperationInformation} from './operation_information';

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
    operationInfos: Array<OperationInformation>;

    constructor() {
        this.collectionInfos = new Array<CollectionInformation>();
        this.validationInfos = new Array<ValidationInformation>();
        this.operationInfos = new Array<OperationInformation>();
    }
}