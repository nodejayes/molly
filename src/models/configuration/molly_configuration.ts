import { CollectionInformation, ValidationInformation, OperationInformation } from 'models/index';
import { IMollyConfiguration } from 'interfaces/index';

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
export class MollyConfiguration implements IMollyConfiguration {
    /**
     * List of Collection Informations
     * 
     * @type {CollectionInformation[]}
     * @memberof MollyConfiguration
     */
    collectionInfos: CollectionInformation[];

    /**
     * List of Validation Informations
     * 
     * @type {ValidationInformation[]}
     * @memberof MollyConfiguration
     */
    validationInfos: ValidationInformation[];

    /**
     * List of Operation Informations
     * 
     * @type {OperationInformation[]}
     * @memberof MollyConfiguration
     */
    operationInfos: OperationInformation[];


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