import {ExpressServer, IRequestModel, IWebsocketMessage} from '../../src';
import {assert} from 'chai';
import 'mocha';
import * as Websocket from 'ws';
import {MONGODB_DB, MONGODB_URL} from '../config';
import {Book} from '../models/book';

describe('Websocket Spec', () => {
    let server = new ExpressServer();
    let user = {};
    let socket = null;

    describe('main server functionallity', () => {
        before(async () => {
            let msg = await server.start({
                binding: 'localhost',
                port: 8087,
                mongoUrl: MONGODB_URL,
                mongoDatabase: MONGODB_DB,
                clear: true,
                useWebsocket: true
            });
            assert.equal(msg, 'server listen on http://localhost:8087/', 'invalid return message');
            socket = new Websocket('ws://localhost:8087');
        });

        after(async () => {
            await server.stop();
        });

        it('cascade with one socket', (done) => {
            let expectError = false;
            socket.on('message', (inc: string) => {
                let d = <IWebsocketMessage>JSON.parse(inc);
                switch (d.id) {
                    case 'initFinish':
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'create',
                            Model: 'User',
                            Parameter: {
                                username: 'Test',
                                password: 'Test',
                                email: 'test@test.de',
                                group: null
                            }
                        }));
                        break;
                    case 'create_User':
                        assert.isObject(d.data);
                        user = d.data;
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'read',
                            Model: 'User',
                            Parameter: {}
                        }));
                        break;
                    case 'read_User':
                        assert.isArray(d.data);
                        assert.equal(d.data.length, 1);
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'operation',
                            Model: 'countUser',
                            Parameter: {}
                        }));
                        break;
                    case 'operation_countUser':
                        assert.equal(d.data, 1);
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'update',
                            Model: 'User',
                            Parameter: {
                                id: user['_id'],
                                updateSet: {
                                    username: 'Test2'
                                }
                            }
                        }));
                        break;
                    case 'update_User':
                        assert.equal(d.data, true);
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'delete',
                            Model: 'User',
                            Parameter: {
                                id: user['_id']
                            }
                        }));
                        break;
                    case 'delete_User':
                        assert.equal(d.data, true);
                        socket.send(JSON.stringify(<IRequestModel>{
                            Action: 'transaction',
                            Model: 'unique',
                            Parameter: [
                                <IRequestModel>{
                                    Action: 'create',
                                    Model: 'Book',
                                    Parameter: <Book>{
                                        isbn: '123456789',
                                        title: 'Websocket with Molly Transactions'
                                    }
                                }
                            ]
                        }));
                        break;
                    case 'transaction_unique':
                        assert.equal(d.data, true);
                        expectError = true;
                        socket.send('invalid');
                        break;
                    case 'ERROR':
                        if (!expectError) {
                            assert.fail(d.data);
                        } else {
                            assert.equal(d.data, 'Unexpected token i in JSON at position 0');
                        }
                        server.stop()
                            .then(() => {
                                done();
                            }).catch(err => {
                            assert.fail(err.message);
                        });
                        break;
                }
            });
        });
    });
});
