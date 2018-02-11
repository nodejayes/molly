import {isString, isNumber} from 'lodash';
import * as MOMENT from 'moment';



export class MongoDateConverter {
    private static _datetimefmt = 'YYYY-MM-DDTHH:mm:ss';
    
    private static _datefmt = 'YYYY-MM-DD';
    
    private static _timefmt = 'HH:mm:ss';

    private static _checkParamTo(v: String) {
        if (!isString(v)) {
            throw new Error(`invalid toDate parameter v ${v}`);
        }
    }

    private static _checkParamFrom(v: Number) {
        if (!isNumber(v)) {
            throw new Error(`invalid fromDate parameter v ${v}`);
        }
    }

    private static _checkValidMoment(v: Number | String, tmp: MOMENT.Moment): MOMENT.Moment {
        if (!tmp.isValid()) {
            throw new Error(`invalid value parameter v ${v}`);
        }
        return tmp;
    }

    static toDate(v: String): Number {
        this._checkParamTo(v);
        return this._checkValidMoment(v, MOMENT.utc(, this._datefmt)).valueOf();
    }

    static fromDate(v) {

    }

    static toTime(v) {

    }

    static fromTime(v) {

    }

    static toDateTime(v) {

    }

    static fromDateTime(v) {

    }

    static combine(v1, v2, type) {

    }

    static destruct(v) {

    }
}