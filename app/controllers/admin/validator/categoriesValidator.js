/** importing yup */
const yup = require("yup");
/** import models */
const {categoryModel} = require("../../../models").model;
/** import slug creator tool */
const {createSlug} = require("../../../utils/createSlug");

exports.categoryValidator = yup.object().shape({
    _method: yup.string()   // will be used for category update validation
        .nullable(),
    _id: yup.string()   // will be used for category update validation
        .nullable(),
    name: yup.string()
        .min(3, "name_length_error")
        .test(
            "is-unique",
            "name_unique_error",
            async function (name) {
                /** check category slug existence in database */
                const existence = await categoryModel.findOne({slug: createSlug(name)});

                /**
                 * process if request method wasn't put.
                 * return false if category already exists.
                 */
                if (this.parent._method !== "put")
                    return !existence;

                /**
                 * process if request method was put.
                 * return true if category was not found
                 */
                if (!existence)
                    return true;

                /**
                 * process if request method was put.
                 * return false if category already exists and
                 * founded category _id and requested _id wasn't the same
                 */
                return this.parent._id === existence._id.toString();
            }
        ),
    parent: yup.string()
        .required("name_required_error")
});