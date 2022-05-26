/** import main middleware file */
const Middleware = require("./middleware");

class UserAccessManager extends Middleware {
    /**
     * prevent non-logged-in user from accessing specified route
     * @param req
     * @param res
     * @param next
     * @return {*}
     */
    userAccessManager(req, res, next) {
        /** redirect user ro home page if they wer already logged in */
        if (req.isAuthenticated())
            return next();


        res.redirect("/auth/login");
    }
}

module.exports = new UserAccessManager();