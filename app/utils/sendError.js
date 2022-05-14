const {boolean} = require("yup");

class CustomError extends Error {
    /**
     * this is a boolean variable which will determine the fact
     * that error page need to be loaded or not.
     * Note: this variable only usable for apps with server side rendering (SSR).
     */
    #pageLoad;

    /**
     * set error status
     */
    #status

    constructor(message, status, pageLoad = false) {
        super(message);
        this.#status = status;
        this.#pageLoad = pageLoad;
    }
}

/**
 * this function is used to throw errors
 * @param message
 * @param status
 * @param pageLoad
 */
exports.sendError = (message, status = 500, pageLoad = false) => {
    throw new CustomError(message, status, pageLoad);
}