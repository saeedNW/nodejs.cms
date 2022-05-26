/** import passport */
const passport = require("passport");
/** import passport-local */
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
/** import user hash id generator */
const {nextUserHashId} = require("../core/nextUserHashId");
/** import user model */
const {userModel} = require("../models").model


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
        done(err, user);
    });
});

/** passport register with Google OAuth2 */
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_LOGIN_CLIENT_KEY,
        clientSecret: process.env.GOOGLE_LOGIN_SECRET_KEY,
        callbackURL: process.env.GOOGLE_LOGIN_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let {email, name, sub} = profile._json

            /** set email to lower case */
            email = email.toLowerCase();

            /** check user existence */
            const findUser = await userModel.findOne({email}, {passport: 0});

            /** continue on user login */
            if (findUser) return done(null, findUser);

            /** generate new user hash id */
            const hashId = await nextUserHashId();

            /** create new user */
            const newUser = await userModel.create({
                hashId,
                name,
                email,
                password: sub
            });

            done(null, newUser);
        } catch (err) {
            done(err);
        }
    }
));