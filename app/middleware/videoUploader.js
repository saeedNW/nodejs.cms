/** import multer module */
const multer = require('multer');
/** import mkdirp module */
const mkdirp = require('mkdirp');

/** import main middleware file */
const Middleware = require("./middleware");

class VideoUploader extends Middleware {
    /**
     * image upload directory definer method
     * @param req
     * @return {string}
     */
    uploadDirectory() {
        return `./public/downloads/temp`
    }

    /**
     * image upload directory definer method
     * @type {DiskStorage}
     */
    fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            /**
             * set upload directory
             * @type {string}
             */
            const uploadDir = this.uploadDirectory();

            /** create upload directory */
            mkdirp.manualSync(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const fileName = file.originalname.replace(/\s/g, '-');

            cb(null, fileName);
        }
    })

    /**
     * image uploader middleware main method
     * @type {Multer|undefined}
     */
    videoUploader = multer({
        storage: this.fileStorage,
    })
}

module.exports = new VideoUploader();