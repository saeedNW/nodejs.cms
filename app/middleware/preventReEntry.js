/**
 * prevent logged-in user from accessing to log in and register routes
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
exports.preventReEntry = (req, res, next) => {
    if (req.isAuthenticated())
        return res.redirect("/");

    next();
}