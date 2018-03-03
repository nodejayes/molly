import {Logic} from './logic';
import { ValidationInformation, CollectionInformation, OperationInformation } from '.';

export function registerValidation(v: ValidationInformation) {
    Logic.Configuration.validationInfos.push(v);
}

export function registerCollection(c: CollectionInformation) {
    Logic.Configuration.collectionInfos.push(c);
}

export function registerOperation(o: OperationInformation) {
    Logic.Configuration.operationInfos.push(o);
}

export * from './definitions/base_types';
export * from './models/configuration/lookup';
export * from './serve/server';
export * from './interfaces/RouteInvoker';
export * from './models/configuration/operation_information';
export * from './models/configuration/validation_information';
export * from './models/configuration/collection_information';
