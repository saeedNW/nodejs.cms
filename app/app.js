/** import express module */
const express = require('express');
/** import dotenv module */
const dotenv = require('dotenv');
/** import path module */
const path = require('path');
/** import body-parser module */
const bodyParser = require("body-parser");
/** import cookie parser */
const cookieParser = require('cookie-parser');
/** import flash module */
const flash = require('connect-flash');
/** import morgan module */
const morgan = require('morgan');
/** create app instance */
const app = express();

/** config .env file */
dotenv.config({path: path.resolve('./.env')});

/** import mongoose connection method */
const {DBConnection} = require('./config/db');
/** import rest api router initializer */
const {initializeApiRoutes} = require('./router/api');
/** import web api router initializer */
const {initializeWebRoutes} = require('./router/web');
/** import error handler and url not found middleware */
const {notFound, errorHandler} = require("./middleware/errorHandler");
/** import session initializer */
const {initSession} = require("./config/initSession");
/** import view engine and ejs config initializer */
const {initViewEngine} = require("./config/initViewEngine");
/** import unique identifier core */
const {identifierInitializer} = require("./core/initIdentifierCollection");


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

/** initialize passport local strategy */
require("./passport/passportLocal");
require("./passport/passportGoogle");

/** initialize view engine and ejs config */
initViewEngine(app, express, path)

/** initialize bodyparser module */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/json'}));


/** initialize cookieParser module */
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

/** initialize flash message */
app.use(flash());

/** initialize database connection */
DBConnection()
    .then(async conn => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        /** Initialize express session modules that depends on it */
        initSession(app, conn);

        /** Starting application */
        app.listen(PORT, () => {
            console.log(`Application Running On Port: ${PORT}`);
        });

        /** Initialize web api */
        initializeWebRoutes(app);
        /** Initialize rest api */
        initializeApiRoutes(app);
        /** Initialize ErrorHandler class route not found method */
        app.use(errorHandler, notFound);

        /** Initialize identifier collection */
        return identifierInitializer();
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    })


module.exports = app;

