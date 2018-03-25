import * as JOI from 'joi'

/**
 * Base Data Types for Validation
 * 
 * @export
 * @class BaseTypes
 */
export class BaseTypes {
    /**
     * a Custom JOI Type
     * 
     * @static
     * @memberof BaseTypes
     */
    static custom = JOI;
    /**
     * Boolean Value
     * 
     * @static
     * @memberof BaseTypes
     */
    static bool = JOI.boolean();
    /**
     * Double Value
     * 
     * @static
     * @memberof BaseTypes
     */
    static double = JOI.number();
    /**
     * a Precise Double with 16 digits after Komma
     * 
     * @static
     * @memberof BaseTypes
     */
    static doublePrecision = BaseTypes.double.precision(16);
    /**
     * Money Value with 2 digits after Komma
     * 
     * @static
     * @memberof BaseTypes
     */
    static money = BaseTypes.double.precision(2);
    /**
     * 64 bit Integer
     * 
     * @static
     * @memberof BaseTypes
     */
    static bigint = JOI.number().integer().min(-9223372036854775808).max(9223372036854775807);
    /**
     * 32 bit Integer
     * 
     * @static
     * @memberof BaseTypes
     */
    static integer = JOI.number().integer().min(-2147483648).max(2147483647);
    /**
     * 8 bit Integer
     * 
     * @static
     * @memberof BaseTypes
     */
    static smallint = JOI.number().integer().min(-32768).max(32767);
    /**
     * 4 bit Integer
     * 
     * @static
     * @memberof BaseTypes
     */
    static tinyint = JOI.number().integer().min(0).max(255);
    /**
     * a String
     * 
     * @static
     * @memberof BaseTypes
     */
    static string = JOI.string();
    /**
     * a Digit
     * 
     * @static
     * @memberof BaseTypes
     */
    static char = BaseTypes.string.max(1);
    /**
     * a String with 255 digits
     * 
     * @static
     * @memberof BaseTypes
     */
    static stringDefaultLength = BaseTypes.string.max(255);
    /**
     * a String as Hostname
     * 
     * @static
     * @memberof BaseTypes
     */
    static hostname = BaseTypes.string.hostname();
    /**
     * a String as IP
     * 
     * @static
     * @memberof BaseTypes
     */
    static ip = BaseTypes.string.ip();
    /**
     * a Hexadecimal String
     * 
     * @static
     * @memberof BaseTypes
     */
    static hexadecimal = BaseTypes.string.hex();
    /**
     * a String as Email
     * 
     * @static
     * @memberof BaseTypes
     */
    static email = BaseTypes.string.email();
    /**
     * a String as URL
     * 
     * @static
     * @memberof BaseTypes
     */
    static url = BaseTypes.string.uri();
    /**
     * a Base64 String
     * 
     * @static
     * @memberof BaseTypes
     */
    static base64 = BaseTypes.string.base64();
    /**
     * a Credit Card Number
     * 
     * @static
     * @memberof BaseTypes
     */
    static creditCard = BaseTypes.string.creditCard();
    /**
     * a Buffer
     * 
     * @static
     * @memberof BaseTypes
     */
    static binary = JOI.binary();
    /**
     * a alphanumeric String
     * 
     * @static
     * @memberof BaseTypes
     */
    static alphanumericString = BaseTypes.string.alphanum();
    /**
     * a Javascript Date
     * 
     * @static
     * @memberof BaseTypes
     */
    static date = JOI.date();
    /**
     * a Iso Date String
     * 
     * @static
     * @memberof BaseTypes
     */
    static isoDateString = BaseTypes.string.isoDate();
    /**
     * a Array
     * 
     * @static
     * @memberof BaseTypes
     */
    static array = JOI.array();
    /**
     * a Object
     * 
     * @static
     * @param {any} schema 
     * @returns {JOI.ObjectSchema} 
     * @memberof BaseTypes
     */
    static type(schema): JOI.ObjectSchema {
        return JOI.object().keys(schema);
    };
    /**
     * a Array with Objects
     * 
     * @static
     * @param {any} schema 
     * @returns {JOI.ArraySchema} 
     * @memberof BaseTypes
     */
    static typeArray(schema): JOI.ArraySchema {
        return BaseTypes.array.items(schema);
    };
    /**
     * a EPSG Code
     * 
     * @static
     * @memberof BaseTypes
     */
    static epsg = BaseTypes.string.regex(/^EPSG:[0-9]*$/);
    /**
     * a UUID in Version 4
     * 
     * @static
     * @memberof BaseTypes
     */
    static uuid4 = BaseTypes.string.guid({version: 'uuidv4'});
    /**
     * a Postgres DB Id
     * 
     * @static
     * @memberof BaseTypes
     */
    static postgresDbId = BaseTypes.integer.min(1);
    /**
     * a MongoDb Object Id as String
     * 
     * @static
     * @memberof BaseTypes
     */
    static mongoDbObjectId = BaseTypes.alphanumericString.min(24).max(24);
    /**
     * GeoJSON Point
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonPoint = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('Point'),
        coordinates: BaseTypes.typeArray(JOI.number()),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
    /**
     * GeoJSON MultiPoint
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonMultiPoint = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('MultiPoint'),
        coordinates: BaseTypes.typeArray(
            BaseTypes.typeArray(BaseTypes.double)
        ),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
    /**
     * GeoJSON Line
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonLineString = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('LineString'),
        coordinates: BaseTypes.typeArray(
            BaseTypes.typeArray(BaseTypes.double)
        ),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
    /**
     * GeoJSON MultiLine
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonMultiLineString = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('MultiLineString'),
        coordinates: BaseTypes.typeArray(
            BaseTypes.typeArray(
                BaseTypes.typeArray(BaseTypes.double)
            )
        ),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
    /**
     * GeoJSON Polygon
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonPolygon = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('Polygon'),
        coordinates: BaseTypes.typeArray(
            BaseTypes.typeArray(
                BaseTypes.typeArray(BaseTypes.double)
            )
        ),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
    /**
     * GeoJSON MultiPolygon
     * 
     * @static
     * @memberof BaseTypes
     */
    static geoJsonMultiPolygon = BaseTypes.type({
        type: BaseTypes.alphanumericString.allow('MultiPolygon'),
        coordinates: BaseTypes.typeArray(
            BaseTypes.typeArray(
                BaseTypes.typeArray(
                    BaseTypes.typeArray(BaseTypes.double)
                )
            )
        ),
        crs: BaseTypes.type({
            type: BaseTypes.alphanumericString.allow('name'),
            properties: BaseTypes.type({
                name: BaseTypes.epsg,
            }),
        }),
    });
}