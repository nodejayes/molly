import {
    ExpressServer
} from 'index';
import {assert} from 'chai';
import 'mocha';
import {join} from 'path';

const request = require('request-promise');

let server = new ExpressServer();

describe('Static Files Spec', () => {
    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: 'mongodb://localhost:27017',
            mongoDatabase: 'test_molly',
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

    it('stop server', () => {
        server.stop();
    });

    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: 'mongodb://localhost:27017',
            mongoDatabase: 'test_molly',
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

    it('stop server', () => {
        server.stop();
    });

    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: 'mongodb://localhost:27017',
            mongoDatabase: 'test_molly',
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

    it('stop server', () => {
        server.stop();
    });
});