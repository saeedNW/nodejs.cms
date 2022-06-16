/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
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
                sort: {createdAt: 1},
                /**
                 * populate option:
                 * Paths which should be populated with other documents
                 */
                populate: "course"
            })


            /** transforming data to remove unneeded info */
            const transformedData = new EpisodeTransform().withPaginate().withCourseFullInfo().transformCollection(episodes);

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
        /** extract course id from request body */
        const {course} = req.body;

        try {
            /** generate new episode hash id */
            const hashId = await getHashId(identifierModels.episodes.modelName);

            /** save new course in database */
            await episodeModel.create({...req.body, hashId});

            /** update course time */
            await this.updateCourseTime(course)
            /** return user to the courses main page */
            res.redirect("/admin/panel/episodes");
        } catch (err) {
            next(err);
        }
    }

    /**
     * episode removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteEpisodeProcess(req, res, next) {
        /** extract episode id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read episode data from database based on _id */
            const episode = await episodeModel.findById(_id).populate([
                {
                    path: "comments",
                    populate: {
                        path: "answers"
                    }
                },
                {
                    path: "course"
                }
            ]);

            /** return error if episode was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجود ندارد", 404);

            /** return error of course didn't belong to user */
            if (episode.course.user.toString() !== req.user._id.toString())
                this.sendError("شما اجازه حذف این جلسه را ندارید", 403);

            /** todo@ remove episode video */

            /** remove episode comments */
            if (episode.comments.length > 0)
                await this.episodeCommentRemoval(episode.comments);

            /**
             * deleting episode from database
             */
            await episode.remove();

            /** update course time */
            await this.updateCourseTime(episode.course);

            /** redirect to episodes index page */
            res.redirect("/admin/panel/episodes");
        } catch (err) {
            next(err);
        }
    }

    /**
     * remove episode comments
     * @param comments
     * @return {Promise<void>}
     */
    async episodeCommentRemoval(comments) {
        /** loop over comments */
        for (const comment of comments) {
            /** loop over answers */
            for (const answer of comment.answers) {
                /** removing the answer */
                await answer.remove();
            }

            /**
             * deleting comment from database
             */
            await comment.remove();
        }
    }

    /**
     * rendering edit episode page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editEpisodeForm(req, res, next) {
        /** extract episode id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read course data from database based on _id */
            const episode = await episodeModel.findById(_id).populate("course");


            /** return error if course was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجود ندارد", 404);

            /** get courses title */
            const courses = await courseModel.find({}, {title: 1});

            /** transforming data to remove unneeded info */
            const transformedData = new EpisodeTransform().withFullInfo().withCourseBasicInfo().transform(episode)


            /** rendering courses page */
            res.render("admin/episodes/edit", {
                title: "ویرایش جلسه",
                episode: transformedData,
                courses
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit course process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editEpisodeProcess(req, res, next) {
        /** extract course id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read course data from database based on _id */
            const episode = await episodeModel.findById(_id).populate("course");

            /** return error if course was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجود ندارد", 404);

            /** return error of course didn't belong to user */
            if (episode.course.user.toString() !== req.user._id.toString())
                this.sendError("شما اجازه حذف این جلسه را ندارید", 403);

            /** user input validation */
            const validationResult = await this.episodeValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** update course in database */
            await episodeModel.findByIdAndUpdate(_id, {...req.body});

            /** update previous course time */
            await this.updateCourseTime(episode.course);
            /** update new course time */
            await this.updateCourseTime(req.body.course);

            /** return user to the courses main page */
            res.redirect("/admin/panel/episodes");
        } catch (err) {
            next(err);
        }
    }

    /**
     * update course time
     * @param courseId
     * @return {Promise<void>}
     */
    async updateCourseTime(courseId) {
        const course = await courseModel.findById(courseId).populate("episodes");

        course.time = this.getTime(course.episodes);
        await course.save();
    }
}

module.exports = new EpisodesController();