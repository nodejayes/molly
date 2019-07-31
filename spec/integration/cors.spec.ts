import {assert} from 'chai';
import 'mocha';
import {ExpressServer} from '../../src/modules';
import {MONGODB_DB, MONGODB_URL} from '../config';
import {SampleField} from '../models/samplefield';

const req = require('request-promise');

describe('CORS Headers Spec', () => {
    it('has default values when not set', async () => {
        let server = new ExpressServer();
        let respHeaders = null;

        await server.start({
            binding: 'localhost',
            port: 8086,
            clear: true,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            models: [SampleField]
        });

        await req({
            method: 'OPTIONS',
            uri: 'http://localhost:8086/',
            transform: (body, response) => {
                respHeaders = response.headers;
            }
        });

        await server.stop();

        assert.isDefined(respHeaders['access-control-allow-origin'], 'missing Access-Control-Allow-Origin header');
        assert.isDefined(respHeaders['access-control-allow-headers'], 'missing Access-Control-Allow-Headers header');
        assert.isDefined(respHeaders['access-control-allow-methods'], 'missing Access-Control-Allow-Methods header');
        assert.isDefined(respHeaders['access-control-allow-credentials'], 'missing Access-Control-Allow-Credentials header');
        assert.equal(respHeaders['access-control-allow-origin'], 'http://localhost:8086', 'Access-Control-Allow-Origin value not set');
        assert.equal(respHeaders['access-control-allow-methods'], 'POST', 'Access-Control-Allow-Methods value was changed');
        assert.equal(respHeaders['access-control-allow-headers'], '', 'Access-Control-Allow-Headers value not set');
        assert.equal(respHeaders['access-control-allow-credentials'], 'false', 'Access-Control-Allow-Credentials value not set');
    });

    it('set config properties', async () => {
        let server = new ExpressServer();
        let respHeaders = null;

        await server.start({
            binding: 'localhost',
            port: 8086,
            clear: true,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            models: [SampleField],
            corsOrigin: 'testOrigin',
            corsHeaders: 'testHeader',
            corsCredentials: 'testCredential'
        });

        await req({
            method: 'OPTIONS',
            uri: 'http://localhost:8086/',
            transform: (body, response) => {
                respHeaders = response.headers;
            }
        });

        await server.stop();

        assert.isDefined(respHeaders['access-control-allow-origin'], 'missing Access-Control-Allow-Origin header');
        assert.isDefined(respHeaders['access-control-allow-headers'], 'missing Access-Control-Allow-Headers header');
        assert.isDefined(respHeaders['access-control-allow-methods'], 'missing Access-Control-Allow-Methods header');
        assert.isDefined(respHeaders['access-control-allow-credentials'], 'missing Access-Control-Allow-Credentials header');
        assert.equal(respHeaders['access-control-allow-origin'], 'testOrigin', 'Access-Control-Allow-Origin value not set');
        assert.equal(respHeaders['access-control-allow-methods'], 'POST', 'Access-Control-Allow-Methods value was changed');
        assert.equal(respHeaders['access-control-allow-headers'], 'testHeader', 'Access-Control-Allow-Headers value not set');
        assert.equal(respHeaders['access-control-allow-credentials'], 'testCredential', 'Access-Control-Allow-Credentials value not set');
    });
});
