/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {permissionModel} = require("../../models").model;
/** import permission validator */
const {permissionsValidator} = require("./validator/permissionsValidator");

/** import main controller class */
const Controller = require("../controller");

class permissionsController extends Controller {
    /**
     * rendering permissions index page
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
             * getting all permissions from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const permissions = await permissionModel.paginate({}, {
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
                sort: {createdAt: 1}
            })

            /** rendering permissions index page */
            res.render("admin/permissions/index", {
                title: "مدیریت اجازه های دسترسی",
                permissions
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new permission creation page
     * @param req
     * @param res
     * @param next
     */
    async newPermissionForm(req, res, next) {
        try {
            res.render("admin/permissions/create", {title: "افزودن اجازه دسترسی جدید"});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new permission process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newPermissionProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.permissionValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new permission */
            await this.createPermission(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new permission creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async permissionValidation(req) {
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
            await permissionsValidator.validate(validationFields, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req);

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
     * create new permission
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createPermission(req, res, next) {
        try {
            /** generate new permissions' hash id */
            const hashId = await getHashId(identifierModels.permissions.modelName);

            /** save new permission in database */
            await permissionModel.create({...req.body, hashId});

            /** return user to the permissions main page */
            res.redirect("/admin/panel/permissions");
        } catch (err) {
            next(err);
        }
    }

    /**
     * permission removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deletePermissionProcess(req, res, next) {
        /** extract permission id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read permission data from database based on _id */
            const permission = await permissionModel.findById(_id).populate("roles");

            /** return error if permission was not found */
            if (!permission)
                this.sendError("چنین اجازه دسترسی وجود ندارد", 404);

            /**
             * removing permission from roles
             * before deleting it from database
             */
            for (const role of permission.roles) {
                /** find permission id index in the role permissions list */
                const index = role.permissions.indexOf(permission._id);
                /** removing permission from roles' permissions */
                role.permissions.splice(index, 1);
                /** save role */
                await role.save();
            }

            /**
             * deleting permission from database
             */
            await permission.remove();

            /** redirect to permission index page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering edit permission page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editPermissionForm(req, res, next) {
        /** extract permission id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read permission data from database based on _id */
            const permission = await permissionModel.findById(_id);


            /** return error if permission was not found */
            if (!permission)
                this.sendError("چنین اجازه دسترسی وجود ندارد", 404);

            /** rendering permissions page */
            res.render("admin/permissions/edit", {
                title: "ویرایش اجازه دسترسی",
                permission
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit permission process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editPermissionProcess(req, res, next) {
        /** extract permission id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read permission data from database based on _id */
            const permission = await permissionModel.findById(_id);

            /** return error if course was not found */
            if (!permission)
                this.sendError("چنین اجازه دسترسی وجود ندارد", 404);

            /** user input validation */
            const validationResult = await this.permissionValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** update permission in database */
            await permissionModel.findByIdAndUpdate(_id, {...req.body});

            /** return user to the courses main page */
            res.redirect("/admin/panel/permissions");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new permissionsController();