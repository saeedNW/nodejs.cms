/** import passport module */
const passport = require("passport");

/** import main controller file */
const Controller = require("../controller");

class GoogleController extends Controller {
    /**
     * user OAuth2 register process
     * @param req
     * @param res
     * @param next
     */
    process(req, res, next) {
        /** call for Google OAuth2 API with passport strategy */
        passport.authenticate('google', {
            scope: ['profile', 'email'] /** requesting for user profile info and email address */
        })(req, res, next);
    }

    /**
     * Google OAuth2 response callback
     * @param req
     * @param res
     * @param next
     */
    callback(req, res, next) {
        /** end the Google OAuth2 registration process */
        passport.authenticate('google', {
            successRedirect: "/",
            failureRedirect: "/auth/register",
        })(req, res, next);
    }
}

module.exports = new GoogleController();