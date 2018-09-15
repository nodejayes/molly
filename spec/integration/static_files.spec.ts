import {
    ExpressServer
}                                             from '../../src';
import {assert}                               from 'chai';
import 'mocha';
import {join}                                 from 'path';
import {MONGODB_DB, MONGODB_URL, REPLICA_SET} from '../config';

const request = require('request-promise');

let server = new ExpressServer();

describe('Static Files Spec', () => {
    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            mongoReplicaSet: REPLICA_SET,
            staticFiles: join(__dirname, '..', 'public')
        });
        assert.equal(msg, 'server listen on http://localhost:8086/');
    });

    it('can get index.html from root', async () => {
        let index = await request({
            method: 'GET',
            uri: `http://localhost:8086/`
        });
        assert.equal(index, '<h1>HelloWorld!</h1>');
    });

    it('can get index.html with name', async () => {
        let index = await request({
            method: 'GET',
            uri: `http://localhost:8086/index.html`
        });
        assert.equal(index, '<h1>HelloWorld!</h1>');
    });

    it('stop server', async () => {
        await server.stop();
    });

    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            mongoReplicaSet: REPLICA_SET,
            staticFiles: 'spec/public'
        });
        assert.equal(msg, 'server listen on http://localhost:8086/');
    });

    it('can get index.html from root', async () => {
        let index = await request({
            method: 'GET',
            uri: `http://localhost:8086/`
        });
        assert.equal(index, '<h1>HelloWorld!</h1>');
    });

    it('can get index.html with name', async () => {
        let index = await request({
            method: 'GET',
            uri: `http://localhost:8086/index.html`
        });
        assert.equal(index, '<h1>HelloWorld!</h1>');
    });

    it('stop server', async () => {
        await server.stop();
    });

    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoReplicaSet: REPLICA_SET,
            mongoDatabase: MONGODB_DB,
            staticFiles: join(__dirname, 'nothing')
        });
        assert.equal(msg, 'server listen on http://localhost:8086/');
    });

    it('can get index.html from root', async () => {
        try {
            let index = await request({
                method: 'GET',
                uri: `http://localhost:8086/index.html`
            });
            assert.fail('no error thrown');
        } catch (err) {
            assert.equal(err.message, 'assert.fail()');
        }
    });

    it('stop server', async () => {
        await server.stop();
    });
});
