import {ExpressServer} from '../../src';
import {assert} from 'chai';
import 'mocha';
import {MONGODB_DB, MONGODB_URL} from '../config';
import {SampleField} from '../models/samplefield';

const req = require('request-promise');

describe('extended Classes Spec', () => {
    it('create informations successfully', async () => {
        let server = new ExpressServer();

        await server.start({
            binding: 'localhost',
            port: 8086,
            clear: true,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            models: [SampleField]
        });

        let res = await req({
            method: 'POST',
            uri: 'http://localhost:8086/create/SampleField',
            body: {
                params: <SampleField>{
                    cao: 12.5,
                    k: 0.0,
                    p: 0.0,
                    mg: 0.0,
                    created: new Date(),
                    fieldname: 'Field 1',
                    version: 1,
                    id: 1
                }
            },
            json: true
        });

        assert.isNull(res.errors);
        assert.isObject(res.data);

        try {
            await req({
                method: 'POST',
                uri: 'http://localhost:8086/create/SampleField',
                body: {
                    params: {
                        cao: 12.5,
                        k: 0.0,
                        p: 0.0,
                        mg: 0.0,
                        created: 'ein text',
                        fieldname: 'Field 1',
                        version: 1,
                        id: 1
                    }
                },
                json: true
            });
            assert.fail('no error thrown');
        } catch (err) {
            assert.notEqual(err.message.indexOf('must be a number of milliseconds or valid date string'), -1);
        }

        await server.stop();
    });
});
