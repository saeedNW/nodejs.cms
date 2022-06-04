/** importing yup */
const yup = require("yup");
/** import models */
const {permissionModel} = require("../../../models").model;

exports.permissionsValidator = yup.object().shape({
    _method: yup.string()   // will be used for category update validation
        .nullable(),
    _id: yup.string()   // will be used for category update validation
        .nullable(),
    name: yup.string()
        .min(3, "عنوان نمیتواند کمتر از 3 کاراکتر باشد")
        .test(
            "is-unique",
            "عنوان نمی تواند تکراری باشد",
            async function (name) {
                /** check permission name existence in database */
                const existence = await permissionModel.findOne({name});

                /**
                 * process if request method wasn't put.
                 * return false if permission already exists.
                 */
                if (this.parent._method !== "put")
                    return !existence;

                /**
                 * process if request method was put.
                 * return true if permission was not found
                 */
                if (!existence)
                    return true;

                /**
                 * process if request method was put.
                 * return false if permission already exists and
                 * founded permission _id and requested _id wasn't the same
                 */
                return this.parent._id === existence._id.toString();
            }
        ),
    label: yup.string()
        .required("فیلد برچسب نمیتواند خالی باشد")
        .test(
            "is-unique",
            "برچسب نمی تواند تکراری باشد",
            async function (label) {
                /** check permission label existence in database */
                const existence = await permissionModel.findOne({label});

                /**
                 * process if request method wasn't put.
                 * return false if permission already exists.
                 */
                if (this.parent._method !== "put")
                    return !existence;

                /**
                 * process if request method was put.
                 * return true if permission was not found
                 */
                if (!existence)
                    return true;

                /**
                 * process if request method was put.
                 * return false if permission already exists and
                 * founded permission _id and requested _id wasn't the same
                 */
                return this.parent._id === existence._id.toString();
            }
        )
});