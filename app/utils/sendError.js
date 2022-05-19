/**
 * this function is used to throw errors
 * @param message
 * @param status
 */
exports.sendError = (message, status = 500) => {
    const error = new Error(message);
    error.status = status
    throw error
}