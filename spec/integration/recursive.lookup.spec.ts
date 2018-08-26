import {BaseTypes, collection, ExpressServer, JoinType, MongoLookup, validation} from '../../src';
import 'mocha';
import {assert}                                                                  from 'chai';
import {MONGODB_URL}                                                             from '../config';

const request = require('request-promise');

describe('recursive lookups', () => {
  let server = new ExpressServer();

  beforeEach(() => {
    server.clearConfiguration();
  });

  afterEach(() => {
    server.stop();
  });

  it('can declare recursive lookup with one one', async () => {
    @collection({
      allow: 'CUD',
      lookup: [
        new MongoLookup('User1', 'user', '_id', JoinType.ONEONE)
      ]
    })
    class Bank1 {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      user: User1;
    }

    @collection({allow: 'CUD', lookup: [
        new MongoLookup('Bank1', 'bank', '_id', JoinType.ONEONE)
      ]})
    class User1 {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
      bank: Bank1;
    }

    new User1();
    new Bank1();
    let banks = [];
    let users = [];

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: 'test_molly',
      clear: true
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
    @collection({
      allow: 'CUD',
      lookup: [
        new MongoLookup('User2', 'users', '_id', JoinType.ONEMANY)
      ]
    })
    class Bank2 {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      users: User2[];
    }

    @collection({allow: 'CUD', lookup: [
        new MongoLookup('Bank2', 'bank', '_id', JoinType.ONEONE)
      ]})
    class User2 {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
      bank: Bank2;
    }

    new User2();
    new Bank2();
    let banks = [];
    let users = [];

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: 'test_molly',
      clear: true
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
