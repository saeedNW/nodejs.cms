/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import user account recovery validator */
const {accountRecoveryValidator} = require("./validator/accountRecoveryValidator");
/** import account recovery model */
const {accountRecoveryModel, userModel} = require("../../models").model;

/** import main controller file */
const Controller = require("../controller");

class AccountRecoveryController extends Controller {
    /**
     * rendering account recovery page
     * @param req
     * @param res
     */
    recoveryForm(req, res) {
        res.render("auth/accountRecovery", {
            captcha: this.recaptcha.render(),
            title: "بازیابی حساب"
        });
    }

    /**
     * user account recovery process
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async recoveryProcess(req, res, next) {
        try {
            /** google recaptcha validation */
            await this.captchaValidation(req, res);

            /** user input validation */
            const validationResult = await this.recoveryValidator(req);

            /** redirect to previous page if there was any validation errors */
            if (!validationResult)
                return this.redirectURL(req, res);

            await this.sendRecoveryLink(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validation user inputs for account recovery
     * @param req
     * @return {Promise<boolean>}
     */
    async recoveryValidator(req) {
        try {
            /** user input validation */
            await accountRecoveryValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req);

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
     * create new account recovery request and send it to user email address
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async sendRecoveryLink(req, res, next) {
        try {
            /** extract user email from request body */
            let {email} = req.body;

            /** set email to lower case */
            email = email.toLowerCase();

            /** check for user existence */
            const user = await userModel.findOne({email});

            /** return error if user was not found */
            if (!user) {
                req.flash("errors", ["چنین کاربری در سامانه وجود ندارد"]);
                return this.redirectURL(req, res);
            }

            /** remove recovery token if there is any unused one */
            await accountRecoveryModel.findOneAndDelete({email, use: false});

            /** create new account recovery request */
            const newRecovery = await accountRecoveryModel.create({email});

            /** todo@ send account recovery email */

            /** send back success message */
            req.flash("success", "ایمیل بازیابی اکانت با موفقیت ارسال گردید");
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AccountRecoveryController();