import {
    BaseTypes,
    collection,
    ExpressServer,
    IRouteInvoker,
    JoinType,
    MongoLookup,
    operation,
    validation
} from '../../src';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {assert} from 'chai';
import 'mocha';
import {MONGODB_DB, MONGODB_URL} from '../config';

const EMPTY_PKG_FOLDER = join(__dirname, '..', 'assets');
const EMPTY_PKG = join(EMPTY_PKG_FOLDER, 'package.json');

describe('Swagger Generator Spec', () => {
    let server = null;
    let req = require('request-promise');

    before(() => {
        server = new ExpressServer();

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
            index: () => {
            },
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
            index: () => {
            },
            lookup: [
                new MongoLookup('Group', 'group', '_id', JoinType.ONEONE)
            ],
            createSummary: 'create a User',
            createDescription: 'Creates a new User in Collection.',
            readSummary: 'get Users',
            readDescription: 'Select Users from Collection.',
            updateSummary: 'update a User',
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
                let userList = await inv.read('User', {params: {}});
                return userList.length;
            }
        }
    });

    after(async () => {
        await server.stop();
    });

    it('generate File', async () => {
        await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB
        });
        let rs = await req('http://localhost:8087/');
        assert.equal(rs.indexOf('<title>Swagger UI</title>') > -1, true);
        await server.stop();
    });

    it('use https', async () => {
        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        await server.stop();
    });

    it('load empty package', async () => {
        writeFileSync(EMPTY_PKG, JSON.stringify({}));

        let msg = await server.start({
            binding: 'localhost',
            port: 8086,
            documentationPort: 8087,
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
            packageFolder: EMPTY_PKG_FOLDER
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        await server.stop();
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
            mongoUrl: MONGODB_URL,
            mongoDatabase: MONGODB_DB,
            certFile: join(__dirname, '..', 'assets', 'server-crt.pem'),
            keyFile: join(__dirname, '..', 'assets', 'server-key.pem'),
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem'),
            packageFolder: EMPTY_PKG_FOLDER
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        await server.stop();
    });
});
