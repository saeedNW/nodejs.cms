/** importing yup */
const yup = require("yup");
const {userConstants} = require("../../../constants");

exports.resetPasswordValidator = yup.object().shape({
    token: yup.string()
        .required("توکن فاقد اعتبار است"),
    password: yup.string()
        .required("فیلد رمز عبور نمیتواند خالی باشد")
        .matches(userConstants.PasswordRegEx, "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک عدد و دو علامت خاص !@#$&* باشد")
});