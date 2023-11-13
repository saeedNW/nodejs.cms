/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");
/** import general hashId generator method */
const {getHashId} = require("../../utils/getHashId");
/** import identifier constants */
const {identifierModels} = require("../../constants").identifierConstants;
/** import models */
const {categoryModel, vipModel} = require("../../models").model;
/** import new episode creation validator */
const {vipValidator} = require("./validator/VipsValidator");
/** import slug creator tool */
const {createSlug} = require("../../utils/createSlug");

/** import main controller class */
const Controller = require("../controller");

class VipController extends Controller {
    /**
     * rendering vips index page
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
             * getting all vip types from database with mongoose paginate plugin.
             * paginate plugin needs some options to initialize pagination based on them.
             */
            const vipTypes = await vipModel.paginate({}, {
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


            /** rendering categories page */
            res.render("admin/vips/index", {
                title: req.t("vips_index_title"),
                vipTypes
            });
        } catch (err) {
            next(err)
        }
    }

    /**
     * rendering new vip creation page
     * @param req
     * @param res
     * @param next
     */
    async newVipForm(req, res, next) {
        try {
            res.render("admin/vips/create", {title: req.t("new_vip_title")});
        } catch (err) {
            next(err)
        }
    }

    /**
     * new vip process manager
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async newVipProcess(req, res, next) {
        try {
            /** user input validation */
            const validationResult = await this.vipValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** create new category */
            await this.createVip(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    /**
     * validate user inputs for new vip creation
     * @param req
     * @returns {Promise<boolean>}
     */
    async vipValidation(req) {
        try {
            /** user input validation */
            await vipValidator.validate(req.body, {abortEarly: false});

            /** escape and trim user input */
            escapeAndTrim(req);

            /** return true if there wasn't any validation errors */
            return true
        } catch (err) {
            console.log(err)

            /** get validation errors */
            const errors = err.errors.map(error => req.t(error));

            /** set errors in a flash message */
            req.flash("errors", errors);

            /** return false if there was any validation error */
            return false
        }
    }

    /**
     * create new vip
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async createVip(req, res, next) {
        try {
            /** generate new vip hash id */
            const hashId = await getHashId(identifierModels.vips.modelName);

            /** save new course in database */
            await vipModel.create({...req.body, hashId});

            /** return user to the courses main page */
            res.redirect("/admin/panel/vips");
        } catch (err) {
            next(err);
        }
    }

    /**
     * vip type removal process manager
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async deleteVipProcess(req, res, next) {
        /** extract vip id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read vip data from database based on _id */
            const vip = await vipModel.findById(_id);

            /** return error if episode was not found */
            if (!vip)
                this.sendError(req.t("vip_notFound_error"), 404);

            /**
             * deleting vip from database
             */
            await vip.remove();

            /** redirect to episodes index page */
            res.redirect("/admin/panel/vips");
        } catch (err) {
            next(err);
        }
    }

    /**
     * rendering edit vip page
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editVipForm(req, res, next) {
        /** extract vip id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read vip data from database based on _id */
            const vipType = await vipModel.findById(_id);


            /** return error if vip was not found */
            if (!vipType)
                this.sendError(req.t("vip_notFound_error"), 404);

            /** rendering courses page */
            res.render("admin/vips/edit", {
                title: req.t("edit_vip_title"),
                vipType
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * edit vip process
     * @param req
     * @param res
     * @param next
     * @return {Promise<*>}
     */
    async editVipProcess(req, res, next) {
        /** extract vip id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read vip data from database based on _id */
            const vipType = await vipModel.findById(_id);

            /** return error if vip was not found */
            if (!vipType)
                this.sendError(req.t("vip_notFound_error"), 404);

            /** user input validation */
            const validationResult = await this.vipValidation(req);

            /**
             * redirect to previous page if there was any validation errors.
             */
            if (!validationResult)
                return this.redirectURL(req, res);

            /** update vip in database */
            await vipModel.findByIdAndUpdate(_id, {...req.body});

            /** return user to the courses main page */
            res.redirect("/admin/panel/vips");
        } catch (err) {
            next(err);
        }
    }

    /**
     * toggle vip status
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async toggleStatus(req, res, next) {
        /** extract vip id from request params */
        const {_id} = req.params

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** read vip data from database based on _id */
            const vipType = await vipModel.findById(_id);

            /** return error if user was not found */
            if (!vipType)
                this.sendError(req.t("vip_notFound_error"), 404);

            /**
             * toggle vip status status.
             * if it's true change it to false
             * and if it's false make it true.
             * @type {boolean}
             */
            vipType.status = !vipType.status;

            /** update vip info in database */
            await vipType.save();

            /** redirect to previous page */
            this.redirectURL(req, res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new VipController();