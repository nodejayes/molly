import {ExpressServer}                        from '../../../src';
import {assert}                               from 'chai';
import 'mocha'
import {MONGODB_DB, MONGODB_URL, REPLICA_SET} from '../../config';

const request = require('request-promise');

describe('Server Spec', () => {
  let server = new ExpressServer();

  it('start server', async () => {
    let msg = await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true
    });
    assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
  });

  it('_filterRequest wrong method', async () => {
    let rs = null;
    try {
      rs = await request({
        method: 'GET',
        uri: 'http://localhost:8086/read/user',
        body: {params: {}},
        json: true
      });
      assert.fail('GET request is good');
    } catch (err) {
      assert.equal(err.message, '405 - {"data":null,"errors":"not supported method GET"}', 'error not returned');
    }
  });

  it('catch invalid route', async () => {
    let rs = null;
    try {
      rs = await request({
        method: 'POST',
        uri: 'http://localhost:8086/nothing/user',
        body: {params: {}},
        json: true
      });
    } catch (err) {
      assert.equal(err.message, '500 - {"data":null,"errors":"invalid route /nothing/user"}', 'error not returned');
    }
  });

  it('catch invalid model', async () => {
    let rs = null;
    try {
      rs = await request({
        method: 'POST',
        uri: 'http://localhost:8086/read/notexist',
        body: {params: {}},
        json: true
      });
    } catch (err) {
      assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
    }

    try {
      rs = await request({
        method: 'POST',
        uri: 'http://localhost:8086/create/notexist',
        body: {params: {}},
        json: true
      });
    } catch (err) {
      assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
    }

    try {
      rs = await request({
        method: 'POST',
        uri: 'http://localhost:8086/update/notexist',
        body: {params: {}},
        json: true
      });
    } catch (err) {
      assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
    }

    try {
      rs = await request({
        method: 'POST',
        uri: 'http://localhost:8086/delete/notexist',
        body: {params: {}},
        json: true
      });
    } catch (err) {
      assert.equal(err.message, '500 - {"data":null,"errors":"no validation found for model notexist"}', 'error not returned');
    }
  });

  it('stop server', async () => {
    await server.stop();
  });
});
