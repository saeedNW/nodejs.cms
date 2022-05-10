/** importing yup */
const yup = require("yup");

/** import user constants */
const userConstants = require("../../../constants").userConstants;

exports.registerValidator = yup.object().shape({
    name: yup.string()
        .required("فیلد نام نمیتواند خالی باشد")
        .min(5, "نام نمیتواند کمتر از 5 کاراکتر باشد"),
    email: yup.string()
        .required("فیلد ایمیل نمیتواند خالی باشد")
        .email("ایمیل وارد شده صحیح نمیباشد"),
    password: yup.string()
        .required("فیلد رمز عبور نمیتواند خالی باشد")
        .matches(userConstants.PasswordRegEx, "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک عدد و دو علامت خاص !@#$&* باشد")
});