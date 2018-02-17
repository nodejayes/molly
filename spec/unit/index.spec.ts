import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('Molly Modul Spec', () => {
    it('export all Database', () => {
        assert.isDefined(Molly.Database, 'Database is missing');
        assert.isDefined(Molly.Database.MongoDb, 'Database.MongoDb is missing');
    });

    it('export all Definitions', () => {
        assert.isDefined(Molly.Definitions, 'Definitions is missing');
        assert.isDefined(Molly.Definitions.BaseTypes, 'Definitions.BaseTypes is missing');
    });

    it('export all Models', () => {
        assert.isDefined(Molly.Models.Communicate.RequestModel, 'Models.Communicate.RequestModel is missing');
        assert.isDefined(Molly.Models.Communicate.ResponseModel, 'Models.Communicate.ResponseModel is missing');
        assert.isDefined(Molly.Models.Configuration.CollectionInformation, 'Models.Configuration.CollectionInformation is missing');
        assert.isDefined(Molly.Models.Configuration.MollyConfiguration, 'Models.Configuration.MollyConfiguration is missing');
        assert.isDefined(Molly.Models.Configuration.ValidationInformation, 'Models.Configuration.ValidationInformation is missing');
    });

    it('export all Serve', () => {
        assert.isDefined(Molly.Serve, 'Serve Namespace is missing');
        assert.isDefined(Molly.Serve.ExpressServer, 'Serve.ExpressServer is missing');
    });
});