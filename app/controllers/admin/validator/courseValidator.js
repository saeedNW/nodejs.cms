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
        .min(5, "course_title_length_error"),
    paymentType: yup.string()
        .oneOf(Object.values(PaymentType), "course_payment_error"),
    description: yup.string()
        .min(20, "course_description_length_error"),
    price: yup.string()
        .required("course_price_required_error"),
    categories: yup.lazy(
        val => (
            Array.isArray(val) ? yup.array().of(
                yup.string()
                    .required(),
            ) : yup.string("course_category_required_error")
                .required("course_category_required_error")
        )
    ),
    tags: yup.string()
        .required("course_tag_required_error"),
    slug: yup.string()
        .min(5, "course_slug_length_error")
        .test(
            "is-unique",
            "course_unique_slug_error",
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
                    return true;

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
                "course_image_required_error",
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
                "course_image_size_error",
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
                "course_image_mimetype_error",
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