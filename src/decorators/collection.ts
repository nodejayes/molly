import { ICollectionProperties } from '../interfaces';
import { CollectionInformation } from '../models';
import { Logic } from '../basic';

/**
 * Decorate a Class with Collection Informations
 * 
 * @export
 * @param {ICollectionProperties} collectionProps 
 * @returns 
 */
export function collection(collectionProps: ICollectionProperties) {
    return function(constructor: Function): void {
        Logic.Configuration.collectionInfos.push(
            new CollectionInformation(constructor.name, collectionProps.lookup, collectionProps.index, collectionProps.allow,
                collectionProps.createDescription, collectionProps.createSummary,
                collectionProps.readDescription, collectionProps.readSummary,
                collectionProps.updateDescription, collectionProps.updateSummary,
                collectionProps.deleteDescription, collectionProps.deleteSummary)
        );
    }
}
