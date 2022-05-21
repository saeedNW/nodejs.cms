/** importing yup */
const yup = require("yup");
/** import user constants */
const {PaymentType} = require("../../../constants").episodesConstants;

exports.episodeValidator = yup.object().shape({
    title: yup.string()
        .min(5, "عنوان نمیتواند کمتر از 5 کاراکتر باشد"),
    course: yup.string()
        .required("فیلد دوره نمیتواند خالی باشد"),
    time: yup.string()
        .required("فیلد دوره نمیتواند خالی باشد")
    /*.test(
        "is-time",
        "نوع زمان وارد شده صحیح نمی باشد",
        function (time) {
            const regex = new RegExp("^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$");
            return regex.test(time);
        }
    )*/,
    episodeUrl: yup.string()
        .required("لینک دانلود نمیتواند خالی باشد"),
    description: yup.string()
        .min(20, "توضیحات نمیتواند کمتر از 20 کاراکتر باشد"),
    paymentType: yup.string()
        .oneOf(Object.values(PaymentType), "لطفا یکی از مقادیر مشخص شده را برای نوع دوره انتخاب کنید"),
    episodeNumber: yup.number()
        .required("فیلد شماره جلسه نمیتواند خالی باشد")
        .test(
            "is-not-negative",
            "فیلد شماره جلسه نمیتواند منفی باشد",
            function (episodeNumber) {
                return episodeNumber >= 0;
            }
        )
});