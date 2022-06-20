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
/** import i18next module */
const i18next = require("i18next");
/** import i18next-fs-backend module */
const i18nextBackend = require("i18next-fs-backend");
/** import i18next-http-middleware module */
const i18nextMiddleware = require("i18next-http-middleware");


/** import mongoose connection method */
const {DBConnection} = require('./config/databaseConfig');
/** import routers initializer */
const {initializeRouters} = require('./router');
/** import view engine and ejs config initializer */
const {viewEngineInitializer} = require("./config/viewEngineConfig");
/** import unique identifier collection initializer */
const {identifierInitializer} = require("./initializer/initIdentifierCollection");
/** import session configs */
const {sessionConfig} = require("./config/sessionConfig");
/** import login remember middleware */
const {rememberLogin} = require("./middleware/rememberLogin");
/** import vies global info configuration */
const ViewsLocalsConfig = require("./config/viewsLocalsConfig");
/** import error handler */
const {errorHandler, notfound} = require("./middleware/errorHandler");
/** import permission collection initializer */
const {permissionsInitializer} = require("./initializer/initPermissionCollecion");
/** import super admin account initializer */
const {adminAccountInitializer} = require("./initializer/initAdminUser");
/** import i18next initialization configs */
const {localizationConfigs, setDefaultLanguage} = require("./config/localizationConfig");

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
        /** initialize application configs */
        this.applicationConfigs();

        /**
         * initialize database connection
         */
        DBConnection()
            .then(async conn => {
                console.log(`MongoDB Connected: ${conn.connection.host}`);

                /** Initialize identifier collection */
                await identifierInitializer();

                /** initialize permissions collection */
                await permissionsInitializer();

                /** initialize admin account */
                await adminAccountInitializer();

                /** starting application */
                this.startApplication();

                /** initialize routers */
                this.setRouters();
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
        viewEngineInitializer(app, express);

        /** initialize bodyparser module */
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
        app.use(bodyParser.text());
        app.use(bodyParser.json({type: 'application/json'}));

        /** initialize method-override module */
        app.use(methodOverride("_method"));

        /** initialize express session */
        app.use(session({...sessionConfig()}));

        /** initialize cookieParser module */
        app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

        /** initialize flash message */
        app.use(flash());

        /** initialize passport module */
        app.use(passport.initialize());
        app.use(passport.session());

        /** initialize remember login */
        app.use(rememberLogin);

        /** initialize default language for i18next */
        app.use(async (req, res, next) => {
            setDefaultLanguage(req);
            await i18next.reloadResources();
            next();
        })

        /**
         * internationalization (i18next)
         * configuration and initialization
         */
        i18next.use(i18nextBackend).use(i18nextMiddleware.LanguageDetector)
            .init({...localizationConfigs()}).then();

        /** initialize i18nextMiddleware */
        app.use(i18nextMiddleware.handle(i18next));

        /** initialize global values for views */
        app.use(async (req, res, next) => {
            app.locals = await new ViewsLocalsConfig(req, res).viewsLocals();
            next();
        })
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
        /** Initialize routers */
        initializeRouters(app);
        /** initialize error handlers */
        app.use(errorHandler, notfound);
    }
}