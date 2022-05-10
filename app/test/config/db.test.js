/** import database connection manager */
const {DBConnection} = require('../../config/db')

/** database connection unit test */
describe('database connection', () => {
    it('check connection', (done) => {
        DBConnection()
            .then(() => done())
            .catch((err) => done(err));
    });
});