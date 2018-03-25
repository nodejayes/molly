import { OperationInformation, CollectionInformation, ValidationInformation } from '../../models';

/**
 * Molly Configuration Interface
 * 
 * @export
 * @interface IMollyConfiguration
 */
export interface IMollyConfiguration {
    collectionInfos: CollectionInformation[];
    validationInfos: ValidationInformation[];
    operationInfos: OperationInformation[];
}