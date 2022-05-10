/**
 * this function is used to throw errors
 * @param message
 * @param status
 */
exports.sendError = (message, status = 500) => {
    /**
     * create new error
     * @type {Error}
     */
    const error = new Error(message);
    /**
     * set error status
     * @type {number}
     */
    error.status = status;

    throw error;
}