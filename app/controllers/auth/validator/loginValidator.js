/** importing yup */
const yup = require("yup");

exports.loginValidator = yup.object().shape({
    email: yup.string()
        .required("فیلد ایمیل نمیتواند خالی باشد")
        .email("ایمیل وارد شده صحیح نمیباشد"),
    password: yup.string()
        .required("فیلد رمز عبور نمیتواند خالی باشد")
});