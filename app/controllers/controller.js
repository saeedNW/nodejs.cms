/** import autoBind module */
const autoBind = require("auto-bind");
/** import express-recaptcha version 2 */
const Recaptcha = require('express-recaptcha').RecaptchaV2;
/** import mongoose */
const mongoose = require("mongoose");
/** import error sender */
const {sendError: error} = require("../utils/sendError");
/** import sprintf module */
const {sprintf} = require("sprintf-js");
/** import permission constants */
const {permissionsConstants} = require("../constants");

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
    mongoObjectIdValidation(_id) {
        /**
         * validation of given mongodb object id
         * @type {boolean}
         */
        const validate = mongoose.Types.ObjectId.isValid(_id);

        /** return error if given id is not a valid id */
        if (!validate)
            this.sendError("آی دی وارد شده صحیح نمی باشد", 404);
    }

    /**
     * method to use error sender function
     * @param message
     * @param status
     */
    sendError(message, status = 500) {
        error(message, status)
    }

    /**
     * calc course duration based on episodes time
     * @param episodes
     * @return {string}
     */
    getTime(episodes) {
        /**
         * total seconds
         * @type {number}
         */
        let seconds = 0;

        for (const episode of episodes) {
            /** brake episode time to an array */
            let time = episode.time.split(":");

            /**
             * continue based on episode duration array.
             * if episode duration is more than an hour time length would be 3,
             * else it would be 2
             */
            if (time.length === 2) {
                /** convert minutes to seconds */
                seconds += parseInt(time[0]) * 60;
                seconds += parseInt(time[1]);
            } else {
                /** convert hours to seconds */
                seconds += parseInt(time[0]) * 3600;
                /** convert minutes to seconds */
                seconds += parseInt(time[1]) * 60;
                seconds += parseInt(time[2]);
            }
        }

        let minutes = Math.floor(seconds / 60);

        let hours = Math.floor(minutes / 60);

        minutes -= hours * 60;

        seconds = Math.floor(((seconds / 60) % 1) * 60);

        return sprintf("%02d:%02d:%02d", hours, minutes, seconds);
    }

    /**
     * sweetalert generator method
     * @param req
     * @param {{title:string||undefined, text:string||undefined, icon:string||undefined, buttons:*, timer:number||undefined}} data
     */
    sweetalertGenerator(req, data) {
        const buttons = {
            showConfirmButton: true,
            confirmButtonText: 'خیلی خوب',
        }

        const timer = {
            timer: data.timer || 2000
        }

        const alertOptions = {
            title: data.title || "",
            text: data.text || "",
            icon: data.icon || "info",
            ...data.buttons === null ? null : data.buttons || buttons,
            ...data.buttons !== null ? null : timer
        }

        req.flash("sweetalert", alertOptions);
    }

    /**
     * remove comment and its answers
     * @param comment
     * @return {Promise<void>}
     */
    async removeComment(comment) {
        /**
         * calculating the count of decreased comments.
         * @type {number}
         */
        let totalDecreaseCount = 0;

        /** process if there were any answers for chosen comment */
        if (comment.answers.length > 0) {
            /** loop over comment answers */
            for (const answer of comment.answers) {
                /**
                 * add a unit to the number of decreased
                 * comments if answer was approved
                 */
                if (answer.approved)
                    ++totalDecreaseCount;

                /** removing the answer */
                await answer.remove();
            }
        }

        /**
         * add a unit to the number of decreased comments
         * if the main comment was approved
         */
        if (comment.approved)
            ++totalDecreaseCount;

        /**
         * decreasing course/episode comments count
         * based on comments' belongTo field.
         */
        await comment.belongTo.increase('commentCount', -totalDecreaseCount);

        /**
         * deleting comment from database
         */
        await comment.remove();
    }
}