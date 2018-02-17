import {Database as DB} from './database/index';
import {Definitions as DEF} from './definitions/index';
import {Models as MOD} from './models/index';
import {Serve as S} from './serve/index';

import {Logic as LOGI} from './logic';

/**
 * Molly Modul
 * @module Molly
 */
export namespace Molly {
    export let Database = DB;
    export let Definitions = DEF;
    export let Models = MOD;
    export let Serve = S;

    export let Logic = LOGI;
}