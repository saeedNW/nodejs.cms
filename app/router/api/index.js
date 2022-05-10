/** import public routes */
const publicRouter = require('./public');
const adminRouter = require('./admin');
const userRouter = require('./user');

exports.initializeApiRoutes = (app) => {
    app.use('/api/', publicRouter);
    app.use('/api/admin', adminRouter);
    app.use('/pi/users', userRouter);
}