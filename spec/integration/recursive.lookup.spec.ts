import {ExpressServer} from '../../src';
import 'mocha';
import {assert} from 'chai';
import {MONGODB_DB, MONGODB_URL} from '../config';
import {User1, User2} from '../models/user';
import {Bank1, Bank2} from '../models/bank';

const request = require('request-promise');

describe('recursive lookups', () => {
    let server = new ExpressServer();

    afterEach(async () => {
        await server.stop();
    });

    it('can declare recursive lookup with one one', async () => {
        let banks = [];
        let users = [];

        await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            clear: true,
            models: [Bank1, User1]
        });

        let rb = await request({
            method: 'POST',
            uri: 'http://localhost:8086/create/Bank1',
            body: {
                params: <Bank1>{
                    name: 'Commerzbank',
                    user: null,
                }
            },
            json: true,
        });
        assert.isNull(rb.errors);
        assert.isNotNull(rb.data);
        assert.isObject(rb.data);
        banks.push(rb.data);

        let ru = await request({
            method: 'POST',
            uri: 'http://localhost:8086/create/User1',
            body: {
                params: <User1>{
                    name: 'udo',
                    age: 50,
                    bank: banks[0]._id
                }
            },
            json: true,
        });
        assert.isNull(ru.errors);
        assert.isNotNull(ru.data);
        assert.isObject(ru.data);
        users.push(ru.data);

        let addUserToBank = await request({
            method: 'POST',
            uri: 'http://localhost:8086/update/Bank1',
            body: {
                params: {
                    id: banks[0]._id,
                    updateSet: {
                        user: users[0]._id
                    }
                }
            },
            json: true,
        });
        assert.isNull(addUserToBank.errors);
        assert.isNotNull(addUserToBank.data);
        assert.equal(addUserToBank.data, true);

        let myBank = await request({
            method: 'POST',
            uri: 'http://localhost:8086/read/Bank1',
            body: {
                params: {}
            },
            json: true,
        });
        assert.isNull(myBank.errors);
        assert.isNotNull(myBank.data);
        assert.isObject(myBank.data[0].user);
        assert.isString(myBank.data[0].user.bank);

        let myUser = await request({
            method: 'POST',
            uri: 'http://localhost:8086/read/User1',
            body: {
                params: {}
            },
            json: true,
        });
        assert.isNull(myUser.errors);
        assert.isNotNull(myUser.data);
        assert.isObject(myUser.data[0].bank);
        assert.isString(myUser.data[0].bank.user);
    });

    it('can declare recursive lookup with one many', async () => {
        let banks = [];
        let users = [];

        await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            clear: true,
            models: [Bank2, User2]
        });

        let rb = await request({
            method: 'POST',
            uri: 'http://localhost:8086/create/Bank2',
            body: {
                params: <Bank2>{
                    name: 'Commerzbank',
                    users: [],
                }
            },
            json: true,
        });
        assert.isNull(rb.errors);
        assert.isNotNull(rb.data);
        assert.isObject(rb.data);
        banks.push(rb.data);

        let ru = await request({
            method: 'POST',
            uri: 'http://localhost:8086/create/User2',
            body: {
                params: <User2>{
                    name: 'udo',
                    age: 50,
                    bank: banks[0]._id
                }
            },
            json: true,
        });
        assert.isNull(ru.errors);
        assert.isNotNull(ru.data);
        assert.isObject(ru.data);
        users.push(ru.data);

        ru = await request({
            method: 'POST',
            uri: 'http://localhost:8086/create/User2',
            body: {
                params: <User2>{
                    name: 'peter',
                    age: 30,
                    bank: banks[0]._id
                }
            },
            json: true,
        });
        assert.isNull(ru.errors);
        assert.isNotNull(ru.data);
        assert.isObject(ru.data);
        users.push(ru.data);

        let addUserToBank = await request({
            method: 'POST',
            uri: 'http://localhost:8086/update/Bank2',
            body: {
                params: {
                    id: banks[0]._id,
                    updateSet: {
                        users: [
                            users[0]._id,
                            users[1]._id,
                        ]
                    }
                }
            },
            json: true,
        });
        assert.isNull(addUserToBank.errors);
        assert.isNotNull(addUserToBank.data);
        assert.equal(addUserToBank.data, true);

        let myBank = await request({
            method: 'POST',
            uri: 'http://localhost:8086/read/Bank2',
            body: {
                params: {}
            },
            json: true,
        });
        assert.isNull(myBank.errors);
        assert.isNotNull(myBank.data);
        assert.isArray(myBank.data[0].users);
        assert.equal(myBank.data[0].users.length, 2);
        for (let i = 0; i < myBank.data[0].users.length; i++) {
            assert.isString(myBank.data[0].users[i].bank);
        }

        let myUser = await request({
            method: 'POST',
            uri: 'http://localhost:8086/read/User2',
            body: {
                params: {}
            },
            json: true,
        });
        assert.isNull(myUser.errors);
        assert.isNotNull(myUser.data);
        assert.isObject(myUser.data[0].bank);
        assert.isArray(myUser.data[0].bank.users);
        assert.equal(myUser.data[0].bank.users.length, 2);
        for (let i = 0; i < myUser.data[0].bank.users.length; i++) {
            assert.isString(myUser.data[0].bank.users[i]);
        }
    });
});
