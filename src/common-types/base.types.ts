import * as JOI from 'joi';

export class BaseTypes {
    static custom = JOI
    static uuid4 = JOI.string().guid({version: 'uuidv4'})
    static postgresDbId = JOI.number().integer().min(1)
    static mongoDbObjectId = JOI.string().alphanum().min(24).max(24)
    static bool = JOI.boolean()
    static doubleSmall = JOI.number().precision(2)
    static doubleMedium = JOI.number().precision(3)
    static doubleLarge = JOI.number().precision(4)
    static double = JOI.number()
    static array = JOI.array()
    static type(schema) {
        return JOI.object().keys(schema);
    }
    static typeArray(itemSchema) {
        return JOI.array().items(itemSchema);
    }
    static dateString = JOI.extend((j) => ({
        base: j.string(),
        name: 'date_string',
        pre: (value) => {
            return DateConverter.toDate(value);
        }
    })).date_string()
    static timeString = JOI.extend((j) => ({
        base: j.string(),
        name: 'time_string',
        pre: (value) => {
            return DateConverter.toTime(value);
        }
    })).time_string()
    static dateTimeString = JOI.extend((j) => ({
        base: j.string(),
        name: 'datetime_string',
        pre: (value) => {
            return DateConverter.toDateTime(value);
        },
    })).datetime_string()
    static dateFloat = JOI.extend((j) => ({
        base: j.number(),
        name: 'date_float',
        pre: (value) => {
            return DateConverter.fromDate(value);
        },
    })).date_float()
    static timeFloat = JOI.extend((j) => ({
        base: j.number(),
        name: 'time_float',
        pre: (value) => {
            return DateConverter.fromTime(value);
        },
    })).time_float()
    static dateTimeFloat = JOI.extend((j) => ({
        base: j.number(),
        name: 'datetime_float',
        pre: (value) => {
            return DateConverter.fromDateTime(value);
        },
    })).datetime_float()
}