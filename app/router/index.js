/** import web routes */
const webRouter = require('./web');
/** import api routes */
const apiRouter = require('./api');

exports.initializeRouters = (app) => {
    app.use(webRouter);
    app.use('/api', apiRouter);
}