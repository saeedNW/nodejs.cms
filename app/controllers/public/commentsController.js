/** import main controller file */
const Controller = require("../controller");
/** import comment validator */
const {commentsValidator} = require("./validator/commentsValidator");
/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../core/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {commentModel} = require("../../models").model;

class CommentsController extends Controller {
    /**
     * new comment process
     * @param req
     * @param res
     * @param next
     */
    async newCommentProcess(req, res, next) {
        try {
            /** google recaptcha validation */
            await this.captchaValidation(req, res);

            /** user input validation */
            const validationResult = await this.commentValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new comment */
            await this.createComment(req, res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for comments
     * @param req
     * @returns {Promise<boolean>}
     */
    async commentValidation(req) {
        try {
            /** user input validation */
            await commentsValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ["comment"]);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            console.log(err)

            /** get validation errors */
            const errors = err.errors;

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    async createComment(req, res) {
        /** get current user ObjectId from request */
        const {_id: user} = req.user;

        /** generate new comment hash id */
        const hashId = await getHashId(identifierModels.comments.modelName);

        /** save new comment in database */
        await commentModel.create({...req.body, user, hashId});

        req.flash("success", "نظر شما با موفقیت ثبت گردید و پس از تایید ادمین به نمایش در خواهد آمد.");
        this.redirectURL(req, res);
    }
}

module.exports = new CommentsController();