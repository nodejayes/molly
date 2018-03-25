import {
    ExpressServer,
    BaseTypes,
    IRouteInvoker,
    JoinType,
    MongoLookup,
    collection, operation, validation
} from '../../src';
import {assert} from 'chai';
import 'mocha';

const request = require('request-promise');

describe('Molly Server Spec', () => {
    let server = new ExpressServer();
    let rights = [];
    let groups = [];
    let users = [];

    before(() => {
        server.clearConfiguration();
    });

    describe('main server functionallity', () => {
        it('start server', async () => {
            let msg = await server.start({
                binding: 'localhost',
                port: 8086,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true
            });
            assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
        });

        it('stop server', () => {
            server.stop();
        });
    });

    describe('incomplete Schema', () => {
        before(async () => {
            @collection({
                allow: 'CUD',
            })
            class NoValidation {
                title: string
            }

            await server.start({
                binding: 'localhost',
                port: 8086,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true
            });
        });

        it('catch create NoValidation', async () => {
            try {
                let resRights = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/create/NoValidation`,
                    body: {
                        params: {title: 'something'}
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model NoValidation"}');   
            }
        });

        it('catch read NoValidation', async () => {
            try {
                let resRights = await request({
                    method: 'POST',
                    uri: 'http://localhost:8086/read/NoValidation',
                    body: {
                        params: {}
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model NoValidation"}');
            }
        });

        it('catch update NoValidation', async () => {
            try {
                let resRights = await request({
                    method: 'POST',
                    uri: 'http://localhost:8086/update/NoValidation',
                    body: {
                        params: {
                            id: '5aa517d30ebd980e2e52a250',
                            updateSet: {
                                title: 'UPDATE'
                            }
                        }
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model NoValidation"}');
            }
        });

        it('catch delete NoValidation', async () => {
            try {
                let resRights = await request({
                    method: 'POST',
                    uri: 'http://localhost:8086/delete/NoValidation',
                    body: {
                        params: {
                            id: '5aa517d30ebd980e2e52a250'
                        }
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model NoValidation"}');
            }
        });
        
        it('catch no validation schema', async () => {
            try {
                await request({
                    method: 'POST',
                    uri: 'http://localhost:8086/schema/NoValidation',
                    body: {
                        params: {
                            type: 'read'
                        }
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model NoValidation"}');
            }
        });

        after(() => {
            server.stop();
        });
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
        });
    });

    describe('', () => {
        before(async () => {
            await server.start({
                binding: 'localhost',
                port: 8086,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true,
                authentication: (req) => {
                    return false;
                }
            });
        });

        it('send unauthorized', async () => {
            try {
                await request({
                    method: 'POST',
                    uri: 'http://localhost:8086/read/Right',
                    body: {
                        params: {}
                    },
                    json: true
                });
                assert.fail('no error thrown');
            } catch (err) {
                assert.equal(err.message, '403 - undefined');
            }
        });

        after(() => {
            server.stop();
        });
    });

    describe('Model CRUD check', () => {
        before(async () => {
            rights = [];
            groups = [];
            users = [];

            await server.start({
                binding: 'localhost',
                port: 8086,
                mongoUrl: 'mongodb://localhost:27017/',
                mongoDatabase: 'test_molly',
                clear: true,
                authentication: (req) => {
                    return true;
                }
            });
        });

        after(() => {
            server.stop();
        });

        it('create rights', async () => {
            let rightData = [
                {
                    key: 'CAN_DO_SOMETHING',
                    active: true
                },
                {
                    key: 'CAN_DO_ANOTHER',
                    active: true
                },
                {
                    key: 'CAN_DO_ALL',
                    active: true
                },
                {
                    key: 'CAN_LOGIN',
                    active: true
                },
                {
                    key: 'CAN_REQUEST_USER',
                    active: true
                }
            ];
            for (let i = 0; i < rightData.length; i++) {
                let rs = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/create/Right`,
                    body: {
                        params: rightData[i]
                    },
                    json: true
                });
                assert.isNull(rs.errors);
                assert.isNotNull(rs.data);
                assert.isObject(rs.data);
                rights.push(rs.data);
            }
        });

        it('create groups', async () => {
            let groupData = [
                {
                    name: 'Administrator',
                    rights: rights.map((e) => e._id)
                },
                {
                    name: 'User',
                    rights: rights
                        .filter((e) => e.key === 'CAN_DO_SOMETHING' || e.key === 'CAN_DO_ANOTHER')
                        .map((e) => e._id)
                },
                {
                    name: 'Reporter',
                    rights: rights
                        .filter((e) => e.key === 'CAN_LOGIN')
                        .map((e) => e._id)
                }
            ];
            for(let i = 0; i < groupData.length; i++) {
                let rs = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/create/Group`,
                    body: {
                        params: groupData[i]
                    },
                    json: true
                });
                assert.isNull(rs.errors, 'errors is not null');
                assert.isNotNull(rs.data, 'data is null');
                assert.isObject(rs.data);
                groups.push(rs.data);
            }
        });

        it('create users', async () => {
            let userData = [
                {
                    username: 'Admin',
                    password: '12345678',
                    email: 'admin@support.de',
                    group: groups
                        .filter((e) => e.name === 'Administrator')
                        .map((e) => e._id)[0]
                },
                {
                    username: 'User',
                    password: '12345678',
                    email: 'user@support.de',
                    group: groups
                        .filter((e) => e.name === 'User')
                        .map((e) => e._id)[0]
                },
                {
                    username: 'Reporter',
                    password: '12345678',
                    email: 'reporter@support.de',
                    group: groups
                        .filter((e) => e.name === 'Reporter')
                        .map((e) => e._id)[0]
                }
            ];
            for (let i = 0; i < userData.length; i++) {
                let rs = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/create/User`,
                    body: {
                        params: userData[i]
                    },
                    json: true
                });
                assert.isNull(rs.errors);
                assert.isNotNull(rs.data);
                assert.isObject(rs.data);
                users.push(rs.data);
            }
        });

        it('read user', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {}
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 3, 'invalid users count');
            assert.isDefined(resUsers.data[0].group, 'relation one to one not work');
            assert.isDefined(resUsers.data[0].group.name, 'name is not defined');
            assert.isArray(resUsers.data[0].group.rights, 'relation one to many not work');
        });

        it('read user no compression', async () => {
            await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                headers: {
                    'x-no-compression': 'true'
                },
                body: {
                    params: {}
                },
                json: true
            });
        });

        it('update user email', async () => {
            let res = await request({
                method: 'POST',
                uri: 'http://localhost:8086/update/User',
                body: {
                    params: {
                        id: users[0]._id,
                        updateSet: {
                            email: 'neue@email.de'
                        }
                    }
                },
                json: true
            });
            assert.isNull(res.errors, 'errors is not null');
            assert.equal(res.data, true, 'update maybe not work');
            let user = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: users[0]._id
                    }
                },
                json: true
            });
            assert.isNull(user.errors, 'errors is not null');
            assert.isArray(user.data, 'user data are not an array');
            assert.equal(user.data.length, 1, 'user not found');
            assert.equal(user.data[0].email, 'neue@email.de', 'update not write in database');
        });

        it('read with restrictions', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        RESTRICTIONS: {
                            skip: 1,
                            limit: 2,
                            sort: {
                                username: -1
                            }
                        }
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 2, 'invalid users count');
            assert.equal(resUsers.data[0].username, 'Reporter', 'wrong dataset');
        });

        it('replace ids in arrays', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: {
                            $in: users.map((e) => e._id)
                        }
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 3, 'invalid users count');
        });

        it('replace ids in $or', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        $or: [
                            {_id: users[0]._id},
                            {_id: users[1]._id}
                        ]
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 2, 'invalid users count');
            assert.equal(resUsers.data[0]._id, users[0]._id, 'invalid data in result');
            assert.equal(resUsers.data[1]._id, users[1]._id, 'invalid data in result');
        });

        it('replace ids in $and', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        $and: [
                            {_id: users[0]._id}
                        ]
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 1, 'invalid users count');
            assert.equal(resUsers.data[0]._id, users[0]._id, 'invalid data in result');
        });

        it('replace ids in $ne', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: {$ne: users[0]._id}
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 2, 'invalid users count');
            assert.equal(resUsers.data[0]._id, users[1]._id, 'invalid data in result');
            assert.equal(resUsers.data[1]._id, users[2]._id, 'invalid data in result');
        });

        it('replace ids in $ne', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: {$eq: users[0]._id}
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 1, 'invalid users count');
            assert.equal(resUsers.data[0]._id, users[0]._id, 'invalid data in result');
        });

        it('replace ids in $in', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: {$in: [users[0]._id, users[2]._id]}
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 2, 'invalid users count');
            assert.equal(resUsers.data[0]._id, users[0]._id, 'invalid data in result');
            assert.equal(resUsers.data[1]._id, users[2]._id, 'invalid data in result');
        });

        it('filter result', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {},
                    props: {
                        _id: true
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 3, 'invalid users count');
            for (let i = 0; i < resUsers.data.length; i++) {
                let test = resUsers.data[i];
                assert.isDefined(test._id, `_id not found in ${test}`);
                assert.isUndefined(test.username, `username found in ${test}`);
                assert.isUndefined(test.email, `email found in ${test}`);
                assert.isUndefined(test.password, `password found in ${test}`);
                assert.isUndefined(test.group, `group found in ${test}`);
            }
        });

        it('filter result recursive', async () => {
            let resUsers = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {},
                    props: {
                        _id: true,
                        group: {
                            _id: true
                        }
                    }
                },
                json: true
            });
            assert.isNull(resUsers.errors, 'errors is not null');
            assert.isArray(resUsers.data, 'user data are not an array');
            assert.equal(resUsers.data.length, 3, 'invalid users count');
            for (let i = 0; i < resUsers.data.length; i++) {
                let test = resUsers.data[i];
                assert.isDefined(test._id, `_id not found in ${JSON.stringify(test)}`);
                assert.isUndefined(test.username, `username found in ${JSON.stringify(test)}`);
                assert.isUndefined(test.email, `email found in ${JSON.stringify(test)}`);
                assert.isUndefined(test.password, `password found in ${JSON.stringify(test)}`);
                assert.isDefined(test.group, `group not found in ${JSON.stringify(test)}`);
                assert.isDefined(test.group._id, `group._id not found in ${JSON.stringify(test)}`);
                assert.isUndefined(test.group.name, `group.name found in ${JSON.stringify(test)}`);
                assert.isUndefined(test.group.rights, `group.rights found in ${JSON.stringify(test)}`);
            }
        });

        it('delete user', async () => {
            let res = await request({
                method: 'POST',
                uri: 'http://localhost:8086/delete/User',
                body: {
                    params: {
                        id: users[0]._id
                    }
                },
                json: true
            });
            assert.isNull(res.errors, 'errors is not null');
            assert.equal(res.data, true, 'delete maybe not work');
            let user = await request({
                method: 'POST',
                uri: 'http://localhost:8086/read/User',
                body: {
                    params: {
                        _id: users[0]._id
                    }
                },
                json: true
            });
            assert.isNull(user.errors, 'errors is not null');
            assert.isArray(user.data, 'user data are not an array');
            assert.equal(user.data.length, 0, 'user already exists');
        });

        it('register some operation', () => {
            class Ops {
                @operation({})
                async countUser(inv: IRouteInvoker) {
                    let user = await inv.read('User', {});
                    return user.length;
                }

                @operation({})
                async passParameter(inv: IRouteInvoker, params: any) {
                    return params;
                }
            }
        });

        it('operation without parameter', async () => {
            let rs = await request({
                method: 'POST',
                uri: `http://localhost:8086/operation/countUser`,
                body: {
                    params: {}
                },
                json: true
            });
            assert.isNull(rs.errors);
            assert.equal(rs.data, 2);
        });

        it('operation with parameter', async () => {
            let rs = await request({
                method: 'POST',
                uri: `http://localhost:8086/operation/passParameter`,
                body: {
                    params: 'parameter'
                },
                json: true
            });
            assert.isNull(rs.errors);
            assert.equal(rs.data, 'parameter');
        });

        it('catch operation not found', async () => {
            try {
                let rs = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/operation/nothing`,
                    body: {
                        params: 'parameter'
                    },
                    json: true
                });
                assert.fail('error not thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"operation not found nothing"}');
            }
        });

        it('catch invalid body', async () => {
            try {
                let rs = await request({
                    method: 'POST',
                    uri: `http://localhost:8086/read/User`,
                    body: {},
                    json: true
                });
                assert.fail('error not thrown');
            } catch (err) {
                assert.equal(err.message, '500 - {"data":null,"errors":"invalid request body [object Object]"}');
            }
        });
    });
});
