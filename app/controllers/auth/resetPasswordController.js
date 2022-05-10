/** import account recovery model */
const {accountRecoveryModel, userModel} = require("../../models").model;
/** import user reset password validator */
const {resetPasswordValidator} = require("./validator/resetPasswordValidator");

/** import main controller file */
const Controller = require("../controller");
const {next} = require("lodash/seq");

class ResetPasswordController extends Controller {
    /**
     * rendering reset password page
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async resetForm(req, res, next) {
        try {
            /** extract token from request params */
            const token = req.params.token
            /** check token existence in data base */
            const tokenExistence = await accountRecoveryModel.findOne({token, use: false});
            /** throw error if token was not found */
            if (!tokenExistence)
                this.sendError('صفحه پیدا نشد');

            res.render("auth/resetPassword", {
                captcha: this.recaptcha.render(),
                title: "بازیابی رمز عبور",
                token
            });
        } catch (err) {
            /**
             * without passing err to next method the result would be page not found error.
             */
            next()
        }
    }

    /**
     * user account reset password process
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async resetProcess(req, res, next) {
        try {
            /** google recaptcha validation */
            await this.captchaValidation(req, res);

            /** user input validation */
            const validationResult = await this.resetValidator(req);

            /** redirect to previous page if there was any validation errors */
            if (!validationResult)
                return this.redirectURL(req, res);

            await this.resetPassword(req, res);
        } catch (err) {
            next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
        }
    }

    /**
     * validation user inputs for reset password
     * @param req
     * @return {Promise<boolean>}
     */
    async resetValidator(req) {
        try {
            /** user input validation */
            await resetPasswordValidator.validate(req.body, {abortEarly: false});

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

    async resetPassword(req, res, next) {
        try {
            /** extract data from request */
            const {token, password} = req.body;

            /** decoding token to extract email address */
            const {email} = await accountRecoveryModel.decodeToken(token);

            /** checking account recovery token existence in database */
            const recoveryToken = await accountRecoveryModel.findOne({token, email});

            /** throw error if recovery token was not found or if the token already has been used */
            if (!recoveryToken || recoveryToken.use)
                this.sendError("توکن فاقد اعتبار است", 422);

            /** find user in database */
            const user = await userModel.findOne({email});

            /** throw error if user was not found */
            if (!user)
                this.sendError("اطلاعات کاربر مورد نظر وجود ندارند.", 422);

            /** update user password */
            user.password = password
            await user.save();

            /** update account recovery token use status in database */
            recoveryToken.use = true;
            await recoveryToken.save();

            /** send back success message */
            req.flash("success", "بازیابی حساب کاربری با موفقیت به انجام رسید");
            res.redirect("/auth/login");
        } catch (err) {
            if (err.status === 422) {
                next(err);
            } else {
                next("فرایند با مشکل مواجه شد لطفا مجددا تلاش نمایید");
            }
        }
    }

}

module.exports = new ResetPasswordController();