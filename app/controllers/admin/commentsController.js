/** import main controller file */
const Controller = require("../controller");
/** import models */
const {commentModel} = require("../../models").model;
/** import transform */
const CommentsTransform = require("../../transform/commentsTransform");

class CommentsController extends Controller {
    /**
     * rendering comments index page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 20;

        try {
            /**
             * getting all courses from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const comments = await commentModel.paginate({approved: true}, {
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
                sort: {createdAt: -1},
                /**
                 * populate option:
                 * Paths which should be populated with other documents
                 */
                populate: [
                    {
                        /** use populate for user collection to get comment author info */
                        path: "user"
                    },
                    {
                        /** use populate for course collection to get comments related course info if exists */
                        path: "course"
                    },
                    {
                        /** use populate for episode collection to get comments related episode info if exists */
                        path: "episode",
                        populate: {
                            path: "course"
                        }
                    },
                ]
            });


            /** transforming data to remove unneeded info */
            const transformedData = new CommentsTransform().withUserInfo().withCourseInfo().withEpisodeInfo().withPaginate().transformCollection(comments);

            /** rendering courses page */
            res.render("admin/comments/index", {
                title: "کامنت ها",
                comments: transformedData
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering unapproved comments page
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async unapproved(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 20;

        try {
            /**
             * getting all courses from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const comments = await commentModel.paginate({approved: false}, {
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
                sort: {createdAt: -1},
                /**
                 * populate option:
                 * Paths which should be populated with other documents
                 */
                populate: [
                    {
                        /** use populate for user collection to get comment author info */
                        path: "user"
                    },
                    {
                        /** use populate for course collection to get comments related course info if exists */
                        path: "course"
                    },
                    {
                        /** use populate for episode collection to get comments related episode info if exists */
                        path: "episode",
                        populate: {
                            path: "course"
                        }
                    },
                ]
            });


            /** transforming data to remove unneeded info */
            const transformedData = new CommentsTransform().withUserInfo().withCourseInfo().withEpisodeInfo().withPaginate().transformCollection(comments);

            /** rendering courses page */
            res.render("admin/comments/unapproved", {
                title: "کامنت های تایید نشده",
                comments: transformedData
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * unapproved comments approval
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async approvalProcess(req, res, next) {
        /** extract comment id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read comments data from database based on _id */
            const comment = await commentModel.findById(_id).populate("belongTo");

            /** return error if comments was not found */
            if (!comment)
                this.sendError("چنین دوره ای وجود ندارد", 404);

            /**
             * increase course/episode comment count
             * based on comments' belongTo field
             */
            await comment.belongTo.increase("commentCount");

            /** change comment approved status to true */
            comment.approved = true;

            /** update comment in database */
            await comment.save();

            /** redirect to previous page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err)
        }
    }

    /**
     * comments removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteCommentProcess(req, res, next) {
        /** extract comment id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read comment data from database based on _id */
            const comment = await commentModel.findById(_id).populate(["answers", "belongTo"]);

            /** return error if comment was not found */
            if (!comment)
                this.sendError("چنین نظری وجود ندارد", 404);

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
                    await commentModel.findByIdAndDelete(answer._id);
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

            /** redirect to previous page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CommentsController();