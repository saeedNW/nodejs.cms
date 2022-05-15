/** import path module */
const path = require("path");

/**
 * this variable will be used to set forms inputs data to return
 * them to front if there was any error during any process that have
 * a form involved
 */
let formData;

/**
 * config global values for ejs views
 * @param app
 */
exports.viewsGlobalInfo = (app) => {
    app.use((req, res, next) => {
        /** set form data */
        formData = req.flash("formData")[0];

        /** set ejs view engin local values */
        app.locals = {
            auth: this.userData(req),
            viewDir: this.viewPath,
            errors: req.flash("errors"),
            success: req.flash("success"),
            oldData: this.oldInfo
        };
        next();
    });
}

/**
 * send back user data if exists
 * @return {{loginCheck: boolean, user}}
 */
exports.userData = (req) => {
    return {
        user: req.user,
        loginCheck: req.isAuthenticated()
    }
}

/**
 * this method is used to return specific address in views directory
 * @param dir desired directory
 * @return {string}
 */
exports.viewPath = (dir) => {
    return path.resolve(`./resource/views/${dir}`);
}

/**
 * this method is used to set and return form data to front-end as
 * a local variable of the view engine
 * @param field input name
 * @param defaultValue input default value
 * @return {*|string}
 */
exports.oldInfo = (field, defaultValue = '') => {
    return formData && formData.hasOwnProperty(field) ? formData[field] : defaultValue;
}