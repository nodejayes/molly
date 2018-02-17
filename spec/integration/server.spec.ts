import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha';
import { MollyConfiguration } from '../../src/models/configuration/molly_configuration';

const request = require('sync-request');

describe('Molly Server Spec', () => {
    let server = new Molly.Serve.ExpressServer();
    let customString = Molly.Definitions.BaseTypes.custom.string();
    let mongoDbObjectId = Molly.Definitions.BaseTypes.mongoDbObjectId;
    let array = Molly.Definitions.BaseTypes.custom.array();
    let bool = Molly.Definitions.BaseTypes.bool;
    let type = Molly.Definitions.BaseTypes.type;
    let rights = [];

    it('setup user schema', () => {
        let user = new Molly.Models.Configuration.CollectionInformation('user', [
            new Molly.Models.Configuration.MongoLookup('group', 'groupId', '_id', Molly.JoinType.ONEONE),
            new Molly.Models.Configuration.MongoLookup('right', 'group.rights', 'group.rights', Molly.JoinType.ONEMANY)
        ], async (col) => {
            await col.createIndex({
                username: 1,
            }, {
                sparse: true,
                unique: true,
                background: true,
            });
        });
        let group = new Molly.Models.Configuration.CollectionInformation('group', [
            new Molly.Models.Configuration.MongoLookup('right', 'rights', 'rights', Molly.JoinType.ONEMANY)
        ], async (col) => {
            await col.createIndex({
                name: 1,
            }, {
                sparse: true,
                unique: true,
                background: true,
            });
        });
        let right = new Molly.Models.Configuration.CollectionInformation('right', null, async (col) => {
            await col.createIndex({
                key: 1,
            }, {
                sparse: true,
                unique: true,
                background: true,
            });
        });

        let rightCreateSchema = array.items(type({
            key: customString.max(255).required(),
            active: bool.default(true)
        }));
        let rightReadSchema = type({
            _id: mongoDbObjectId.required(),
            key: customString.max(255).required(),
            active: bool.required()
        });
        let rightUpdateSchema = type({
            id: mongoDbObjectId,
            updateSet: type({
                active: bool.optional()
            })
        });
        let rightDeleteSchema = type({
            id: mongoDbObjectId
        });

        let groupCreateSchema = array.items(type({
            name: customString.max(255).required(),
            rights: array.items(mongoDbObjectId)
        }));
        let groupReadSchema = type({
            _id: mongoDbObjectId.required(),
            name: customString.max(255).required(),
            rights: array.items(rightReadSchema)
        });
        let groupUpdateSchema = type({
            id: mongoDbObjectId.required(),
            updateSet: type({
                name: customString.max(255).optional(),
                rights: array.items(mongoDbObjectId.required()).optional()
            })
        });
        let groupDeleteSchema = type({
            id: mongoDbObjectId.required()
        });

        let userCreateSchema = array.items(type({
            username: customString.max(255).required(),
            password: customString.min(8).required(),
            email: customString.max(255).allow(null).default(null),
            groupId: mongoDbObjectId.required()
        }));
        let userReadSchema = type({
            _id: mongoDbObjectId.required(),
            username: customString.max(255).required(),
            email: customString.max(255).allow(null).default(null),
            group: groupReadSchema
        });
        let userUpdateSchema = type({
            id: mongoDbObjectId.required(),
            updateSet: type({
                username: customString.max(255).optional(),
                password: customString.min(8).optional(),
                email: customString.max(255).allow(null).optional(),
                groupId: mongoDbObjectId.optional()
            }).required()
        });
        let userDeleteSchema = type({
            id: mongoDbObjectId.required()
        });

        let userV = new Molly.Models.Configuration.ValidationInformation(
            'user', userCreateSchema, userReadSchema, userUpdateSchema, userDeleteSchema
        );
        let groupV = new Molly.Models.Configuration.ValidationInformation(
            'group', groupCreateSchema, groupReadSchema, groupUpdateSchema, groupDeleteSchema
        );
        let rightV = new Molly.Models.Configuration.ValidationInformation(
            'right', rightCreateSchema, rightReadSchema, rightUpdateSchema, rightDeleteSchema
        );

        Molly.Logic.Configuration.validationInfos.push(userV);
        Molly.Logic.Configuration.validationInfos.push(groupV);
        Molly.Logic.Configuration.validationInfos.push(rightV);

        Molly.Logic.Configuration.collectionInfos.push(user);
        Molly.Logic.Configuration.collectionInfos.push(group);
        Molly.Logic.Configuration.collectionInfos.push(right);
        
        assert.equal(Molly.Logic.Configuration.validationInfos.length, 3, 'not enough validations');
        assert.equal(Molly.Logic.Configuration.collectionInfos.length, 3, 'not enough collections');
    });

    it('start server', async () => {
        let msg = await server.start('localhost', 8086, 'mongodb://localhost:27017/', 'test_molly');
        assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
    });

    it('create rights', async () => {
        let rightData = [
            {
                key: 'CAN_DO_SOMETHING',
                active: true
            },
            {
                key: 'CAN_DO_ANOTHER',
                active: true
            },
            {
                key: 'CAN_DO_ALL',
                active: true
            },
            {
                key: 'CAN_LOGIN',
                active: true
            },
            {
                key: 'CAN_REQUEST_USER',
                active: true
            }
        ];
        let rs = request('POST', `http://localhost:8086/create/right`, {
            json: {
                params: rightData
            }
        });
        assert.isNull(rs.error, rs.error);
        assert.isNotNull(rs.data, 'data is null');
        assert.isArray(rs.data, 'data must be an array');
        assert.equal(rs.data.length, 5, 'invalid count');
        rights = rs.data;
    });

    it('create groups', async () => {

    });

    it('create users', async () => {

    });

    it('stop server', () => {
        server.stop();
    });
});