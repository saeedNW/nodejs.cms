/** importing yup */
const yup = require("yup");

exports.userRolesValidator = yup.object().shape({
    roles: yup.lazy(
        val => (
            Array.isArray(val) ? yup.array().of(
                yup.string("مقدار فیلد دسترسی ها باید آرایه ای از رشته ها باشد")
                    .nullable()
            ) : yup.string("مقدار فیلد دسترسی ها باید رشته باشد")
                .nullable()
        )
    )
});