/** import passport module */
const passport = require("passport");
/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import user registration validator */
const {loginValidator} = require("./validator/loginValidator");

/** import main controller file */
const Controller = require("../controller");

class LoginController extends Controller {
    /**
     * rendering login page
     * @param req
     * @param res
     */
    loginForm(req, res) {
        res.render("auth/login", {
            captcha: this.recaptcha.render(),
            title: "ورود"
        })
    }

    /**
     * user login process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async loginProcess(req, res, next) {
        try {
            /** google recaptcha validation */
            await this.captchaValidation(req, res);

            /** user input validation */
            const validationResult = await this.loginValidation(req);

            /** redirect to previous page if there was any validation errors */
            if (!validationResult)
                return this.redirectURL(req, res);

            await this.login(req, res, next);
        } catch (err) {
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * validation user inputs for login
     * @param req
     * @returns {Promise<boolean>}
     */
    async loginValidation(req) {
        try {
            /** user input validation */
            await loginValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ['email']);

            /** return true if there wasn't any validation errors */
            return true;
        } catch (err) {
            /** get validation errors */
            const errors = err.errors;

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    /**
     * user login process using passport module.
     * config remember me option
     * @param req
     * @param res
     * @param next
     */
    async login(req, res, next) {
        passport.authenticate("local.login", (err, user) => {
            /** redirect user to login page if login was not successful */
            if (!user) return this.redirectURL(req, res);

            /** get remember me checkbox status from request body */
            const {remember} = req.body

            /** use passport login method for user login process */
            req.logIn(user, err => {
                /** set remember me token if remember option was checked */
                if (remember) user.setRememberToken(res);

                /** redirect user to home page after completing login process */
                res.redirect("/");
            });

        })(req, res, next)
    }

    /**
     * user logout process
     * @param req
     * @param res
     */
    logout(req, res) {
        /** passport logout method  */
        req.logout();

        /** remove remember login cookie */
        res.clearCookie("remember_token");

        /** redirect to home page after user logout */
        res.redirect("/");
    }
}

module.exports = new LoginController();