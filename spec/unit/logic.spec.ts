import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha'

describe('Logic Spec', () => {
    it('exports Configuration', () => {
        assert.isDefined(Molly.Logic.Configuration, 'Logic.Configuration is missing');
        assert.instanceOf(Molly.Logic.Configuration, Molly.Models.Configuration.MollyConfiguration, 'Logic.Configuration is not an instance of Models.Configuration.MollyConfiguration');
    });
})