/** import passport module */
const passport = require("passport");
/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import user registration validator */
const {registerValidator} = require("./validator/registerValidator");

/** import main controller file */
const Controller = require("../controller");

class RegisterController extends Controller {
    /**
     * rendering register page
     * @param req
     * @param res
     */
    registerForm(req, res) {
        res.render("auth/register", {
            captcha: this.recaptcha.renderWith(this.recaptchaLocalization(req)),
            title: "عضویت"
        })
    }

    /**
     * user registration process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async registerProcess(req, res, next) {
        try {
            /** google recaptcha validation */
            await this.captchaValidation(req, res);

            /** user input validation */
            const validationResult = await this.registerValidation(req);

            /** redirect to previous page if there was any validation errors */
            if (!validationResult)
                return this.redirectURL(req, res);

            this.createUser(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for registration
     * @param req
     * @returns {Promise<boolean>}
     */
    async registerValidation(req) {
        try {
            /** user input validation */
            await registerValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ['name', 'email']);

            /** return true if there wasn't any validation errors */
            return true
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
     * user creation process using passport module
     * @param req
     * @param res
     * @param next
     */
    createUser(req, res, next) {
        passport.authenticate("local.register", {
            successRedirect: "/auth/login",
            failureRedirect: "/auth/register",
            failureFlash: true
        })(req, res, next);
    }
}

module.exports = new RegisterController();