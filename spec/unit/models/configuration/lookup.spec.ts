import {MongoLookup, JoinType} from './../../../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('MongoLookup Spec', async () => {
    it('construct MongoLookup', () => {
        let l = new MongoLookup('other', 'myId', '_id', JoinType.ONEMANY);
        assert.equal(l.From, 'other');
        assert.equal(l.LocalField, 'myId');
        assert.equal(l.ForeignField, '_id');
        assert.equal(l.Type, JoinType.ONEMANY);
    });

    it('catch empty from', () => {
        try {
            new MongoLookup('', 'myId', '_id', JoinType.ONEMANY);
            assert.fail('no error thrown');
        } catch (err) {
            assert.equal(err.message, 'from can not be empty');
        }
    });

    it('catch empty localField', () => {
        try {
            new MongoLookup('other', '', '_id', JoinType.ONEMANY);
            assert.fail('no error thrown');
        } catch (err) {
            assert.equal(err.message, 'localField can not be empty');
        }
    });

    it('catch empty foreignField', () => {
        try {
            new MongoLookup('other', 'myId', '', JoinType.ONEMANY);
            assert.fail('no error thrown');
        } catch (err) {
            assert.equal(err.message, 'foreignField can not be empty');
        }
    });

    it('getAggregate one to one', () => {
        let l = new MongoLookup('other', 'myId', '_id', JoinType.ONEONE);
        let agg = l.getAggregate();
        assert.isArray(agg);
        assert.equal(agg.length, 2);
        assert.isDefined(agg[0]['$lookup']);
        assert.equal(agg[0]['$lookup'].from, 'other');
        assert.equal(agg[0]['$lookup'].localField, 'myId');
        assert.equal(agg[0]['$lookup'].foreignField, '_id');
        assert.equal(agg[0]['$lookup'].as, 'myId');
        assert.isDefined(agg[1]['$unwind']);
        assert.equal(agg[1]['$unwind'].path, '$myId');
        assert.equal(agg[1]['$unwind'].preserveNullAndEmptyArrays, true);
    });

    it('getAggregate one to many', () => {
        let l = new MongoLookup('other', 'myId', '_id', JoinType.ONEMANY);
        let agg = l.getAggregate();
        assert.isArray(agg);
        assert.equal(agg.length, 1);
        assert.isDefined(agg[0]['$lookup']);
        assert.equal(agg[0]['$lookup'].from, 'other');
        assert.equal(agg[0]['$lookup'].localField, 'myId');
        assert.equal(agg[0]['$lookup'].foreignField, '_id');
        assert.equal(agg[0]['$lookup'].as, 'myId');
    });

    it('getAggregate one to one', () => {
        let l = new MongoLookup('other', 'myId', '_id', 10);
        let agg = l.getAggregate();
        assert.isArray(agg);
        assert.equal(agg.length, 0);
    });
});