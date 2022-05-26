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


        const error = new Error("شما مجاز به دسترسی به این آدرس نیستید");
        error.status = 401;
        next(error)
    }
}

module.exports = new UserAccessManager();