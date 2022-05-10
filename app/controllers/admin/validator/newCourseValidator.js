/** importing yup */
const yup = require("yup");
/** import user constants */
const {PaymentType} = require("../../../constants").coursesConstants;
/** import courses model */
const {courseModel} = require("../../../models").model;


exports.newCourseValidator = yup.object().shape({
    title: yup.string()
        .min(5, "عنوان نمیتواند کمتر از 5 کاراکتر باشد"),
    slug: yup.string()
        .min(5, "نامک نمیتواند کمتر از 5 کاراکتر باشد")
        .test(
            "is-unique",
            "نامک وارد شده تکراری می باشد",
            async (slug, testContext) => {
                console.log(slug);
                /** check database for same slug existence */
                const findSlug = await courseModel.findOne({slug});

                /** return false if slug already exists */
                return !findSlug;
            }
        ),
    paymentType: yup.string()
        .oneOf(Object.values(PaymentType), "لطفا یکی از مقادیر مشخص شده را برای نوع دوره انتخاب کنید"),
    description: yup.string()
        .min(20, "توضیحات نمیتواند کمتر از 20 کاراکتر باشد"),
    price: yup.string()
        .required("فیلد قیمت نمیتواند خالی باشد"),
    tags: yup.string()
        .required("فیلد تگ ها نمیتواند خالی باشد")
});