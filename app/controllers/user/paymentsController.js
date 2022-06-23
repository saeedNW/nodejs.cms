/** import main controller file */
const Controller = require("../controller");
/** import models */
const {paymentModel} = require("../../models").model;
/** import payment transform */
const PaymentsTransform = require("../../transform/paymentsTransform");

class PaymentsController extends Controller {
    /**
     * rendering user payments index page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 10;
        /** extract user from request */
        const {user} = req;

        try {
            /**
             * getting all user payments from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const payments = await paymentModel.paginate({user: user._id}, {
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
                        path: "course"
                    },
                    {
                        path: "vip"
                    }
                ]
            });

            /** transforming data to remove unneeded info */
            const transformedData = new PaymentsTransform().withCourseInfo().withVipPlanInfo()
                .withPaginate().transformCollection(payments);

            res.render("user/paymentsHistory", {title: "پرداختی ها", payments: transformedData});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new PaymentsController();