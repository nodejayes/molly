import {
    ExpressServer
}                                             from '../../src';
import {assert}                               from 'chai';
import 'mocha';
import {join}                                 from 'path';
import {MONGODB_DB, MONGODB_URL, REPLICA_SET} from '../config';

let server = new ExpressServer();

describe('Https Spec', () => {
    it('can start the server', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            mongoReplicaSet: REPLICA_SET,
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem')
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
    });

    it('stop server', async () => {
        await server.stop();
    });

    it('can start the server without ca', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            mongoReplicaSet: REPLICA_SET,
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
    });

    it('stop server', async () => {
        await server.stop();
    });

    it('ignore invalid configuration', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            mongoReplicaSet: REPLICA_SET,
            certFile: '',
            keyFile: ''
        });
        assert.equal(msg, 'server listen on http://localhost:8086/');
    });

    it('stop server', async () => {
        await server.stop();
    });
});
