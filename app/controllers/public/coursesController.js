/** import models */
const {courseModel} = require("../../models").model;
/** import courses transform */
const CoursesTransform = require("../../transform/coursesTransform");

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
                .withEpisodeFullInfo().withUserInfo().transform(course);

            /**
             * check if user can access to the course episodes or not
             * @type {boolean}
             */
            const canUserUse = await this.userCanUse(req, course);

            res.render("public/courses/single", {
                title: transformedData.title,
                course: transformedData,
                canUserUse
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CoursesController();