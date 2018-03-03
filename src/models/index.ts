import {RequestModel as REQMO} from './communicate/request';
import {ResponseModel as RESMO} from './communicate/response';
import {CollectionInformation as CI} from './configuration/collection_information';
import {MollyConfiguration as MC} from './configuration/molly_configuration';
import {ValidationInformation as VI} from './configuration/validation_information';
import {MongoLookup as LOOK, MongoLookup} from './configuration/lookup';
import {OperationInformation as OI} from './configuration/operation_information';

export namespace Models {
    export namespace Communicate {
        export let RequestModel = REQMO;
        export let ResponseModel = RESMO;
    }
    export namespace Configuration {
        export let CollectionInformation = CI;
        export let MollyConfiguration = MC;
        export let ValidationInformation = VI;
        export let MongoLookup = LOOK;
        export let OperationInformation = OI;
    }
}