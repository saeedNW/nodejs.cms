/** importing yup */
const yup = require("yup");
/** import user constants */
const {PaymentType} = require("../../../constants").coursesConstants;
/** import courses model */
const {courseModel} = require("../../../models").model;

/** define array variable for image mimetype */
const acceptableMimetypes = ["image/jpeg", "image/png", "image/jpg", "image/svg"];

exports.courseValidator = yup.object().shape({
    _method: yup.string()   // will be used for course update validation
        .nullable(),
    _id: yup.string()   // will be used for course update validation
        .nullable(),
    title: yup.string()
        .min(5, "عنوان نمیتواند کمتر از 5 کاراکتر باشد"),
    paymentType: yup.string()
        .oneOf(Object.values(PaymentType), "لطفا یکی از مقادیر مشخص شده را برای نوع دوره انتخاب کنید"),
    description: yup.string()
        .min(20, "توضیحات نمیتواند کمتر از 20 کاراکتر باشد"),
    price: yup.string()
        .required("فیلد قیمت نمیتواند خالی باشد"),
    tags: yup.string()
        .required("فیلد تگ ها نمیتواند خالی باشد"),
    slug: yup.string()
        .min(5, "نامک نمیتواند کمتر از 5 کاراکتر باشد")
        .test(
            "is-unique",
            "نامک وارد شده تکراری می باشد",
            async function (slug) {
                /** check database for same slug existence */
                let findCourse = await courseModel.findOne({slug});

                /**
                 * process if request method wasn't put.
                 * return false if slug already exists.
                 */
                if (this.parent._method !== "put")
                    return !findCourse;

                /**
                 * process if request method was put.
                 * return true if course was not found
                 */
                if (!findCourse)
                    return true

                /**
                 * process if request method was put.
                 * return false if slug already exists and
                 * founded course _id and requested _id wasn't the same
                 */
                return this.parent._id === findCourse._id.toString();
            }
        ),
    images: yup.object().shape({
        _method: yup.string()   // will be used for course update validation
            .nullable(),
        _id: yup.string()   // will be used for course update validation
            .nullable(),
        originalname: yup.string()
            .test(
                "is-require",
                "تصویر دوره الزامی می باشد",
                async function (originalname) {
                    /**
                     * check file original name existence if request method wasn't put.
                     * return true if request method was put.
                     */
                    if (this.parent._method !== "put") {
                        return !(!originalname || originalname === '' || originalname.length === 0);
                    } else {
                        return true
                    }
                }
            ),
        size: yup.number()
            .test(
                "is-large",
                "تصویر نباید بیشتر از 3 مگابایت باشد",
                async function (size) {
                    /**
                     * check file size if request method wasn't put.
                     * return true if request method was put.
                     */
                    if (this.parent._method !== "put") {
                        return size <= 3145728;
                    } else {
                        return true
                    }
                }
            ),
        mimetype: yup.mixed()
            .test(
                "is-image",
                "تنها پسوندهای jpeg, png, jpg و svg پشتیبانی می شوند",
                async function (mimetype) {
                    /**
                     * check file mimetype if request method wasn't put.
                     * return true if request method was put.
                     */
                    if (this.parent._method !== "put") {
                        return acceptableMimetypes.includes(mimetype);
                    } else {
                        return true
                    }
                }
            )
    })
});