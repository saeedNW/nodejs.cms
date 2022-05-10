/** importing yup */
const yup = require("yup");

exports.accountRecoveryValidator = yup.object().shape({
    email: yup.string()
        .required("فیلد ایمیل نمیتواند خالی باشد")
        .email("ایمیل وارد شده صحیح نمیباشد")
});