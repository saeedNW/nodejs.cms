/** importing yup */
const yup = require("yup");

exports.vipValidator = yup.object().shape({
    name: yup.string()
        .min(3, "name_length_error"),
    price: yup.string()
        .required("price_required_error"),
    months: yup.string()
        .required("month_required_error")
});