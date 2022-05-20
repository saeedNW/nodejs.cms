/** import autoBind module */
const autoBind = require("auto-bind");
/** import express-recaptcha version 2 */
const Recaptcha = require('express-recaptcha').RecaptchaV2;
/** import mongoose */
const mongoose = require("mongoose");
/** import error sender */
const {sendError: error} = require("../utils/sendError");

module.exports = class Controller {
    constructor() {
        autoBind(this);
        this.recaptchaConfig();
    }

    /**
     * google captcha initializer
     */
    recaptchaConfig() {
        this.recaptcha = new Recaptcha(
            process.env.CAPTCHA_SITE_KEY,
            process.env.CAPTCHA_SECRET,
            {
                hl: 'fa',
                callback: 'cb'
            }
        );
    }

    /**
     * google captcha validator
     * @param req
     * @param res
     * @return {Promise<unknown>}
     */
    captchaValidation(req, res) {
        return new Promise(resolve => {
            this.recaptcha.verify(req, err => {
                if (err) {
                    req.flash('errors', 'گزینه امنیتی مربوط به شناسایی روبات خاموش است، لطفا از فعال بودن آن اطمینان حاصل نمایید و مجدد امتحان کنید');
                    this.redirectURL(req, res);
                } else {
                    resolve(true)
                }
            })
        })
    }

    /**
     * redirect request to previous url
     * @param req
     * @param res
     */
    redirectURL(req, res) {
        req.flash("formData", req.body);
        return res.redirect(req.header("Referer") || "/");
    }

    /**
     * validation of mongodb ObjectID structure
     * @param _id
     * @return {boolean}
     */
    objectIdValidation(_id) {
        return mongoose.Types.ObjectId.isValid(_id);
    }

    /**
     * method to use error sender function
     * @param message
     * @param status
     */
    sendError(message, status = 500) {
        error(message, status)
    }
}