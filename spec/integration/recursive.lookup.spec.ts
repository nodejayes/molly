import {BaseTypes, collection, ExpressServer, JoinType, MongoLookup, validation} from '../../src';
import 'mocha';
import {assert}                                                                  from 'chai';
import {MONGODB_URL}                                                             from '../config';

const request = require('request-promise');

describe('recursive lookups', () => {
  let server = new ExpressServer();

  before(() => {
    server.clearConfiguration();
  });

  after(() => {
    server.stop();
  });

  it('can declare recursive lookup with one one', async () => {
    let banks = [];
    let users = [];

    @collection({
      allow: 'CUD',
      lookup: [
        new MongoLookup('User', 'user', '_id', JoinType.ONEONE)
      ]
    })
    class Bank {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      user: User;
    }

    @collection({allow: 'CUD', lookup: [
      new MongoLookup('Bank', 'bank', '_id', JoinType.ONEONE)
    ]})
    class User {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
      bank: Bank;
    }

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: 'test_molly',
      clear: true
    });

    let rb = await request({
      method: 'POST',
      uri: 'http://localhost:8086/create/Bank',
      body: {
        params: [
          <Bank>{
            name: 'Commerzbank',
            user: null,
          }
        ]
      },
      json: true,
    });
    assert.isNull(rb.errors);
    assert.isNotNull(rb.data);
    assert.isObject(rb.data);
    banks.push(rb.data);

    let ru = await request({
      method: 'POST',
      uri: 'http://localhost:8086/create/User',
      body: {
        params: [
          <User>{
            name: 'udo',
            age: 50,
            bank: banks[0]._id
          }
        ]
      },
      json: true,
    });
    assert.isNull(ru.errors);
    assert.isNotNull(ru.data);
    assert.isObject(ru.data);

    let addUserToBank = await request({
      method: 'POST',
      uri: 'http://localhost:8086/update/Bank',
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
      uri: 'http://localhost:8086/read/Bank',
      body: {
        params: {}
      },
      json: true,
    });
    assert.isNull(myBank.errors);
    assert.isNotNull(myBank.data);
    assert.isObject(myBank.data[0].user);
    assert.isNull(myBank.data[0].user.bank);

    let myUser = await request({
      method: 'POST',
      uri: 'http://localhost:8086/read/User',
      body: {
        params: {}
      },
      json: true,
    });
    assert.isNull(myUser.errors);
    assert.isNotNull(myUser.data);
    assert.isObject(myUser.data[0].bank);
    assert.isNull(myUser.data[0].bank.user);
  });
});
