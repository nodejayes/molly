import {ExpressServer}                        from '../../src';
import {assert}                               from 'chai';
import 'mocha';
import {MONGODB_DB, MONGODB_URL, REPLICA_SET} from '../config';
import {ReadOnly}                             from '../models/readonly';
import {Demo}                                 from '../models/demo';

const req = require('request-promise');

describe('schema Spec', () => {
  let server = new ExpressServer();

  before(async () => {
    await server.start({
      binding: 'localhost',
      port: 8086,
      mongoUrl: MONGODB_URL,
      mongoDatabase: MONGODB_DB,
      mongoReplicaSet: REPLICA_SET,
      clear: true,
      models: [Demo, ReadOnly]
    });
  });

  after(async () => {
    await server.stop();
  });

  it('get create Schema', async () => {
    let schema = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/Demo',
      body: {
        params: {
          type: 'create'
        }
      },
      json: true
    });
    assert.deepEqual(schema.data.properties._id, {
      "anyOf": [
        {
          "enum": [
            null
          ],
          "type": "string"
        },
        {
          "maxLength": 24,
          "minLength": 24,
          "type": "string"
        }
      ]
    });
    assert.deepEqual(schema.data.properties.createdAt.format, "date-time");
    assert.deepEqual(schema.data.properties.createdAt.type, "string");
    assert.deepEqual(schema.data.properties.id, {
      "maximum": 2147483647,
      "minimum": 1,
      "type": "integer"
    });
    assert.deepEqual(schema.data.properties.name, {
      "type": "string"
    });
    assert.deepEqual(schema.data.properties.version, {
      "default": 0,
      "exclusiveMinimum": true,
      "maximum": 2147483647,
      "minimum": -1,
      "type": "integer"
    });
  });

  it('get read Schema', async () => {
    let schema = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/Demo',
      body: {
        params: {
          type: 'read'
        }
      },
      json: true
    });
    assert.deepEqual(schema.data, {
      "additionalProperties": false,
      "patterns": [],
      "properties": {
        "_id": {
          "anyOf": [
            {
              "enum": [
                null
              ],
              "type": "string"
            },
            {
              "maxLength": 24,
              "minLength": 24,
              "type": "string"
            }
          ]
        },
        "createdAt": {
          "format": "date-time",
          "type": "string"
        },
        "id": {
          "maximum": 2147483647,
          "minimum": 1,
          "type": "integer"
        },
        "modifiedAt": {
          "anyOf": [
            {
              "enum": [
                null
              ],
              "type": "date"
            },
            {
              "format": "date-time",
              "type": "string"
            }
          ]
        },
        "name": {
          "type": "string"
        },
        "version": {
          "exclusiveMinimum": true,
          "maximum": 2147483647,
          "minimum": -1,
          "type": "integer"
        }
      },
      "type": "object"
    });
  });

  it('get update Schema', async () => {
    let schema = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/Demo',
      body: {
        params: {
          type: 'update'
        }
      },
      json: true
    });
    assert.deepEqual(schema.data.properties.id, {
      "maxLength": 24,
      "minLength": 24,
      "type": "string"
    });
    assert.deepEqual(schema.data.properties.updateSet.properties.id, {
      "maximum": 2147483647,
      "minimum": 1,
      "type": "integer"
    });
    assert.deepEqual(schema.data.properties.updateSet.properties.modifiedAt.format, "date-time");
    assert.deepEqual(schema.data.properties.updateSet.properties.modifiedAt.type, "string");
    assert.deepEqual(schema.data.properties.updateSet.properties.name, {
      "type": "string"
    });
    assert.deepEqual(schema.data.properties.updateSet.properties.version, {
      "exclusiveMinimum": true,
      "maximum": 2147483647,
      "minimum": -1,
      "type": "integer"
    });
  });

  it('get delete Schema', async () => {
    let schema = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/Demo',
      body: {
        params: {
          type: 'delete'
        }
      },
      json: true
    });
    assert.deepEqual(schema.data, {
      "additionalProperties": false,
      "patterns": [],
      "properties": {
        "id": {
          "maxLength": 24,
          "minLength": 24,
          "type": "string"
        }
      },
      "required": [
        "id"
      ],
      "type": "object"
    });
  });

  it('catch create readonly', async () => {
    let msg = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/ReadOnly',
      body: {
        params: {
          type: 'create'
        }
      },
      json: true
    });
    assert.isNull(msg.errors);
    assert.isNull(msg.data);
  });

  it('catch update readonly', async () => {
    let msg = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/ReadOnly',
      body: {
        params: {
          type: 'update'
        }
      },
      json: true
    });
    assert.isNull(msg.errors);
    assert.isNull(msg.data);
  });

  it('catch delete readonly', async () => {
    let msg = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/ReadOnly',
      body: {
        params: {
          type: 'delete'
        }
      },
      json: true
    });
    assert.isNull(msg.errors);
    assert.isNull(msg.data);
  });

  it('catch invalid type', async () => {
    let msg = await req({
      method: 'POST',
      uri: 'http://localhost:8086/schema/Demo',
      body: {
        params: {
          type: 'unknow'
        }
      },
      json: true
    });
    assert.isNull(msg.data);
    assert.equal(msg.errors, 'schematype unknow not found');
  });
});
