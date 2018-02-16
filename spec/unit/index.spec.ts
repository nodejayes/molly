import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('Molly Modul Spec', () => {
    it('export all Share', () => {
        assert.isDefined(Molly.Share, 'Share Namespace is missing');
        assert.isDefined(Molly.Share.BaseTypes, 'Share.BaseTypes is missing');
        assert.isDefined(Molly.Share.CollectionInformation, 'CollectionInformation is missing');
        assert.isDefined(Molly.Share.MollyConfiguration, 'MollyConfiguration is missing');
        assert.isDefined(Molly.Share.ValidationInformation, 'ValidationInformation is missing');
    });

    it('export all Serve', () => {
        assert.isDefined(Molly.Serve, 'Serve Namespace is missing');
        assert.isDefined(Molly.Serve.ExpressServer, 'Serve.ExpressServer is missing');
    });
});