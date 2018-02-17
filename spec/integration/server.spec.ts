import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha';
import { MollyConfiguration } from '../../src/models/configuration/molly_configuration';

describe('Molly Server Spec', () => {

    it('boot Server', async () => {
        let s = new Molly.Serve.ExpressServer();
        let msg = await s.start('localhost', 8086);
        assert.equal(msg, 'server listen on http://localhost:8086/', 'invalid return message');
        s.stop();
    });

    it('setup some collection info', async () => {
        let s = new Molly.Serve.ExpressServer();
        Molly.Logic.Configuration = new MollyConfiguration();
        
        let user = new Molly.Models.Configuration.CollectionInformation();
        let group = new Molly.Models.Configuration.CollectionInformation();
        let right = new Molly.Models.Configuration.CollectionInformation();

        Molly.Logic.Configuration.collectionInfos.push(user);
        Molly.Logic.Configuration.collectionInfos.push(group);
        Molly.Logic.Configuration.collectionInfos.push(right);
    });

    it('setup some validation info', async () => {
        let s = new Molly.Serve.ExpressServer();
        Molly.Logic.Configuration = new MollyConfiguration();

        let createUser = new Molly.Models.Configuration.ValidationInformation();

        Molly.Logic.Configuration.validationInfos.push(createUser);
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