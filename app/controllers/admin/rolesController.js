/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {roleModel, permissionModel} = require("../../models").model;
/** import permission validator */
const {rolesValidator} = require("./validator/rolesValidator");

/** import main controller class */
const Controller = require("../controller");

class rolesController extends Controller {
    /**
     * rendering roles index page
     * @param req
     * @param res
     * @param next
     */
    async index(req, res, next) {
        /** extract page number from request query */
        const page = +req.query.page || 1;
        /** extract limit number from request query */
        const limit = +req.query.limit || 10;

        try {
            /**
             * getting all roles from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const roles = await roleModel.paginate({}, {
                /**
                 * page option:
                 * this option define the requested page. and originally
                 * receives from request query
                 */
                page,
                /**
                 * limit option:
                 * this option define how many items should be in each page.
                 * it originally receives from request query
                 */
                limit,
                /**
                 * sort option:
                 * this options allows you to sort data before receiving them from database.
                 */
                sort: {createdAt: 1},
                /**
                 * populate option:
                 * Paths which should be populated with other documents
                 */
                populate: [
                    {
                        path: "permissions"
                    }
                ]
            });

            /** rendering permissions index page */
            res.render("admin/roles/index", {
                title: "مدیریت نقش ها",
                roles
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new role creation page
     * @param req
     * @param res
     * @param next
     */
    async newRoleForm(req, res, next) {
        try {
            /** get permissions info from database */
            const permissions = await permissionModel.find({});

            res.render("admin/roles/create", {title: "افزودن نقش جدید", permissions});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new role process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newRoleProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.roleValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new permission */
            await this.createRole(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new role creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async roleValidation(req) {
        try {
            /**
             * create custom feed for user inputs validation.
             * @type {*&{_method: *, _id}}
             */
            const validationFields = {
                ...req.body,
                _method: req.query._method,
                _id: req.params._id
            }

            /** user input validation */
            await rolesValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req, ["name", "label"]);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            console.log(err)

            /** get validation errors */
            const errors = err.errors;

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    /**
     * create new role
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createRole(req, res, next) {
        try {
            /** generate new roles' hash id */
            const hashId = await getHashId(identifierModels.roles.modelName);

            /** save new roles in database */
            await roleModel.create({...req.body, hashId});

            /** return user to the role's main page */
            res.redirect("/admin/panel/roles");
        } catch (err) {
            next(err);
        }
    }

    /**
     * role removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteRoleProcess(req, res, next) {
        /** extract permission id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read role data from database based on _id */
            const role = await roleModel.findById(_id).populate("users");

            /** return error if role was not found */
            if (!role)
                this.sendError("چنین دسترسی وجود ندارد", 404);

            /**
             * removing role from user roles
             * before deleting it from database
             */
            for (const user of role.users) {
                /** find role id index in the user roles list */
                const index = user.roles.indexOf(role._id);
                /** removing role from user roles */
                user.roles.splice(index, 1);
                /** save user */
                await user.save();
            }

            /**
             * deleting role from database
             */
            await role.remove();

            /** redirect to roles index page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering edit role page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editRoleForm(req, res, next) {
        /** extract role id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read role data from database based on _id */
            const role = await roleModel.findById(_id);


            /** return error if role was not found */
            if (!role)
                this.sendError("چنین دسترسی وجود ندارد", 404);

            /** get permissions info from database */
            const permissions = await permissionModel.find({});

            /** rendering roles page */
            res.render("admin/roles/edit", {
                title: "ویرایش نقش",
                role,
                permissions
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit role process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editRoleProcess(req, res, next) {
        /** extract role id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read role data from database based on _id */
            const role = await roleModel.findById(_id);

            /** return error if role was not found */
            if (!role)
                this.sendError("چنین دسترسی وجود ندارد", 404);

            /** user input validation */
            const validationResult = await this.roleValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** update permission in database */
            await roleModel.findByIdAndUpdate(_id, {...req.body});

            /** return user to the courses main page */
            res.redirect("/admin/panel/roles");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new rolesController();