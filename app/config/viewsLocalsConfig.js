/** import main config file */
const Config = require("./config");
/** import path module */
const path = require("path");
/** import moment-jalaali module */
const moment = require("moment-jalaali");
/** activate persian language for moment */
moment.loadPersian({usePersianDigits: true})

/**
 * session configs
 */
module.exports = class ViewsLocalsConfig extends Config {
    /**
     * constructor method
     * @param req
     * @param res
     * @return {{oldData: (function(*, *=): *|string), auth: {loginCheck: boolean, user}, success: (Array|Object|Number|*), viewDir: (function(*): string), errors: (Array|Object|Number|*)}}
     */
    constructor(req, res) {
        super();
        this.req = req;
        this.res = res;
        this.formData = req.flash('formData')[0];
    }

    /**
     * config global values for ejs views
     */
    viewsLocals() {
        return {
            auth: this.userData(),
            viewDir: this.viewPath,
            errors: this.req.flash("errors"),
            success: this.req.flash("success"),
            oldData: this.oldInfo,
            convertDate: this.convertDate,
            query: this.req.query
        }
    }

    /**
     * send back user data if exists
     * @return {{loginCheck: boolean, user}}
     */
    userData() {
        return {
            user: this.req.user,
            loginCheck: this.req.isAuthenticated()
        }
    }

    /**
     * this method is used to return specific address in views directory
     * @param dir desired directory
     * @return {string}
     */
    viewPath(dir) {
        return path.resolve(`./resource/views/${dir}`);
    }

    /**
     * this method is used to set and return form data to front-end as
     * a local variable of the view engine
     * @param field input name
     * @param defaultValue input default value
     * @return {*|string}
     */
    oldInfo(field, defaultValue = '') {
        return this.formData && this.formData.hasOwnProperty(field) ? this.formData[field] : defaultValue;
    }

    /**
     * date converter method
     * @param time
     * @return {*|moment.Moment}
     */
    convertDate(time) {
        return moment(time)
    }
}