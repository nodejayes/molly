import {
    BaseTypes,
    ExpressServer,
    JoinType,
    MongoLookup,
    collection,
    validation,
    operation,
} from '../../src';
import {assert} from 'chai';
import 'mocha'

describe('Molly Modul Spec', () => {
    it('export all types', () => {
        assert.isDefined(BaseTypes);
        assert.isDefined(JoinType);
        assert.isDefined(ExpressServer);
        assert.isDefined(MongoLookup);
        assert.isDefined(collection);
        assert.isDefined(validation);
        assert.isDefined(operation);
    });
});