/** import passport */
const passport = require("passport");
/** import passport-local */
const LocalStrategy = require("passport-local").Strategy;
/** import user model */
const {userModel} = require("../models").model
/** import user hash id generator */
const {nextUserHashId} = require("../core/nextUserHashId");


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
        done(err, user);
    });
});

/** passport register with username and password process */
passport.use("local.register", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        /** set email to lower case */
        email = email.toLowerCase();

        /** check user existence */
        const findUser = await userModel.findOne({email});

        /** send back error if user already exists */
        if (findUser)
            return done(null, false, req.flash("errors", "کاربری با این آدرس ایمیل از پیش در سامانه ثبت شده است"));

        /** generate new user hash id */
        const hashId = await nextUserHashId();

        /** create new user */
        const newUser = await userModel.create({...req.body, hashId});

        done(null, newUser);
    } catch (err) {
        done(err, false, req.flash("errors", "ثبت نام با موفقیت انجام نشد، لطفا مجددا تلاش نمایید."));
    }
}));


/** passport login with username and password process */
passport.use("local.login", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        /** set email to lower case */
        email = email.toLowerCase();

        /** check user existence */
        const findUser = await userModel.findOne({email});

        /** send error if user was not found or user password was wrong */
        if (!findUser || !findUser.comparePassword(password))
            return done(null, false, req.flash("errors", "اطلاعات وارد شده صحیح نمی باشند."));

        done(null, findUser);
    } catch (err) {
        done(err, false, req.flash("errors", "ورود با موفقیت انجام نشد، لطفا مجددا تلاش نمایید."));
    }
}));