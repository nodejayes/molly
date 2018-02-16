import {Molly} from './../../src/index';
import {assert} from 'chai';
import 'mocha';

describe('Molly Server Spec', () => {
    it('boot Server', async () => {
        let s = new Molly.Serve.ExpressServer();
        await s.start('localhost', 8086);
        s.stop();
    });
});