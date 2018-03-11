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

let server = new ExpressServer();
let customString = BaseTypes.custom.string();
let mongoDbObjectId = BaseTypes.mongoDbObjectId;
let array = BaseTypes.custom.array();
let bool = BaseTypes.bool;
let type = BaseTypes.type;
let user = [];

describe('Websocket Spec', () => {
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
                @validation({type: BaseTypes.stringDefaultLength})
                key: string;

                @validation({type: BaseTypes.bool})
                active: boolean;
            }

            class Ops {
                @operation
                async countUser(inv: IRouteInvoker, params: any) {
                    let u = await inv.read('User', {}, {_id: true});
                    return u.length;
                }
            }
        });
    });

    describe('main server functionallity', () => {
        it('start server', async () => {
            let msg = await server.start({
                binding: 'localhost',
                port: 8086,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true,
                useWebsocket: true
            });
            assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
        });

        it('test connect', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                assert.equal(data.id, 'initFinish');
                assert.equal(data.data, true);
                c.close();
            });
        });

        it('create user', async () => {
            let ccu = new Websocket('ws://localhost:8086');
            ccu.on('message', (inc: string) => {
                let d = <IWebsocketMessage>JSON.parse(inc);
                switch(d.id) {
                    case 'initFinish':
                        ccu.send(JSON.stringify(<IRequestModel>{
                            Action: 'create',
                            Model: 'User',
                            Parameter: [
                                {
                                    username: 'Test',
                                    password: 'Test',
                                    email: 'test@test.de',
                                    group: null
                                }
                            ]
                        }));
                        break;
                    case 'create_user':
                        assert.isArray(d.data);
                        assert.equal(d.data.length, 1);
                        user = d.data;
                        ccu.close();
                        break;
                    case 'ERROR':
                        assert.fail(d.data);
                        ccu.close();
                        break;
                }
            });
        });

        it('read user', async () => {
            let cru = new Websocket('ws://localhost:8086');
            cru.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        cru.send(JSON.stringify(<IRequestModel>{
                            Action: 'read',
                            Model: 'User',
                            Parameter: {}
                        }));
                        break;
                    case 'read_user':
                        assert.isArray(data.data);
                        assert.equal(data.data.length, 1);
                        cru.close();
                        break;
                    case 'ERROR':
                        cru.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('operation userCount', async () => {
            let cuc = new Websocket('ws://localhost:8086');
            cuc.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        cuc.send(JSON.stringify(<IRequestModel>{
                            Action: 'operation',
                            Model: 'countUser',
                            Parameter: {}
                        }));
                        break;
                    case 'operation_countUser':
                        assert.equal(data.data, 1);
                        cuc.close();
                        break;
                    case 'ERROR':
                        cuc.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('update user', async () => {
            let cuu = new Websocket('ws://localhost:8086');
            cuu.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        cuu.send(JSON.stringify(<IRequestModel>{
                            Action: 'update',
                            Model: 'User',
                            Parameter: {
                                id: user[0]._id,
                                updateSet: {
                                    username: 'Test2'
                                }
                            }
                        }));
                        break;
                    case 'update_user':
                        assert.equal(data.data, true);
                        cuu.close();
                        break;
                    case 'ERROR':
                        cuu.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('delete user', async () => {
            let cd = new Websocket('ws://localhost:8086');
            cd.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        let d = JSON.stringify(<IRequestModel>{
                            Action: 'delete',
                            Model: 'User',
                            Parameter: {
                                id: user[0]._id
                            }
                        });
                        cd.send(d);
                        break;
                    case 'delete_user':
                        assert.equal(data.data, true);
                        cd.close();
                        break;
                    case 'ERROR':
                        cd.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('catch invalid message', async () => {
            let cim = new Websocket('ws://localhost:8086');
            cim.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        cim.send('invalid');
                        break;
                    case 'ERROR':
                        assert.equal(data.data, 'Unexpected token i in JSON at position 0');
                        cim.close();
                        break;
                }
            });
        });

        it('stop server', () => {
            server.stop();
        });
    });
});
