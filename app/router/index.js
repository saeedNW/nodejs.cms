/** import web routes */
const webRouter = require('./web');
/** import api routes */
const apiRouter = require('./api');
/** import csrf module */
const csrf = require('csurf');

exports.initializeRouters = (app) => {
    app.use('/api', apiRouter);

    /**
     * initialize csrf.
     * NOTE: every route define after
     * this initialization will be
     * forced to use csrf token
     */
    app.use(csrf({cookie: true}));

    app.use((req, res, next) => {
        /** set csrf token in app locals */
        app.locals.csrfToken = req.csrfToken();

        next();
    })

    app.use(webRouter);
}