import * as Acts from 'acts';

/**
 * send Method not Allowed
 *
 * @param {object} res
 */
function methodNotAllowed(res) {
    res.statusCode = 405;
    res.end();
}

/**
 * send Not Implemented
 * 
 * @param {any} res 
 */
function notImplemented(res) {
    res.statusCode = 501;
    res.end();
}

/**
 * check request
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
function routing(req, res, next) {
    if (req.method !== 'POST') {
        methodNotAllowed(res);
        return;
    }
    let tmp = req.path.split('/');
    if (tmp.length !== 2 || ['create', 'read', 'update', 'delete'].indexOf(tmp[0]) === -1 || Object.keys(this.validations).indexOf(tmp[1]) === -1) {
        notImplemented(res);
        return;
    }
    let action = tmp[0];
    let model = tmp[1];
    
}

/**
 * Molly Instance
 *
 * @export
 * @class Molly
 */
export class Molly {
    /**
     * Creates an instance of Molly.
     * @param {object} cfg
     * @memberof Molly
     */
    constructor(cfg) {
        this.address = cfg.address;
        this.port = cfg.port;
        this.validations = cfg.validations;
        this.server = Acts;

        this.server.createServer(__dirname, {
            server: {
                address: cfg.address,
                post: cfg.port,
            },
        }, null);
    }

    /**
     * start listening
     *
     * @memberof Molly
     */
    start() {
        this.server.start();
    }
}
