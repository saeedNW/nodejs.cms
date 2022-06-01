/** import models */
const {courseModel, categoryModel} = require("../../models").model;
/** import courses transform */
const CoursesTransform = require("../../transform/coursesTransform");
/** import course constants */
const {PaymentType} = require("../../constants").coursesConstants

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
        const {search, paymentType, order, category} = req.query;

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
             * get category info from database and
             * add its id to query variable as category
             * if it was in request query
             */
            if (category && category !== "all") {
                const cate = await categoryModel.findOne({slug: category});
                if (cate)
                    query.categories = {$in: [cate._id]};
            }

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

            /** get categories from database */
            const categories = await categoryModel.find({});

            res.render("public/courses/index", {
                title: "دوره ها",
                courses: transformedData,
                categories
            });
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

            /** get categories from database */
            const categories = await categoryModel.find({parent: null}).populate("childes");

            res.render("public/courses/single", {
                title: transformedData.title,
                captcha: this.recaptcha.render(),
                course: transformedData,
                categories
            });
        } catch (err) {
            next(err);
        }
    }

    async paymentProcess(req, res, next) {
        /** get course id from request body */
        const {course: _id} = req.body;
        /** get user data from request */
        const {user} = req;

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);


            /** read course data from database based on _id */
            const course = await courseModel.findById(_id);

            /** return error if course was not found */
            if (!course) {
                this.sweetalertGenerator(req, {
                    title: "یافت نشد",
                    message: "دوره مورد نظر شما یافت نشد!!",
                    type: "error",
                })
                return this.redirectURL(req, res);
            }

            /** return error if user already have bought the chosen course */
            if (user && await user.haveBought(course._id)) {
                this.sweetalertGenerator(req, {
                    title: "خرید مجدد",
                    message: "شما قبلا این دوره را خریداری کرده اید",
                    type: "error",
                })
                return this.redirectURL(req, res);
            }

            /** return error if the chosen course is vip ar free */
            if (course.price === 0 && (course.paymentType === PaymentType.vip || course.paymentType === PaymentType.free)) {
                this.sweetalertGenerator(req, {
                    title: "عدم امکان خرید",
                    message: "این دوره قابل خرید نمی باشد",
                    type: "error",
                })
                return this.redirectURL(req, res);
            }

            /** buy process */

        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CoursesController();