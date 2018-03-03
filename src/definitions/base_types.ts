import * as JOI from 'joi'

export class BaseTypes {
    static custom = JOI;
    static bool = JOI.boolean();
    static double = JOI.number();
    static doublePrecision = BaseTypes.double.precision(16);
    static money = BaseTypes.double.precision(2);
    static bigint = JOI.number().integer().min(-9223372036854775808).max(9223372036854775807);
    static integer = JOI.number().integer().min(-2147483648).max(2147483647);
    static smallint = JOI.number().integer().min(-32768).max(32767);
    static tinyint = JOI.number().integer().min(0).max(255);
    static string = JOI.string();
    static char = BaseTypes.string.max(1);
    static stringDefaultLength = BaseTypes.string.max(255);
    static hostname = BaseTypes.string.hostname();
    static ip = BaseTypes.string.ip();
    static hexadecimal = BaseTypes.string.hex();
    static email = BaseTypes.string.email();
    static url = BaseTypes.string.uri();
    static base64 = BaseTypes.string.base64();
    static creditCard = BaseTypes.string.creditCard();
    static binary = JOI.binary();
    static alphanumericString = BaseTypes.string.alphanum();
    static date = JOI.date();
    static isoDateString = BaseTypes.string.isoDate();
    static array = JOI.array();
    static type(schema) {
        return JOI.object().keys(schema);
    };
    static typeArray(schema) {
        return BaseTypes.array.items(schema);
    }
    static epsg = BaseTypes.string.regex(/^EPSG:[0-9]*$/);
    static uuid4 = BaseTypes.string.guid({version: 'uuidv4'});
    static postgresDbId = BaseTypes.integer.min(1);
    static mongoDbObjectId = BaseTypes.alphanumericString.min(24).max(24);
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