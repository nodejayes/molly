import {
    MongoDb
} from '../../../src/modules';
import {assert} from 'chai';
import 'mocha'

describe('MongoDb Spec', () => {
    it('dont fire close when not initiate', async () => {
        MongoDb.close();
        MongoDb.close();
    });
});