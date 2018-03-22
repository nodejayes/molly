import {
    ExpressServer,
    collection, validation, operation,
    BaseTypes,
    MongoLookup,
    JoinType
} from './../../src/index';
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
import {assert} from 'chai';
import 'mocha';

const generatedFile = join(__dirname, '..', '..', 'src', 'serve', 'api.yml');

let server = null;

@collection({
    allow: 'CXD',
    index: () => {},
    lookup: []
})
class Right {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id: string;
    @validation({type: BaseTypes.string})
    key: string;
    @validation({type: BaseTypes.bool})
    active: boolean;
}

@collection({
    allow: 'CUD',
    index: () => {},
    lookup: [
        new MongoLookup('Right', 'rights', '_id', JoinType.ONEMANY)
    ]
})
class Group {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id: string;
    @validation({type: BaseTypes.string})
    name: string;
    rights: Right;
}

@collection({
    allow: 'CUD',
    index: () => {},
    lookup: [
        new MongoLookup('Group', 'group', '_id', JoinType.ONEONE)
    ]
})
class User {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id: string;
    @validation({type: BaseTypes.string.min(3)})
    username: string;
    @validation({type: BaseTypes.hexadecimal})
    password: string;
    @validation({type: BaseTypes.email})
    email: string;
    group: Group;
}

describe('Swagger Generator Spec', () => {
    before(() => {
        server = new ExpressServer();
    });

    after(() => {
        server.stop();
    });

    it('generate File', async () => {
        await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: 'mongodb://192.168.99.75:6604/',
            mongoDatabase: 'test_molly',
            clear: true
        });
    });
});