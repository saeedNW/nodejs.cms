/** import main middleware file */
const Middleware = require("./middleware");


class ErrorHandler extends Middleware {
    notfound(req, res) {
        /**
         * rest api 404 route not found error
         */
        if (req.url.includes('/api'))
            return res.status(404).json({message: "روت مورد نظر پیدا نشد", status: 404});

        /**
         * 404 page rendering
         */
        res.render("error/404", {
            title: "خطا 404",
            layout: "./layouts/mainLayout",
        });
    }

    errorHandler(error, req, res, next) {
        const status = error.status || 500
        const message = error.message || "فرایند با مشکل مواجه شد";
        const stack = error.stack || "";

        /**
         * send error for api routes
         */
        if (req.url.includes('/api')) {
            console.log(error)
            return res.status(status).json({message, status});
        }

        /**
         * error page rendering for developers
         */
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'debugging') {
            return res.render("error/stack", {
                title: `خطا ${status}`,
                layout: "./layouts/mainLayout",
                status,
                message,
                stack
            });
        }

        /**
         * error page rendering for production
         */
        res.render("error/error", {
            title: `خطا ${status}`,
            layout: "./layouts/mainLayout",
            status,
            message,
            stack
        });
    }
}

module.exports = new ErrorHandler();