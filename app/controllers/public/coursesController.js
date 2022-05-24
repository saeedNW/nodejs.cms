/** import models */
const {courseModel, episodeModel} = require("../../models").model;
/** import courses transform */
const CoursesTransform = require("../../transform/coursesTransform");
/** import courses constants */
const {PaymentType} = require("../../constants").coursesConstants;
/** import path module */
const path = require("path");
/** import file system module */
const fs = require("fs");
/** import bcryptjs */
const bcrypt = require("bcryptjs");

/** import main controller file */
const Controller = require("../controller");

class CoursesController extends Controller {
    /**
     * rendering courses page
     * @param req
     * @param res
     * @param next
     */
    index(req, res, next) {
        try {
            res.render("public/courses/index", {title: "دوره ها"});
        } catch (err) {
            next(err);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    async singleCourse(req, res, next) {
        /** extract course slug from request params */
        const {slug} = req.params

        try {
            /**
             * get course info from database.
             * use populate relation for user
             * and episodes collections.
             */
            const course = await courseModel.findOne({slug}).populate([
                {
                    path: "user"
                },
                {
                    path: "episodes",
                    options: {
                        sort: {episodeNumber: 1}
                    },
                    populate: {
                        path: "course"
                    }
                }
            ]);

            /** return error if course was not found */
            if (!course)
                this.sendError("چنین دوره ای وجود ندارد", 404);

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withFullInfo()
                .withEpisodeBasicInfo().withUserInfo().transform(course);

            /**
             * check if user can access to the course episodes or not
             * @type {boolean}
             */
            const canUserUse = await this.canUse(req, course);

            res.render("public/courses/single", {
                title: course.title,
                course: course,
                canUserUse
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * check if user can access to the course episodes or not
     * @param req
     * @param course
     * @return {Promise<boolean>}
     */
    async canUse(req, course) {
        let canUse = false;

        /**
         * check if user logged in.
         * check if user has access to
         * course episodes or not
         */
        if (req.isAuthenticated()) {
            switch (course.paymentType) {
                case PaymentType.vip:
                    canUse = await req.user.isVip();
                    break;
                case PaymentType.cash:
                    canUse = await req.user.haveBought(course);
                    break;
                default:
                    canUse = true;
            }
        }

        /**
         * set user access  status
         * to true if user is an admin
         */
        if (req.isAuthenticated() && req.user.admin)
            canUse = true;

        return canUse;
    }


    async downloadProcess(req, res, next) {
        /** extract episode _id from request params */
        const {episode: _id} = req.params
        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** check episode existence */
            const episode = await episodeModel.findById(_id);

            /** return error if course was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجو ندارد", 404);

            /** return error if download link is expired */
            if (!this.checkDownloadLink(req, episode))
                this.sendError("لینک دانلود فاقد اعتبار است", 403);

            /**
             * create file absolute path
             * @type {string}
             */
            const filePath = path.resolve(`./public/downloads/${episode.episodeUrl}`);

            /** return error if requested file doesn't exists */
            if (!fs.existsSync(filePath))
                this.sendError("چنین جلسه ای وجو ندارد", 404);

            res.download(filePath);
        } catch (err) {
            next(err);
        }
    }

    /**
     * check the validity of the download link
     * @param req
     * @param episode
     * @return {*}
     */
    checkDownloadLink(req, episode) {
        let secretMac = `${process.env.EPISODE_SECRET_MAC}${episode._id}${req.query.t}${req.user._id}`;
        return bcrypt.compareSync(secretMac, req.query.mac)
    }
}

module.exports = new CoursesController();