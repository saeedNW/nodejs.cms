/** importing yup */
const yup = require("yup");
/** import models */
const {userModel} = require("../../../models").model;

/** import user constants */
const userConstants = require("../../../constants").userConstants;

exports.userValidator = yup.object().shape({
    _method: yup.string()   // will be used for user update validation
        .nullable(),
    _id: yup.string()   // will be used for user update validation
        .nullable(),
    name: yup.string()
        .required("فیلد نام نمیتواند خالی باشد")
        .min(5, "نام نمیتواند کمتر از 5 کاراکتر باشد"),
    email: yup.string()
        .required("فیلد ایمیل نمیتواند خالی باشد")
        .email("ایمیل وارد شده صحیح نمیباشد")
        .test(
            "is-unique",
            "ایمیل وارد شده تکراری می باشد",
            async function (email) {
                if (!email)
                    return true;

                /** set email to lower case */
                email = email.toLowerCase();

                /** check database for same slug existence */
                let findUser = await userModel.findOne({email});

                /**
                 * process if request method wasn't put.
                 * return false if user already exists.
                 */
                if (this.parent._method !== "put")
                    return !findUser;

                /**
                 * process if request method was put.
                 * return true if user was not found
                 */
                if (!findUser)
                    return true;

                /**
                 * process if request method was put.
                 * return false if user already exists and
                 * founded user _id and requested _id wasn't the same
                 */
                return this.parent._id === findUser._id.toString();
            }
        ),
    password: yup.string()
        .test(
            "is-required",
            "فیلد رمز عبور نمیتواند خالی باشد",
            async function (password) {
                /**
                 * return true if method is put.
                 * during an update password could be empty.
                 */
                if (this.parent._method === "put")
                    return true;

                /**
                 * check if password is empty or not
                 * if method wasn't put.
                 * return false if password is empty
                 * and true if it's not empty.
                 */
                return password;
            }
        )
        .test(
            "is-strong",
            "رمز عبور باید حداقل شامل یک حرف بزرگ، یک حرف کوچک، یک عدد و دو علامت خاص !@#$&* باشد",
            async function (password) {
                /**
                 * process if method was put
                 */
                if (this.parent._method === "put") {
                    /**
                     * return true if password was empty.
                     * during an update password could be empty.
                     */
                    if (!password)
                        return true;

                    /**
                     * check password strength if it wasn't empty
                     */
                    return userConstants.PasswordRegEx.test(password);
                }

                /**
                 * check password strength
                 * if method wasn't put.
                 */
                return userConstants.PasswordRegEx.test(password);
            }
        )
});