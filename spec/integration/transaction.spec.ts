import {assert} from 'chai';
import 'mocha';
import {ExpressServer, IRequestModel} from '../../src';
import {MONGODB_DB, MONGODB_URL} from '../config';
import {Reader} from '../models/reader';
import {Book} from '../models/book';

const request = require('request-promise');

/**
 * Attention when we do Transactions in parallel maybe the Transaction Lock wait time is not enough
 * when this wait time is exceed than the Transaction was aborted and this Test can fail.
 *
 * a Time of 200ms is enough for this Test
 */

describe('transaction tests', () => {
    let server = new ExpressServer();

    beforeEach(async () => {
        await server.start({
            binding: 'localhost',
            port: 8086,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            clear: true,
            models: [Reader, Book]
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
        let ru = null;
        try {
            ru = await request({
                method: 'POST',
                uri: 'http://localhost:8086/transaction',
                body: {
                    params: [
                        <IRequestModel>{
                            Action: 'create',
                            Model: 'Reader',
                            Parameter: <Reader>{
                                name: 'udo',
                                age: 40
                            },
                            Properties: null
                        },
                        <IRequestModel>{
                            Action: 'create',
                            Model: 'Reader',
                            Parameter: <Reader>{
                                name: 'peter',
                                age: 200
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
            uri: 'http://localhost:8086/read/Reader',
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

    it('check error on update', async () => {
        try {
            await request({
                method: 'POST',
                uri: 'http://localhost:8086/transaction',
                body: {
                    params: [
                        <IRequestModel>{
                            Action: 'update',
                            Model: 'Reader',
                            Parameter: {},
                            Properties: null
                        }
                    ]
                },
                json: true,
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"error on transaction child \\"id\\" fails because [\\"id\\" is required]"}');
        }
    });

    it('check error on delete', async () => {
        try {
            await request({
                method: 'POST',
                uri: 'http://localhost:8086/transaction',
                body: {
                    params: [
                        <IRequestModel>{
                            Action: 'delete',
                            Model: 'Reader',
                            Parameter: {},
                            Properties: null
                        }
                    ]
                },
                json: true,
            });
        } catch (err) {
            assert.equal(err.message, '500 - {"data":null,"errors":"error on transaction child \\"id\\" fails because [\\"id\\" is required]"}');
        }
    });

    it('throw error when parameter no array', async () => {
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

    it('mixing create update and delete in one transaction', async () => {
        const BooksToInsert = [
            <Book>{
                isbn: '12345',
                title: 'Buch1'
            },
            <Book>{
                isbn: '123456',
                title: 'Buch2'
            }
        ];
        const insertBooks = [];

        for (let i = 0; i < BooksToInsert.length; i++) {
            insertBooks.push(await request({
                method: 'POST',
                uri: 'http://localhost:8086/create/Book',
                body: {
                    params: BooksToInsert[i]
                },
                json: true,
            }));
            assert.isNull(insertBooks[i].errors);
            assert.isObject(insertBooks[i].data);
        }

        const transactionResult = await request({
            method: 'POST',
            uri: 'http://localhost:8086/transaction',
            body: {
                params: [
                    <IRequestModel>{
                        Action: 'delete',
                        Model: 'Book',
                        Parameter: {
                            id: insertBooks[0].data._id,
                        },
                        Properties: null
                    },
                    <IRequestModel>{
                        Action: 'update',
                        Model: 'Book',
                        Parameter: {
                            id: insertBooks[1].data._id,
                            updateSet: {
                                isbn: 'update with transaction'
                            }
                        },
                        Properties: null
                    },
                ]
            },
            json: true,
        });
        assert.isNull(transactionResult.errors);
        assert.isBoolean(transactionResult.data);
        assert.equal(transactionResult.data, true);

        const assertResult = await request({
            method: 'POST',
            uri: 'http://localhost:8086/read/Book',
            body: {
                params: {
                    _id: {
                        $in: [
                            insertBooks[0].data._id,
                            insertBooks[1].data._id
                        ]
                    }
                }
            },
            json: true
        });

        assert.isNull(assertResult.errors);
        assert.isArray(assertResult.data);
        assert.equal(assertResult.data.length, 1);
        assert.equal(assertResult.data[0].isbn, 'update with transaction');
    });
});
