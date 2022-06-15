/** importing yup */
const yup = require("yup");
/** import mongoose */
const mongoose = require("mongoose");
/** import roles model */
const {roleModel} = require("../../../models").model;

exports.userRolesValidator = yup.object().shape({
    role: yup.string()
        .test(
            "is-ObjectId",
            "نقش انتخاب شده صحیح نمی باشد",
            async function (role) {
                /**
                 * return false if the given id is not a mongo ObjectId
                 */
                if (!mongoose.Types.ObjectId.isValid(role))
                    return false;

                /** check if the chosen role exists in database */
                return roleModel.findById(role);
            }
        )
});