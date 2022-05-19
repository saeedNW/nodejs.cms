/** import main middleware file */
const Middleware = require("./middleware");


class AdminAccessManager extends Middleware {
    /**
     * admin access manager handler method
     * @param req
     * @param res
     * @param next
     */
    adminAccessManager(req, res, next) {
        /** grant access if user is admin */
        if (req.isAuthenticated() && req.user.admin)
            return next();

        /** redirect to home page if user is not admin */
        res.redirect("/");
    }
}

module.exports = new AdminAccessManager();