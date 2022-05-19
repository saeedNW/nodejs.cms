/** import multer module */
const multer = require('multer');
/** import mkdirp module */
const mkdirp = require('mkdirp');

/** import main middleware file */
const Middleware = require("./middleware");

class ImageUploader extends Middleware {
    /**
     * image upload directory definer method
     * @return {string}
     */
    uploadDirectory() {
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let day = new Date().getDate();

        return `./public/uploads/images/courses/${year}/${month}/${day}`
    }

    /**
     * image upload directory definer method
     * @type {DiskStorage}
     */
    imageStorage = multer.diskStorage({
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
            const fileName = `${new Date().getTime()}-${file.originalname.replace(/\s/g, '-')}`;

            cb(null, fileName);
        }
    })

    /**
     * image uploader middleware main method
     * @type {Multer|undefined}
     */
    imageUploader = multer({
        storage: this.imageStorage,
    })
}

module.exports = new ImageUploader();

//
// /**
//  * image upload directory definer method
//  * @return {string}
//  */
// const uploadDirectory = () => {
//     let year = new Date().getFullYear();
//     let month = new Date().getMonth() + 1;
//     let day = new Date().getDate();
//
//     return `./public/uploads/images/courses/${year}/${month}/${day}`
// }
//
// /**
//  * setup multer diskStorage method
//  * @type {DiskStorage}
//  */
// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         /**
//          * set upload directory
//          * @type {string}
//          */
//         const uploadDir = uploadDirectory();
//
//         /** create upload directory */
//         mkdirp.manualSync(uploadDir);
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         const fileName = `${new Date().getTime()}-${file.originalname.replace(/\s/g, '-')}`;
//
//         cb(null, fileName);
//     }
// });
//
// /**
//  * image uploader middleware main method
//  * @type {Multer}
//  */
// const imageUploader = multer({
//     storage: imageStorage,
// });
//
// module.exports = imageUploader;