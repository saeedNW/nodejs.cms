/** import error sender */
const {sendError} = require("../utils/sendError");

/**
 * admin access manager handler method
 * @param req
 * @param res
 * @param next
 */
exports.adminAccessManager = (req, res, next) => {
    try {
        /** grant access if user is admin */
        if (req.isAuthenticated() && req.user.admin)
            return next();

        /** denied access if user is not admin*/
        sendError("access denied", 403, true);
    } catch (err) {
        next(err)
    }
}