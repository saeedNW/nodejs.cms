/** import models */
const {courseModel, categoryModel, paymentModel} = require("../../models").model;
/** import courses transform */
const CoursesTransform = require("../../transform/coursesTransform");
/** import course constants */
const {PaymentType} = require("../../constants").coursesConstants;
/** import axios module */
const request = require("request-promise");
/** import general hashId generator method */
const {getHashId} = require("../../core/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants/identifier");

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
                    text: "دوره مورد نظر شما یافت نشد!!",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** return error if user already have bought the chosen course */
            if (user && await user.haveBought(course._id)) {
                this.sweetalertGenerator(req, {
                    title: "خرید مجدد",
                    text: "شما قبلا این دوره را خریداری کرده اید",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** return error if the chosen course is vip ar free */
            if (course.price === 0 && (course.paymentType === PaymentType.vip || course.paymentType === PaymentType.free)) {
                this.sweetalertGenerator(req, {
                    title: "عدم امکان خرید",
                    text: "این دوره قابل خرید نمی باشد",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** send request to zarinPal get way */
            await this.getWayRequest(res, course, user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * send request to zarinPal get way
     * @param res
     * @param course
     * @param user
     */
    async getWayRequest(res, course, user) {
        /**
         * create request feed
         * @type {{callback_url: *, amount: (number|*), description: string, merchant_id: *, email}}
         */
        const params = {
            merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            amount: course.price,
            callback_url: process.env.ZARINPAL_CALLBACK_URL,
            description: `بابت خرید دوره ${course.title}`,
            email: user.email,
        }

        /**
         * request options
         * @type {{headers: {"content-type": string, "cache-control": string}, method: string, json: boolean, body, url}}
         */
        const options = this.getPaymentRequestOptions(process.env.ZARINPAL_REQUEST_URL, params);

        /**
         * sending request to zarinPal
         */
        const requestResult = await request(options);

        /** return error is there was any error during request */
        if (requestResult.data.code !== 100)
            this.sendError("پرداخت شما با موفقیت انجام نشد", 400);

        /** generate new payment hash id */
        const hashId = await getHashId(identifierModels.payments.modelName);

        /**
         * save new payment in database
         * @type {T extends Document ? Require_id<T> : (Document<unknown, any, T> & Require_id<T> & TVirtuals & TMethodsAndOverrides)}
         */
        await paymentModel.create({
            hashId,
            user: user._id,
            course: course._id,
            resNumber: requestResult.data.authority,
            price: course.price
        });

        /**
         * redirect user to zarinPal payment page
         */
        res.redirect(`https://www.zarinpal.com/pg/StartPay/${requestResult.data.authority}`);
    }

    /**
     * check payment response status.
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async paymentChecker(req, res, next) {
        /** extract payment status and Authority from request query */
        const {Status, Authority} = req.query;
        /** extract user from request */
        const {user} = req;

        try {
            /** return error if payment was not successful */
            if (Status && Status !== "OK") {
                this.sweetalertGenerator(req, {
                    title: "خطا",
                    text: "پرداخت شما با موفقیت انجام نشد",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** get payment info from database */
            const payment = await paymentModel.findOne({resNumber: Authority}).populate("course");

            /** return error if payments' course was not found */
            if (!payment.course) {
                this.sweetalertGenerator(req, {
                    title: "اخطار",
                    text: "دوره ای که شما پرداخت آنرا انجام داده اید وجود ندارد",
                    icon: "error"
                })
                return this.redirectURL(req, res);
            }

            /**
             * request feed
             * @type {{amount: (number|*), authority: ({type: String | StringConstructor, required: boolean}|*), merchant_id: *}}
             */
            const params = {
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                amount: payment.price,
                authority: payment.resNumber
            }

            /**
             * request options
             * @type {{headers: {"content-type": string, "cache-control": string}, method: string, json: boolean, body, url}}
             */
            const options = this.getPaymentRequestOptions(process.env.ZARINPAL_VERIFY_URL, params);

            /**
             * sending verification request to zarinPal
             */
            const requestResult = await request(options);

            /** return error if payment was not successful */
            if (requestResult.data.code !== 100)
                this.sendError("پرداخت شما با موفقیت انجام نشد", 400);

            /** update payment status to true */
            payment.paymentStatus = true;
            await payment.save();

            /** update user purchases list */
            user.purchases.push(payment.course._id);
            await user.save();

            /** return success message */
            this.sweetalertGenerator(req, {
                title: "تشکر از خرید",
                text: "عملیات خرید با موفقیت انجام پذیرفت",
                icon: "success",
            })

            res.redirect(`/courses/${payment.course.slug}`);
        } catch (err) {
            next(err);
        }
    }


    getPaymentRequestOptions(url, params, method = "POST") {
        return {
            method,
            url,
            headers: {
                "cache-control": "no-cache",
                "content-type": "application/json"
            },
            body: params,
            json: true
        };
    }
}

module.exports = new CoursesController();