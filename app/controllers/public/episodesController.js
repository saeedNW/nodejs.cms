/** import models */
const {episodeModel} = require("../../models").model;
/** import path module */
const path = require("path");
/** import file system module */
const fs = require("fs");
/** import bcryptjs */
const bcrypt = require("bcryptjs");

/** import main controller file */
const Controller = require("../controller");

class EpisodesController extends Controller {
    /**
     * episode download process
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async downloadProcess(req, res, next) {
        /** extract episode _id from request query */
        const {e: _id} = req.query;

        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** check episode existence */
            const episode = await episodeModel.findById(_id).populate("course");

            /** return error if course was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجو ندارد", 404);

            /**
             * auth variable will be used to create secure download link
             * @type {{loginCheck: *, user}}
             */
            const auth = {
                user: req.user,
                loginCheck: req.isAuthenticated()
            }

            /** creating secure link */
            const secureDownloadLink = episode.episodeDownload(auth, await this.userCanUse(req, episode.course))

            /** check if download link is accessible for user or not */
            if (secureDownloadLink === "#")
                this.sendError("شما اجازه دانلود این فایل را ندارید", 403);

            /** redirect user to download link */
            res.redirect(secureDownloadLink)
        } catch (err) {
            next(err);
        }
    }

    /**
     * download requested episode
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async downloadEpisode(req, res, next) {
        /** extract episode _id from request params */
        const {episode: _id} = req.params;
        try {
            /** return error if given id is not a valid id */
            this.mongoObjectIdValidation(_id);

            /** check episode existence */
            const episode = await episodeModel.findById(_id);

            /** return error if course was not found */
            if (!episode)
                this.sendError("چنین جلسه ای وجو ندارد", 404);

            /** return error if download link is expired */
            if (!this.checkDownloadLink(req, episode))
                this.sendError("لینک دانلود فاقد اعتبار است", 403);

            /**
             * create file absolute path
             * @type {string}
             */
            const filePath = path.resolve(`./public/downloads/${episode.episodeUrl}`);

            /** return error if requested file doesn't exists */
            if (!fs.existsSync(filePath))
                this.sendError("چنین جلسه ای وجو ندارد", 404);

            /** start download */
            res.download(filePath);
        } catch (err) {
            next(err);
        }
    }

    /**
     * check the validity of the download link
     * @param req
     * @param episode
     * @return {*}
     */
    checkDownloadLink(req, episode) {
        /** get current time */
        const timestamps = new Date().getTime();
        /** check if link time has been expired or not */
        if (req.query.t < timestamps) return false;

        /** recreate secret mac from data received from request */
        let secretMac = `${process.env.EPISODE_SECRET_MAC}${episode._id}${req.query.t}${req.user._id}`;

        /** check the validity of the secret mac */
        return bcrypt.compareSync(secretMac, req.query.mac)
    }
}

module.exports = new EpisodesController();