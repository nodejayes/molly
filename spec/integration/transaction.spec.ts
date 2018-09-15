import {assert}                                                          from 'chai';
import 'mocha';
import {IRequestModel, BaseTypes, ExpressServer, collection, validation} from '../../src';
import {MONGODB_DB, MONGODB_URL, REPLICA_SET}                            from '../config';

const request = require('request-promise');

/**
 * Attention when we do Transactions in parallel maybe the Transaction Lock wait time is not enough
 * when this wait time is exceed than the Transaction was aborted and this Test can fail.
 *
 * a Time of 200ms is enough for this Test
 */

@collection({allow: 'CUD'})
class Reader {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  name: string;
  @validation({type: BaseTypes.integer.positive().max(120)})
  age: number;
}
@collection({allow: 'CUD'})
class Book {
  @validation({type: BaseTypes.mongoDbObjectId})
  _id: string;
  @validation({type: BaseTypes.stringDefaultLength})
  isbn: string;
  @validation({type: BaseTypes.stringDefaultLength})
  title: string;
}

describe('transaction tests', () => {
  let server = new ExpressServer();

  beforeEach(async () => {
    server.clearConfiguration();
    new Reader();
    new Book();

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('fire a transaction', async () => {
    let ru = await request({
      method: 'POST',
      uri: 'http://localhost:8086/transaction',
      body: {
        params: [
          <IRequestModel>{
            Action: 'create',
            Model: 'Reader',
            Parameter: <Reader>{
              name: 'udo',
              age: 50
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Reader',
            Parameter: <Reader>{
              name: 'peter',
              age: 30
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Reader',
            Parameter: <Reader>{
              name: 'klaus',
              age: 18
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          }
        ]
      },
      json: true,
    });
    assert.isNull(ru.errors);
    assert.isNotNull(ru.data);
    assert.equal(ru.data, true);

    let users = await request({
      method: 'POST',
      uri: 'http://localhost:8086/read/Reader',
      body: {
        params: {}
      },
      json: true,
    });
    assert.isNull(users.errors);
    assert.isNotNull(users.data);
    assert.isArray(users.data);
    assert.equal(users.data.length, 3);

    let books = await request({
      method: 'POST',
      uri: 'http://localhost:8086/read/Book',
      body: {
        params: {}
      },
      json: true,
    });
    assert.isNull(books.errors);
    assert.isNotNull(books.data);
    assert.isArray(books.data);
    assert.equal(books.data.length, 1);
  });

  it('do not commit on error', async () => {
    /*
    @collection({allow: 'CUD'})
    class Reader {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
    }

    new Reader();

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
    */

    let ru = null;
    try {
      ru = await request({
        method: 'POST',
        uri: 'http://localhost:8086/transaction',
        body: {
          params: [
            <IRequestModel>{
              Action: 'create',
              Model: 'User',
              Parameter: <Reader>{
                name: 'udo',
                age: 40
              },
              Properties: null
            },
            <IRequestModel>{
              Action: 'create',
              Model: 'User',
              Parameter: <Reader>{
                name: 'peter',
                age: 200
              },
              Properties: null
            },
            <IRequestModel>{
              Action: 'create',
              Model: 'User',
              Parameter: <Reader>{
                name: 'klaus',
                age: 18
              },
              Properties: null
            }
          ]
        },
        json: true,
      });
    } catch (err) {
      assert.isNull(ru);
      assert.equal(err.message, '500 - {"data":null,"errors":"error on transaction child \\"age\\" fails because [\\"age\\" must be less than or equal to 120]"}');
    }

    let users = await request({
      method: 'POST',
      uri: 'http://localhost:8086/read/User',
      body: {
        params: {}
      },
      json: true,
    });
    assert.isNull(users.errors);
    assert.isNotNull(users.data);
    assert.isArray(users.data);
    assert.equal(users.data.length, 0);
  });

  it('throw error when parameter no array', async () => {
    /*
    @collection({allow: 'CUD'})
    class Reader {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
    }

    new Reader();

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
    */

    let ru = null;
    try {
      ru = await request({
        method: 'POST',
        uri: 'http://localhost:8086/transaction',
        body: {
          params: {}
        },
        json: true,
      });
    } catch (err) {
      assert.isNull(ru);
      assert.equal(err.message, '500 - {"data":null,"errors":"transaction params must be an array"}');
    }

  });

  it('do nothing on empty parameter array', async () => {
    /*
    @collection({allow: 'CUD'})
    class Reader {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      name: string;
      @validation({type: BaseTypes.integer.positive().max(120)})
      age: number;
    }

    new Reader();

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
    */

    let ru = await request({
      method: 'POST',
      uri: 'http://localhost:8086/transaction',
      body: {
        params: []
      },
      json: true,
    });
    assert.isNull(ru.errors);
  });

  it('do parallel transactions', async () => {
    /*
    @collection({allow: 'CUD'})
    class Book {
      @validation({type: BaseTypes.mongoDbObjectId})
      _id: string;
      @validation({type: BaseTypes.stringDefaultLength})
      isbn: string;
      @validation({type: BaseTypes.stringDefaultLength})
      title: string;
    }

    new Book();

    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
    */

    let req = request({
      method: 'POST',
      uri: 'http://localhost:8086/transaction',
      body: {
        params: [
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          },
          <IRequestModel>{
            Action: 'create',
            Model: 'Book',
            Parameter: <Book>{
              isbn: '1235647890',
              title: 'Ein Buchtitel'
            },
            Properties: null
          }
        ]
      },
      json: true,
    });
    let ru = await Promise.all([
      req, req, req, req, req, req, req, req, req, req,
      req, req, req, req, req, req, req, req, req, req
    ]);
    for (let i = 0; i < ru.length; i++) {
      assert.isNull(ru[i].errors);
      assert.isNotNull(ru[i].data);
      assert.equal(ru[i].data, true);
    }
  });
});
