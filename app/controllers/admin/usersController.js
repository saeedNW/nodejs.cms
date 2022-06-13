/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import user hash id generator */
const {nextUserHashId} = require("../../utils/nextUserHashId");
/** import models */
const {userModel} = require("../../models").model;
/** import user validator */
const {userValidator} = require("./validator/userValidator");
/** import user transform */
const UsersTransform = require("../../transform/usersTransform");
/** import file system module */
const fs = require("fs");

/** import main controller file */
const Controller = require("../controller");

class UsersController extends Controller {
    /**
     * rendering admin users manager page
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
             * getting all users from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const users = await userModel.paginate({}, {
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
            });

            /** transforming data to remove unneeded info */
            const transformedData = new UsersTransform().withPaginate().transformCollection(users);

            res.render("admin/users/index", {title: "مدیریت کاربران", users: transformedData});
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering new user creation page
     * @param req
     * @param res
     * @param next
     */
    async newUserForm(req, res, next) {
        try {
            res.render("admin/users/create", {title: "افزودن کاربر"});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new user process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newUserProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.userValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new user */
            await this.createUser(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new user creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async userValidation(req) {
        try {
            /**
             * create custom feed for user inputs validation.
             * @type {*&{_method: *, _id}}
             */
            const validationFields = {
                ...req.body,
                _method: req.query._method,
                _id: req.params._id
            }

            /** user input validation */
            await userValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ['name', 'email']);

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
     * create new user
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createUser(req, res, next) {
        try {
            /** set email to lower case */
            req.body.email = req.body.email.toLowerCase();

            /** generate new user hash id */
            const hashId = await nextUserHashId();

            /** save new course in database */
            await userModel.create({...req.body, hashId});

            /** return user to the courses main page */
            res.redirect("/admin/panel/users");
        } catch (err) {
            next(err);
        }
    }

    /**
     * user removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteUserProcess(req, res, next) {
        /** extract user id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read user data from database based on _id */
            const user = await userModel.findById(_id).populate([
                {
                    path: "courses",
                    populate: [
                        {
                            path: "episodes",
                            populate: {
                                path: "comments",
                                populate: {
                                    path: "answers"
                                }
                            }
                        },
                        {
                            path: "comments",
                            populate: {
                                path: "answers"
                            }
                        }
                    ]
                },
                {
                    path: "payments"
                },
                {
                    path: "comments",
                    populate: ["answers", "belongTo"]
                }
            ]);

            /** return error if user was not found */
            if (!user)
                this.sendError("چنین کاربری وجود ندارد", 404);

            /** remove user courses */
            if (user.courses.length > 0)
                await this.userCourseRemoval(user.courses);

            /** remove user payments */
            if (user.payments.length > 0)
                await this.userPaymentRemoval(user.payments);

            /** remove user comments */
            if (user.comments.length > 0)
                await this.userCommentsRemoval(user.comments);

            /**
             * deleting user from database
             */
            await user.remove();

            /** redirect to episodes index page */
            res.redirect("/admin/panel/users");
        } catch (err) {
            next(err);
        }
    }

    /**
     * remove user courses
     * @param courses
     * @return {Promise<void>}
     */
    async userCourseRemoval(courses) {
        /** loop over courses */
        for (const course of courses) {
            /**
             * delete course episodes.
             * loop over course episodes.
             */
            for (const episode of course.episodes) {

                /** todo@ remove episodes video */

                /** remove episode comments */
                if (episode.comments.length > 0) {
                    /** loop over comments */
                    for (const comment of episode.comments) {
                        /** loop over answers */
                        for (const answer of comment.answers) {
                            /** removing the answer */
                            await answer.remove();
                        }

                        /** remove comment from database */
                        await comment.remove();
                    }
                }

                /** remove episode from database */
                await episode.remove();
            }

            /**
             * delete course comments.
             * loop over course comments.
             */
            for (const comment of course.comments) {
                /** loop over answers */
                for (const answer of comment.answers) {
                    /** removing the answer */
                    await answer.remove();
                }

                /** removing comment from database */
                await comment.remove();
            }

            /** get course image addresses as na array */
            const images = Object.values(course.images);

            /**
             * loop over images addresses.
             * deleting course images
             */
            for (const image of images) {
                fs.unlinkSync(`./public${image}`);
            }

            /**
             * deleting course from database
             */
            await course.remove();
        }
    }

    /**
     * remove user payments
     * @param payments
     * @return {Promise<void>}
     */
    async userPaymentRemoval(payments) {
        /** loop over payments */
        for (const payment of payments) {
            /** remove payment from database */
            await payment.remove()
        }
    }

    /**
     * remove user comments
     * @param comments
     * @return {Promise<void>}
     */
    async userCommentsRemoval(comments) {
        /** loop over comments */
        for (const comment of comments) {
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

    /**
     * rendering edit user page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editUserForm(req, res, next) {
        /** extract user id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read user data from database based on _id */
            const user = await userModel.findById(_id);

            /** return error if course was not found */
            if (!user)
                this.sendError("چنین کاربری وجود ندارد", 404);

            /** transforming data to remove unneeded info */
            const transformedData = new UsersTransform().transform(user);

            /** rendering courses page */
            res.render("admin/users/edit", {
                title: "ویرایش کاربر",
                user: transformedData
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit user process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editUserProcess(req, res, next) {
        /** extract user id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read user data from database based on _id */
            const user = await userModel.findById(_id);

            /** return error if user was not found */
            if (!user)
                this.sendError("چنین کاربری وجود ندارد", 404);

            /** user input validation */
            const validationResult = await this.userValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** set email to lower case */
            req.body.email = req.body.email.toLowerCase();

            /** update course in database */
            await userModel.findByIdAndUpdate(_id, {$set: {...req.body}});

            /** return user to the courses main page */
            res.redirect("/admin/panel/users");
        } catch (err) {
            next(err);
        }
    }

    /**
     * toggle user admin access status
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async toggleAdminAccess(req, res, next) {
        /** extract user id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read user data from database based on _id */
            const user = await userModel.findById(_id);

            /** return error if user was not found */
            if (!user)
                this.sendError("چنین کاربری وجود ندارد", 404);

            console.log(1, user.admin)

            /**
             * toggle user admin access status.
             * if it's true change it to false
             * and if it's false make it true.
             * @type {boolean}
             */
            user.admin = !user.admin;

            console.log(2, user.admin)

            /**
             * remove user roles and permissions if
             * user admin access was taken
             */
            if (!user.admin)
                user.roles = [];

            /** update user info in database */
            await user.save();

            /** redirect to previous page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UsersController();