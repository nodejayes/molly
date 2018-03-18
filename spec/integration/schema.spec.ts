import {
    ExpressServer,
    BaseTypes,
    IRouteInvoker,
    JoinType,
    MongoLookup,
    collection, operation, validation
} from './../../src/index';
import {assert} from 'chai';
import 'mocha';

const req = require('request-promise');

let server = new ExpressServer();

@collection({
    allow: 'CUD',
    index: () => {},
    lookup: []
})
class Demo {
    @validation({type: BaseTypes.postgresDbId})
    id: number;
    @validation({type: BaseTypes.string})
    name: string;
}

describe('schema Spec', () => {
    before(async () => {
        await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: 'mongodb://localhost:27017/',
            mongoDatabase: 'test_molly',
            clear: true
        });
    });

    after(() => {
        server.stop();
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
        assert.deepEqual(schema.data, {
            items: {
                additionalProperties: false,
                patterns: [],
                properties: {
                    id: {
                        maximum: 2147483647,
                        minimum: 1,
                        type: 'integer'
                    },
                    name: {
                        type: 'string'
                    }
                },
                type: 'object'
            },
            type: 'array'
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
            additionalProperties: false,
            patterns: [],
            properties: {
                id: {
                    maximum: 2147483647,
                    minimum: 1,
                    type: 'integer'
                },
                name: {
                    type: 'string'
                }
            },
            type: 'object'
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
        assert.deepEqual(schema.data, {
            additionalProperties: false,
            patterns: [],
            properties: {
                id: {
                    enum: [null],
                    type: [
                        'array',
                        'boolean',
                        'number',
                        'object',
                        'string',
                        'null'
                    ]
                },
                updateSet: {
                    additionalProperties: false,
                    patterns: [],
                    properties: {
                        id: {
                            maximum: 2147483647,
                            minimum: 1,
                            type: 'integer'
                        },
                        name: {
                            type: 'string'
                        }
                    },
                    type: 'object'
                }
            },
            type: 'object'
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
            additionalProperties: false,
            patterns: [],
            properties: {
                id: {
                    enum: [null],
                    type: [
                        'array',
                        'boolean',
                        'number',
                        'object',
                        'string',
                        'null'
                    ]
                }
            },
            type: 'object'
        });
    });
});