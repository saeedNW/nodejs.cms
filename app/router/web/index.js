/** import public routes */
const publicRouter = require('./public');
/** import admin routes */
const adminRouter = require('./admin');
/** import user routes */
const userRouter = require('./user');

/** import admin access manager middleware */
const {adminAccessManager: AAM} = require("../../middleware/adminAccessManager");

/** initialize routers main files */
exports.initializeWebRoutes = (app) => {
    app.use('/', publicRouter);
    app.use('/admin/panel', AAM, adminRouter);
    app.use('/user/panel', userRouter);
}