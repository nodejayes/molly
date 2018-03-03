import {
    BaseTypes,
    CollectionInformation,
    ExpressServer,
    ValidationInformation,
    JoinType,
    MongoLookup,
    OperationInformation,
    registerCollection,
    registerOperation,
    registerValidation
} from './../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('Molly Modul Spec', () => {
    it('export all types', () => {
        assert.isDefined(BaseTypes);
        assert.isDefined(JoinType);
        assert.isDefined(CollectionInformation);
        assert.isDefined(ValidationInformation);
        assert.isDefined(OperationInformation);
        assert.isDefined(ExpressServer);
        assert.isDefined(MongoLookup);
        assert.isDefined(registerCollection);
        assert.isDefined(registerOperation);
        assert.isDefined(registerValidation);
    });
});