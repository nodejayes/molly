import {
    ExpressServer,
    collection, validation, operation,
    BaseTypes,
    MongoLookup,
    JoinType,
    IRouteInvoker
} from './../../src/index';
import {readFileSync, unlinkSync, writeFileSync} from 'fs';
import {join} from 'path';
import {assert} from 'chai';
import 'mocha';

const EMPTY_PKG_FOLDER = join(__dirname, '..', 'assets');
const EMPTY_PKG = join(EMPTY_PKG_FOLDER, 'package.json');

describe('Swagger Generator Spec', () => {
    let server = null;
    let req = require('request-promise');
    
    before(() => {
        server = new ExpressServer();
        server.clearConfiguration();

        @collection({
            allow: 'XXX',
        })
        class ReadOnly {
            @validation({type: BaseTypes.string})
            text: string;
        }

        @collection({
            allow: 'CXD',
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
            ],
            createSummary: 'create a Group',
            createDescription: 'Creates a new Group in Collection.',
            readSummary: 'get Groups',
            readDescription: 'Select Groups from Collection.',
            deleteSummary: 'deleta a Group',
            deleteDescription: 'Remove a Group in Collection.'
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
            ],
            createSummary: 'create a User',
            createDescription: 'Creates a new User in Collection.',
            readSummary: 'get Users',
            readDescription: 'Select Users from Collection.',
            updateSummary:'update a User',
            updateDescription: 'Update a User in Collection.',
            deleteSummary: 'deleta a User',
            deleteDescription: 'Remove a User in Collection.'
        })
        class User {
            @validation({type: BaseTypes.mongoDbObjectId})
            _id: string;
            @validation({type: BaseTypes.string.min(3)})
            username: string;
            @validation({type: BaseTypes.stringDefaultLength})
            password: string;
            @validation({type: BaseTypes.email})
            email: string;
            group: Group;
        }
    
        class Ops {
            @operation({
                Description: 'Get the Users from the User Collection and count them.',
                Summary: 'count all Users'
            })
            async countUser(inv: IRouteInvoker) {
                let userList = await inv.read('User', {params:{}});
                return userList.length;
            }
        }
    });

    after(() => {
        server.stop();
    });

    it('generate File', async () => {
        await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: 'mongodb://localhost:27017/',
            mongoDatabase: 'test_molly'
        });
        let rs = await req('http://localhost:8087/');
        assert.equal(rs.indexOf('<body id="spectacle">') > -1, true);
        server.stop();
    });

    it('use https', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: 'mongodb://localhost:27017/',
            mongoDatabase: 'test_molly',
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        server.stop();
    });

    it('load empty package', async () => {
        writeFileSync(EMPTY_PKG, JSON.stringify({}));

        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: 'mongodb://localhost:27017/',
            mongoDatabase: 'test_molly',
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
            packageFolder: EMPTY_PKG_FOLDER
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        server.stop();
    });

    it('load empty package author', async () => {
        writeFileSync(EMPTY_PKG, JSON.stringify({
            name: 'molly',
            version: '1.0.0',
            author: {
                name: 'Author'
            }
        }));
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: 'mongodb://localhost:27017/',
            mongoDatabase: 'test_molly',
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
            packageFolder: EMPTY_PKG_FOLDER
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        server.stop();
    });
});