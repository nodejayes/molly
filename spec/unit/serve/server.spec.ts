import {ExpressServer} from '../../../src';
import {assert} from 'chai';
import 'mocha'

const request = require('request-promise');

describe('Server Spec', () => {
    let server = new ExpressServer();

    it('start server', async () => {
        let msg = await server.start({
            binding: 'localhost', 
            port: 8086,
            mongoUrl: 'mongodb://localhost:27017',
            mongoDatabase: 'test_molly',
            clear: true
        });
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

    it('catch invalid route', async () => {
        let rs = null;
        try {
            rs = await request({
                method: 'POST',
                uri: 'http://localhost:8086/nothing/user',
                body: {params:{}},
                json: true
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"invalid route /nothing/user"}', 'error not returned');
        }
    });

    it('catch invalid model', async () => {
        let rs = null;
        try {
            rs = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/notexist',
                body: {params:{}},
                json: true
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
        }

        try {
            rs = await request({
                method: 'POST',
                uri: 'http://localhost:8086/create/notexist',
                body: {params:{}},
                json: true
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
        }

        try {
            rs = await request({
                method: 'POST',
                uri: 'http://localhost:8086/update/notexist',
                body: {params:{}},
                json: true
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
        }

        try {
            rs = await request({
                method: 'POST',
                uri: 'http://localhost:8086/delete/notexist',
                body: {params:{}},
                json: true
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
        }
    });

    it('stop server', () => {
        server.stop();
    });
});