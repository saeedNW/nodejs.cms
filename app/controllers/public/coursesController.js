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
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 10;
        /** extract search query from request */
        const {search, paymentType, order} = req.query;

        try {
            /**
             * this variable will be used as search query
             */
            const query = {};

            /**
             * add a regex to query variable as title,
             * if there was any search query in request
             * the regex contains search query and "gi" flags
             * "g" flag means global and "i" flag means case-insensitive
             */
            if (search)
                query.title = new RegExp(search, 'gi');

            /**
             * add paymentType to query variable as paymentType,
             * if it was in request query
             */
            if (paymentType && paymentType !== "all")
                query.paymentType = paymentType

            /**
             * sorting variable
             * @param order
             * @return {{createdAt: number}}
             */
            const sort = (order) => {
                if (order)
                    return {createdAt: -1}

                return {createdAt: 1}
            }

            /**
                 * getting match courses from database with mongoose paginate plugin.
                 * paginate plugin needs some options to initialize pagination based on them.
                 */
                const courses = await courseModel.paginate({...query}, {
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
                    sort: sort(order)
                });

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withPaginate().withFullInfo().transformCollection(courses);

            res.render("public/courses/index", {title: "دوره ها", courses: transformedData});
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
             * use populate relations to get
             * needed info.
             */
            const course = await courseModel.findOneAndUpdate({slug}, {$inc: {viewCount: 1}}).populate([
                {
                    /** use populate for user collection to get creator info */
                    path: "user"
                },
                {
                    /** use populate for episodes collection to get episodes info */
                    path: "episodes",
                    options: {
                        /** use sort option to sort episodes based on episode number */
                        sort: {episodeNumber: 1}
                    },
                    populate: {
                        /** use populate for course collection inside the episodes */
                        path: "course"
                    }
                },
                {
                    /** use populate for comments collection to get course comments info */
                    path: "comments",
                    /** use match option to select comments that are main comments and are approved by admin */
                    match: {
                        parent: null,
                        approved: true
                    },
                    options: {
                        /** use sort option to sort comments based on creation time */
                        sort: {createdAt: 1}
                    },
                    populate: [
                        {
                            /** use populate for user collection to get comment author info */
                            path: "user"
                        },
                        {
                            /** use populate for comments collection to get answers for the main comment */
                            path: "answers",
                            /** use match option to select comments that are approved by admin */
                            match: {
                                approved: true
                            },
                            populate: {
                                /** use populate for user collection to get answer comment author info */
                                path: "user"
                            }
                        }
                    ]
                }
            ]);

            /** return error if course was not found */
            if (!course)
                this.sendError("چنین دوره ای وجود ندارد", 404);

            /** transforming data to remove unneeded info */
            const transformedData = new CoursesTransform().withFullInfo()
                .withEpisodeFullInfo().withUserInfo().withComments().transform(course);


            /**
             * check if user can access to the course episodes or not
             * @type {boolean}
             */
            const canUserUse = await this.userCanUse(req, course);

            res.render("public/courses/single", {
                title: transformedData.title,
                captcha: this.recaptcha.render(),
                course: transformedData,
                canUserUse
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CoursesController();