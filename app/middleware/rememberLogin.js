/** import user model */
const {userModel} = require("../models").model;

/** import main middleware file */
const Middleware = require("./middleware");

class RememberLogin extends Middleware {
    /**
     * user login remember handler method
     * @param req
     * @param res
     * @param next
     * @return {Promise<void>}
     */
    async rememberLogin(req, res, next) {
        try {
            /** check if user is not logged in */
            if (!req.isAuthenticated()) {
                /** get remember token cookie from signed cookies if it exists */
                const {remember_token: rememberToken} = req.signedCookies;

                /** continue if remember token exists  */
                if (rememberToken) {
                    /** find user based on remember token */
                    const user = await userModel.findOne({rememberToken});

                    /** continue login process if user was found */
                    if (user) {
                        /** use passport login method for user login process */
                        req.logIn(user, err => {
                            /** throw error if there was any */
                            if (err) throw err;

                            /** continue login process */
                            return true;
                        });
                    }
                }
            }

            next();
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
}

module.exports = new RememberLogin();