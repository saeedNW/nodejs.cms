/** import request-promise module */
const request = require("request-promise");
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants/identifier");
/** import course constants */
const {PaymentType} = require("../../constants").coursesConstants;
/** import models */
const {courseModel, paymentModel, vipModel} = require("../../models").model;

/** import main controller file */
const Controller = require("../controller");

class PaymentController extends Controller {
    /**
     * payment process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async coursePaymentProcess(req, res, next) {
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
            if (user && user.haveBought(course._id)) {
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
            await this.getWayRequest(res, user, course);
        } catch (err) {
            next(err);
        }
    }

    /**
     * send request to zarinPal get way
     * @param res
     * @param user
     * @param item
     */
    async getWayRequest(res, user, item) {
        /**
         * create request feed
         * @type {{callback_url: *, amount: (number|*), description: (string|string), merchant_id: *, email}}
         */
        const params = {
            merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            amount: item.price,
            callback_url: process.env.ZARINPAL_CALLBACK_URL,
            description: item.title ? `بابت خرید دوره ${item.title}` : `بابت شارژ اکانت ویژه ${item.name}`,
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
         * the item that user is paying for
         * @type {{course}|{vip}}
         */
        const paymentItem = item.title ? {course: item._id} : {vip: item._id};

        /**
         * save new payment in database
         */
        await paymentModel.create({
            hashId,
            user: user._id,
            resNumber: requestResult.data.authority,
            price: item.price,
            ...paymentItem
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
            const payment = await paymentModel.findOne({resNumber: Authority}).populate([
                {
                    path: "course"
                },
                {
                    path: "vip"
                }
            ]);

            /** return error if payments' item was not found */
            if (!payment.course && !payment.vip) {
                this.sweetalertGenerator(req, {
                    title: "اخطار",
                    text: "آیتمی که شما پرداخت آنرا انجام داده اید وجود ندارد",
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

            /** update user purchases list if payment was fpr purchasing a course */
            if (payment.course) {
                user.purchases.push(payment.course._id);
                await user.save();
            }

            /** update user vip time if payment was for purchasing vip account */
            if (payment.vip) {
                /**
                 * get current date
                 * @type {Date}
                 */
                const currentDate = new Date();

                /** set user new vip time based on vip plan duration */
                user.vipTime = currentDate.setMonth(currentDate.getMonth() + payment.vip.months);

                /** set user vip type based on vip plan type */
                user.vipType = payment.vip.name

                /** update user in database */
                await user.save();
            }

            /** return success message */
            this.sweetalertGenerator(req, {
                title: "تشکر از خرید",
                text: "عملیات خرید با موفقیت انجام پذیرفت",
                icon: "success",
            })

            res.redirect(payment.course ? `/courses/${payment.course.slug}` : "/user/panel/vip");
        } catch (err) {
            next(err);
        }
    }

    async vipPaymentProcess(req, res, next) {
        /** get plan id from request body */
        const {plan: _id} = req.body;
        /** get user data from request */
        const {user} = req;

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read vip plan data from database based on _id */
            const plan = await vipModel.findById(_id);

            /** return error if vip plan was not found */
            if (!plan) {
                this.sweetalertGenerator(req, {
                    title: "یافت نشد",
                    text: "گزینه مورد نظر شما یافت نشد!!",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** return error if user already has vip plan */
            if (user && user.isVip()) {
                this.sweetalertGenerator(req, {
                    title: "خرید مجدد",
                    text: "شما هم اکنون دارای اکانت ویژه می باشید",
                    icon: "error",
                })
                return this.redirectURL(req, res);
            }

            /** send request to zarinPal get way */
            await this.getWayRequest(res, user, plan);
        } catch (err) {
            next(err);
        }
    }

    /**
     * create payment request options
     * @param url
     * @param params
     * @param method
     * @return {{headers: {"content-type": string, "cache-control": string}, method: string, json: boolean, body, url}}
     */
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

module.exports = new PaymentController();