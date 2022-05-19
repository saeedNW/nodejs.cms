/** import main middleware file */
const Middleware = require("./middleware");

class PreventReEntry extends Middleware {
    /**
     * prevent logged-in user from accessing to log in and register routes
     * @param req
     * @param res
     * @param next
     * @return {*}
     */
    preventReEntry(req, res, next) {
        /** redirect user ro home page if they wer already logged in */
        if (req.isAuthenticated())
            return res.redirect("/");

        /** continue to log in or register pages */
        next();
    }
}

module.exports = new PreventReEntry();