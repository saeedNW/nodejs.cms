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

        res.redirect("/")
    } catch (err) {
        next(err)
    }
}