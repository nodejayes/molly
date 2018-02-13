import * as JOI from 'joi'

export class BaseTypes {
    static custom = JOI;
    static uuid4 = JOI.string().guid({version: 'uuidv4'});
    static postgresDbId = JOI.number().integer().min(1);
    static mongoDbObjectId = JOI.string().alphanum().min(24).max(24);
    static bool = JOI.boolean();
    static doubleSmall = JOI.number().precision(2);
    static doubleMedium = JOI.number().precision(3);
    static doubleLarge = JOI.number().precision(4);
    static double = JOI.number();
    static type(schema) {
        return JOI.object().keys(schema);
    };
}