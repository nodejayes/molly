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
    /**
     * List of Collection Informations
     * 
     * @type {Array<CollectionInformation>}
     * @memberof MollyConfiguration
     */
    collectionInfos: Array<CollectionInformation>;
    /**
     * List of Validation Informations
     * 
     * @type {Array<ValidationInformation>}
     * @memberof MollyConfiguration
     */
    validationInfos: Array<ValidationInformation>;
    /**
     * List of Operation Informations
     * 
     * @type {Array<OperationInformation>}
     * @memberof MollyConfiguration
     */
    operationInfos: Array<OperationInformation>;

    /**
     * Creates an instance of MollyConfiguration.
     * @memberof MollyConfiguration
     */
    constructor() {
        this.collectionInfos = new Array<CollectionInformation>();
        this.validationInfos = new Array<ValidationInformation>();
        this.operationInfos = new Array<OperationInformation>();
    }
}