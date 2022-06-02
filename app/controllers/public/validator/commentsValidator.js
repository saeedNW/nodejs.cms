/** importing yup */
const yup = require("yup");

exports.commentsValidator = yup.object().shape({
    comment: yup.string()
        .min(3, "متن نظر نمیتواند کمتر از 3 کاراکتر باشد"),
});