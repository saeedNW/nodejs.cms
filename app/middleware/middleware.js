/** import autoBind module */
const autoBind = require('auto-bind');
/** import error sender */
const {sendError: error} = require("../utils/sendError");

module.exports = class Middleware {
    constructor() {
        autoBind(this);
    }

    /**
     * method to use error sender function
     * @param message
     * @param status
     */
    sendError(message, status = 500) {
        error(message, status)
    }
}