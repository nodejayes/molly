import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha';
import { MollyConfiguration } from '../../src/models/configuration/molly_configuration';

describe('Molly Server Spec', () => {
    let customString = Molly.Definitions.BaseTypes.custom.string();
    let mongoDbObjectId = Molly.Definitions.BaseTypes.mongoDbObjectId;
    let array = Molly.Definitions.BaseTypes.custom.array();
    let bool = Molly.Definitions.BaseTypes.bool;
    let type = Molly.Definitions.BaseTypes.type;

    it('boot Server', async () => {
        let s = new Molly.Serve.ExpressServer();
        let msg = await s.start('localhost', 8086);
        assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
        s.stop();
    });

    it('setup some collection info', async () => {
        let s = new Molly.Serve.ExpressServer();
        Molly.Logic.Configuration = new MollyConfiguration();
        
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

        Molly.Logic.Configuration.collectionInfos.push(user);
        Molly.Logic.Configuration.collectionInfos.push(group);
        Molly.Logic.Configuration.collectionInfos.push(right);

        console.info(Molly.Logic.Configuration.collectionInfos);
    });

    it('setup some validation info', async () => {
        let s = new Molly.Serve.ExpressServer();
        Molly.Logic.Configuration = new MollyConfiguration();

        let rightCreateSchema = type({
            key: customString.max(255).required(),
            active: bool.default(true)
        });
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

        let groupCreateSchema = type({
            name: customString.max(255).required(),
            rights: array.items(mongoDbObjectId)
        });
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

        let userCreateSchema = type({
            username: customString.max(255).required(),
            password: customString.min(8).required(),
            email: customString.max(255).allow(null).default(null),
            groupId: mongoDbObjectId.required()
        });
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

        let user = new Molly.Models.Configuration.ValidationInformation(
            userCreateSchema, userReadSchema, userUpdateSchema, userDeleteSchema
        );
        let group = new Molly.Models.Configuration.ValidationInformation(
            groupCreateSchema, groupReadSchema, groupUpdateSchema, groupDeleteSchema
        );
        let right = new Molly.Models.Configuration.ValidationInformation(
            rightCreateSchema, rightReadSchema, rightUpdateSchema, rightDeleteSchema
        );

        Molly.Logic.Configuration.validationInfos.push(user);
        Molly.Logic.Configuration.validationInfos.push(group);
        Molly.Logic.Configuration.validationInfos.push(right);

        console.info(Molly.Logic.Configuration.validationInfos);
    });

    it('throw error on invalid binding', async function () {
        // TODO: Open see https://gitlab.sw-gis.de/root/molly/issues/1
        /*
        this.timeout(30000);
        let s = new Molly.Serve.ExpressServer();
        try {
            await s.start('xyz', 8086);
            console.info('');
            assert.fail('dont throw an error');
        } catch (err) {
            assert.equal(err.message, 'getaddrinfo ENOTFOUND xyz', 'wrong error message');
        }
        */
    });
});