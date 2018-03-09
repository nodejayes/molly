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
                    new MongoLookup('group', 'group', '_id', JoinType.ONEONE),
                    new MongoLookup('right', 'group.rights', '_id', JoinType.ONEMANY)
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
                    new MongoLookup('right', 'rights', '_id', JoinType.ONEMANY)
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
            let msg = await server.start('localhost', 8086, 'mongodb://localhost:27017/', 'test_molly', true, true);
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
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let d = <IWebsocketMessage>JSON.parse(inc);
                switch(d.id) {
                    case 'initFinish':
                        c.send(JSON.stringify(<IRequestModel>{
                            Action: 'create',
                            Model: 'user',
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
                        c.close();
                        break;
                    case 'ERROR':
                        assert.fail(d.data);
                        c.close();
                        break;
                }
            });
        });

        it('read user', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        c.send(JSON.stringify(<IRequestModel>{
                            Action: 'read',
                            Model: 'user',
                            Parameter: {}
                        }));
                        break;
                    case 'read_user':
                        assert.isArray(data.data);
                        assert.equal(data.data.length, 1);
                        c.close();
                        break;
                    case 'ERROR':
                        c.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('operation userCount', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        c.send(JSON.stringify(<IRequestModel>{
                            Action: 'operation',
                            Model: 'countUser',
                            Parameter: {}
                        }));
                        break;
                    case 'operation_countUser':
                        assert.equal(data.data, 1);
                        c.close();
                        break;
                    case 'ERROR':
                        c.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('update user', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        c.send(JSON.stringify(<IRequestModel>{
                            Action: 'update',
                            Model: 'user',
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
                        c.close();
                        break;
                    case 'ERROR':
                        c.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('update user', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        c.send(JSON.stringify(<IRequestModel>{
                            Action: 'delete',
                            Model: 'user',
                            Parameter: {
                                id: user[0]._id
                            }
                        }));
                        break;
                    case 'delete_user':
                        assert.equal(data.data, true);
                        c.close();
                        break;
                    case 'ERROR':
                        c.close();
                        assert.fail(data.data);
                        break;
                }
            });
        });

        it('catch invalid message', async () => {
            let c = new Websocket('ws://localhost:8086');
            c.on('message', (inc: string) => {
                let data = <IWebsocketMessage>JSON.parse(inc);
                switch(data.id) {
                    case 'initFinish':
                        c.send('invalid');
                        break;
                    case 'ERROR':
                        assert.equal(data.data, 'Unexpected token i in JSON at position 0');
                        c.close();
                        break;
                }
            });
        });

        it('stop server', async () => {
            await server.stop();
        });
    });
});