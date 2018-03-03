import {BaseTypes, ValidationInformation} from './../../../../src/index';
import {assert} from 'chai';
import 'mocha'

let type = BaseTypes.type;

describe('ValidationInformation Spec', () => {
    it('construct valid', () => {
        let info = new ValidationInformation(
            'Test', null, type({
                name: BaseTypes.custom.string()
            }));
        assert.equal(info.Name, 'Test', 'Name was not set');
        assert.isNull(info.CreateSchema, 'CreateSchema is Defined');
        assert.isNotNull(info.ReadSchema, 'ReadSchema is Undefined');
        assert.isNull(info.UpdateSchema, 'UpdateSchema is Defined');
        assert.isNull(info.DeleteSchema, 'DeleteSchema is Defined');
    });

    it('catch empty Name', () => {
        try {
            let info = new ValidationInformation('', null, type({
                name: BaseTypes.custom.string()
            }));
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'name must be specified for validation information');
        }
    });

    it('catch empty Validation Schema', () => {
        try {
            let info = new ValidationInformation('Test');
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'you must define a create, read, update or delete schema');
        }
    });

    it('catch check not allowed', () => {
        try {
            let info = new ValidationInformation('Test', null, type({
                name: BaseTypes.custom.string()
            }));
            info.checkCreate({});
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'create not allowed for Test');
        }
        try {
            let info = new ValidationInformation('Test', null, null, type({
                name: BaseTypes.custom.string()
            }));
            info.checkRead({});
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'read not allowed for Test');
        }
        try {
            let info = new ValidationInformation('Test', null, type({
                name: BaseTypes.custom.string()
            }));
            info.checkUpdate({});
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'update not allowed for Test');
        }
        try {
            let info = new ValidationInformation('Test', null, type({
                name: BaseTypes.custom.string()
            }));
            info.checkDelete({});
            assert.fail('no Error thrown');
        } catch (err) {
            assert.equal(err.message, 'delete not allowed for Test');
        }
    });
});