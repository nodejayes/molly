import {Molly} from './../../../src/index';
import {assert} from 'chai';
import 'mocha'

const request = require('request-promise');

describe('Server Spec', () => {
    let server = new Molly.Serve.ExpressServer();

    it('start server', async () => {
        let msg = await server.start('localhost', 8086, 'mongodb://localhost:27017/', 'test_molly', true);
        assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
    });

    it('_filterRequest wrong method', async () => {
        let rs = null;
        try {
            rs = await request({
                method: 'GET',
                uri: 'http://localhost:8086/read/user',
                body: {params:{}},
                json: true
            });
            assert.fail('GET request is good');
        } catch (err) {
            assert.equal(err.message, '405 - {"data":null,"errors":"not supported method GET"}', 'error not returned');
        }
    });

    it('stop server', () => {
        server.stop();
    });
});