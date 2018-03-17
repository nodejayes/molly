import {
    ExpressServer,
    collection, validation,
    BaseTypes
} from './../../src/index';
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
            index: () => {},
            lookup: []
        })
        class Field extends BaseProperties implements IField {
            @validation({type: BaseTypes.postgresDbId})
            id: number;
            @validation({type: BaseTypes.string})
            fieldname: string;
        }

        @collection({
            allow: 'CUD',
            index: () => {},
            lookup: []
        })
        class SampleField extends Field implements ISampleField {
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

        
    });
});