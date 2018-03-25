import {
    ExpressServer,
    collection, validation,
    BaseTypes
} from '../../src';
import {assert} from 'chai';
import 'mocha';

const req = require('request-promise');

describe('extended Classes Spec', () => {
    it('create informations successfully', async () => {
        let server = new ExpressServer();

        interface IBaseProperties {
            created: Date;
            modified?: Date;
            version: number;
        }

        interface IField {
            id: number;
            fieldname: string;
        }

        interface ISampleField {
            p: number;
            k: number;
            mg: number;
            cao: number;
        }

        class BaseProperties implements IBaseProperties {
            @validation({type: BaseTypes.date})
            created: Date;
            @validation({type: BaseTypes.date.allow(null)})
            modified?: Date;
            @validation({type: BaseTypes.integer})
            version: number;
        }

        @collection({
            allow: 'CUD',
        })
        class Field extends BaseProperties implements IField {
            @validation({type: BaseTypes.mongoDbObjectId})
            _id: string;
            @validation({type: BaseTypes.postgresDbId})
            id: number;
            @validation({type: BaseTypes.string})
            fieldname: string;
        }

        @collection({
            allow: 'CUD',
        })
        class SampleField extends Field implements ISampleField {
            @validation({type: BaseTypes.mongoDbObjectId})
            _id: string;
            @validation({type: BaseTypes.double})
            p: number;
            @validation({type: BaseTypes.double})
            k: number;
            @validation({type: BaseTypes.double})
            mg: number;
            @validation({type: BaseTypes.double})
            cao: number;
        }

        await server.start({
            binding: 'localhost',
            port: 8086,
            clear: true,
            mongoUrl: 'mongodb://localhost:27017',
            mongoDatabase: 'test_molly'
        });

        let res = await req({
            method: 'POST',
            uri: 'http://localhost:8086/create/SampleField',
            body: {
                params: <SampleField>{
                    cao: 12.5,
                    k: 0.0,
                    p: 0.0,
                    mg: 0.0,
                    created: new Date(),
                    fieldname: 'Field 1',
                    version: 1,
                    id: 1
                }
            },
            json: true
        });

        assert.isNull(res.errors);
        assert.isObject(res.data);

        try {
            await req({
                method: 'POST',
                uri: 'http://localhost:8086/create/SampleField',
                body: {
                    params: {
                        cao: 12.5,
                        k: 0.0,
                        p: 0.0,
                        mg: 0.0,
                        created: 'ein text',
                        fieldname: 'Field 1',
                        version: 1,
                        id: 1
                    }
                },
                json: true
            });
            assert.fail('no error thrown');
        } catch (err) {
            assert.notEqual(err.message.indexOf('must be a number of milliseconds or valid date string'), -1);
        }

        server.stop();
    });
});