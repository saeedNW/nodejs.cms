/**
 * route not found handler
 * @param req
 * @param res
 * @param next
 */
exports.notFound = (req, res, next) => {
    if (req.url.includes('/api')) {
        const status = 404;
        const message = 'Requested API was not found';
        res.status(status).json({message, status});
    } else {
        const status = 404;
        const message = 'Page not found';
        res.render("public/error", {status, message});
    }
}

/**
 * error handler middleware
 * @param error
 * @param req
 * @param res
 * @param next
 */
exports.errorHandler = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;

    if (req.url.includes('/api')) {
        res.status(status).json({message});
    } else {
        if (error.status === 403) {
            res.render("public/error", {status, message});
        } else {
            req.flash("errors", message);
            res.redirect(req.header("Referer") || "/");
        }
    }
}