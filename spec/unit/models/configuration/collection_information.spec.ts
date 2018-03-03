import {CollectionInformation} from './../../../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('CollectionInformation Spec', () => {
    it('can create', () => {
        let info = new CollectionInformation('Test');
        assert.equal(info.Name, 'Test');
    });
    
    it('empty name not allowed', () => {
        try {
            new CollectionInformation('');
            assert.fail('no error thrown');
        } catch (err) {
            assert.equal(err.message, 'no empty names allowed');
        }
    });
});