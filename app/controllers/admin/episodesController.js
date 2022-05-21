/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../core/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {courseModel, episodeModel} = require("../../models").model;
/** import new episode creation validator */
const {episodeValidator} = require("./validator/episodeValidator");
/** import transform */
const EpisodeTransform = require("../../transform/episodesTransform");

/** import main controller class */
const Controller = require("../controller");

class EpisodesController extends Controller {
    /**
     * rendering episodes index page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 10;

        try {
            /**
             * getting all courses from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const episodes = await episodeModel.paginate({}, {
                /**
                 * page option:
                 * this option define the requested page. and originally
                 * receives from request query
                 */
                page,
                /**
                 * limit option:
                 * this option define how many items should be in each page.
                 * it originally receives from request query
                 */
                limit,
                /**
                 * sort option:
                 * this options allows you to sort data before receiving them from database.
                 */
                sort: {createdAt: 1}
            })


            /** transforming data to remove unneeded info */
            const transformedData = new EpisodeTransform().withPaginate().transformCollection(episodes);

            /** rendering courses page */
            res.render("admin/episodes/index", {
                title: "مدیریت ویدئو ها",
                episodes: transformedData
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new episode creation page
     * @param req
     * @param res
     * @param next
     */
    async newEpisodeForm(req, res, next) {
        try {
            /** get courses title */
            const courses = await courseModel.find({}, {title: 1});

            res.render("admin/episodes/create", {title: "افزودن جلسه جدید", courses});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new episode process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newEpisodeProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.episodeValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new episode */
            await this.createEpisode(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new course creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async episodeValidation(req) {
        try {
            /** user input validation */
            await episodeValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ["title", "course", "description", "paymentType", "episodeNumber"]);

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

    /**
     * create new episode
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createEpisode(req, res, next) {
        try {
            /** generate new course hash id */
            const hashId = await getHashId(identifierModels.episodes.modelName);

            /** save new course in database */
            await episodeModel.create({...req.body, hashId});

            /** todo@ update course time */

            /** return user to the courses main page */
            res.redirect("/admin/panel/episodes");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new EpisodesController();