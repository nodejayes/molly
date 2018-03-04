import {Logic} from './logic';
import { ValidationInformation, CollectionInformation, OperationInformation } from '.';

/**
 * register a ValidationInformation on Molly
 * 
 * @export
 * @param {ValidationInformation} v 
 */
export function registerValidation(v: ValidationInformation) {
    Logic.Configuration.validationInfos.push(v);
}

/**
 * register a CollectionInformation on Molly
 * 
 * @export
 * @param {CollectionInformation} c 
 */
export function registerCollection(c: CollectionInformation) {
    Logic.Configuration.collectionInfos.push(c);
}

/**
 * register a OperationInformation on Molly
 * 
 * @export
 * @param {OperationInformation} o 
 */
export function registerOperation(o: OperationInformation) {
    Logic.Configuration.operationInfos.push(o);
}

export * from './definitions/base_types';
export * from './models/configuration/lookup';
export * from './serve/server';
export * from './interfaces/request_model';
export * from './interfaces/response_model';'initFinish'
export * from './interfaces/route_invoker';
export * from './interfaces/websocket_message';
export * from './models/configuration/operation_information';
export * from './models/configuration/validation_information';
export * from './models/configuration/collection_information';
