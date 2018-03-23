import {
    ExpressServer, 
    BaseTypes, 
    IRouteInvoker, 
    JoinType, 
    MongoLookup,
    IRequestModel,
    IWebsocketMessage,
    operation, collection, validation
} from './../../src/index';
import {assert} from 'chai';
import 'mocha';
import * as Websocket from 'ws';

describe('Websocket Spec', () => {
    let server = new ExpressServer();
    let customString = BaseTypes.custom.string();
    let mongoDbObjectId = BaseTypes.mongoDbObjectId;
    let array = BaseTypes.custom.array();
    let bool = BaseTypes.bool;
    let type = BaseTypes.type;
    let user = {};
    let socket = null;
    
    before(() => {
        server.clearConfiguration();
    });

    describe('Define Schema', () => {
        it('setup user schema', async () => {
            @collection({
                lookup: [
                    new MongoLookup('Group', 'group', '_id', JoinType.ONEONE),
                    new MongoLookup('Right', 'group.rights', '_id', JoinType.ONEMANY)
                ],
                index: async (col) => {
                    await col.createIndex({
                        username: 1,
                    }, {
                        sparse: true,
                        unique: true,
                        background: true,
                    });
                },
                allow: 'CUD'
            })
            class User {
                @validation({type: BaseTypes.mongoDbObjectId})
                _id: string;
                
                @validation({type: BaseTypes.stringDefaultLength})
                username: string;

                @validation({type: BaseTypes.stringDefaultLength})
                password: string;

                @validation({type: BaseTypes.stringDefaultLength})
                email: string;

                group: Group;
            }

            @collection({
                lookup: [
                    new MongoLookup('Right', 'rights', '_id', JoinType.ONEMANY)
                ],
                index: async (col) => {
                    await col.createIndex({
                        name: 1,
                    }, {
                        sparse: true,
                        unique: true,
                        background: true,
                    });
                },
                allow: 'CUD'
            })
            class Group {
                @validation({type: BaseTypes.mongoDbObjectId})
                _id: string;

                @validation({type: BaseTypes.stringDefaultLength})
                name: string;

                rights: Right[];
            }

            @collection({
                lookup: null,
                index: async (col) => {
                    await col.createIndex({
                        key: 1,
                    }, {
                        sparse: true,
                        unique: true,
                        background: true,
                    });
                },
                allow: 'C'
            })
            class Right {
                @validation({type: BaseTypes.mongoDbObjectId})
                _id: string;

                @validation({type: BaseTypes.stringDefaultLength})
                key: string;

                @validation({type: BaseTypes.bool})
                active: boolean;
            }

            class Ops {
                @operation({})
                async countUser(inv: IRouteInvoker, params: any) {
                    let u = await inv.read('User', {}, {_id: true});
                    return u.length;
                }
            }
        });
    });

    describe('main server functionallity', () => {
        before(async () => {
            let msg = await server.start({
                binding: 'localhost',
                port: 8087,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true,
                useWebsocket: true
            });
            assert.equal(msg, 'server listen on http://localhost:8087/', 'invalid return message');
            socket = new Websocket('ws://localhost:8087');
        });

        it('cascade with one socket', (done) => {
            let expectError = false;
            socket.on('message', (inc: string) => {
                let d = <IWebsocketMessage>JSON.parse(inc);
                switch(d.id) {
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
                        expectError = true;
                        socket.send('invalid');
                        break;
                    case 'ERROR':
                        if (!expectError) {
                            assert.fail(d.data);
                        } else {
                            assert.equal(d.data, 'Unexpected token i in JSON at position 0');
                        }
                        server.stop();
                        done();
                        break;
                }
            });
        });
    });
});
