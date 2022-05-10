/** import session module */
const session = require("express-session");
/** import connect-mongo module */
const MongoStore = require("connect-mongo");
/** import passport module */
const passport = require('passport');
/** import views global info middleware */
const {initVGInfo} = require("../middleware/viewsGlobalInfo");
/** import remember login handler */
const {rememberLogin} = require("../middleware/rememberLogin");


exports.initSession = (app, conn) => {
    /** config express session */
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            httpOnly: true
        },
        store: MongoStore.create({mongoUrl: conn.connection.client.s.url})
    }));

    /** initialize passport module */
    app.use(passport.initialize());
    app.use(passport.session());

    /** initialize remember login */
    app.use(rememberLogin);

    /** initialize global values for views */
    initVGInfo(app)
}