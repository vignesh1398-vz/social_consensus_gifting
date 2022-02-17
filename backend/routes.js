const giftRouter = require('./api/gifts');
const userRouter = require('./api/users');

module.exports = (app) => {
    app.use('/api/gift', giftRouter);
    app.use('/api/user', userRouter);
}
