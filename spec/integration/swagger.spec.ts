import {
    ExpressServer,
    collection, validation, operation,
    BaseTypes,
    MongoLookup,
    JoinType,
    IRouteInvoker
} from './../../src/index';
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';
import {assert} from 'chai';
import 'mocha';

const generatedFile = join(__dirname, '..', '..', 'src', 'serve', 'api.yml');

describe('Swagger Generator Spec', () => {
    let server = null;
    let req = require('request-promise');
    
    before(() => {
        server = new ExpressServer();
        server.clearConfiguration();

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
            @validation({type: BaseTypes.stringDefaultLength})
            password: string;
            @validation({type: BaseTypes.email})
            email: string;
            group: Group;
        }
    
        class Ops {
            @operation
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
            caFile: join(__dirname, '..', 'assets', 'ca-crt.pem')
        });
        assert.equal(msg, 'server listen on https://localhost:8086/');
        server.stop();
    });
});