import { CollectionInformation } from 'models';
import { ValidationInformation } from 'models';
import { OperationInformation } from 'models';

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