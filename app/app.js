/** import express module */
const express = require('express');
/** import body-parser module */
const bodyParser = require("body-parser");
/** import cookie parser */
const cookieParser = require('cookie-parser');
/** import flash module */
const flash = require('connect-flash');
/** import morgan module */
const morgan = require('morgan');
/** import method-override module */
const methodOverride = require("method-override");
/** create app instance */
const app = express();
/** import express session module */
const session = require("express-session");
/** import passport module */
const passport = require("passport");

/** import mongoose connection method */
const {DBConnection} = require('./config/db');
/** import rest api router initializer */
const {initializeApiRoutes} = require('./router/api');
/** import web api router initializer */
const {initializeWebRoutes} = require('./router/web');
/** import view engine and ejs config initializer */
const {initViewEngine} = require("./config/initViewEngine");
/** import unique identifier core */
const {identifierInitializer} = require("./core/initIdentifierCollection");
/** import session configs */
const sessionConfigs = require("./config/sessionConfig");
/** import login remember middleware */
const {rememberLogin} = require("./middleware/rememberLogin");
/** import vies global info configuration */
const {viewsGlobalInfo} = require("./config/viewsGlobalInfo");

/**
 * define server port
 * @type {number|number}
 */
const PORT = parseInt(process.env.PORT, 10) || 3000;

/** print application runtime environment */
console.log(`application running in ${process.env.NODE_ENV} environment`);

/** initialize morgan for dev environment */
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));


module.exports = class Application {
    constructor() {
        this.applicationConfigs();

        /**
         * initialize database connection
         */
        DBConnection()
            .then(conn => {
                console.log(`MongoDB Connected: ${conn.connection.host}`);

                /** starting application */
                this.startApplication();

                /** initialize routers */
                this.setRouters();

                /** Initialize identifier collection */
                return  identifierInitializer();
            })
            .catch(err => {
                console.log(err);
                process.exit(1);
            });
    }

    /**
     * middlewares configuration
     */
    applicationConfigs() {
        /** initialize passport local strategy */
        require("./passport/passportLocal");
        require("./passport/passportGoogle");

        /** initialize view engine and ejs config */
        initViewEngine(app, express);

        /** initialize bodyparser module */
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
        app.use(bodyParser.text());
        app.use(bodyParser.json({type: 'application/json'}));

        /** initialize method-override module */
        app.use(methodOverride("_method"));

        /** initialize express session */
        app.use(session({...sessionConfigs}));

        /** initialize cookieParser module */
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

        /** initialize flash message */
        app.use(flash());

        /** initialize passport module */
        app.use(passport.initialize());
        app.use(passport.session());

        /** initialize remember login */
        app.use(rememberLogin);

        /** initialize global values for views */
        viewsGlobalInfo(app);
    }

    /**
     * starting application
     */
    startApplication() {
        /** Starting application */
        app.listen(PORT, () => {
            console.log(`Application Running On Port: ${PORT}`);
        });
    }

    /**
     * initialize application routers
     */
    setRouters() {
        /** Initialize web api */
        initializeWebRoutes(app);
        /** Initialize rest api */
        initializeApiRoutes(app);
    }
}