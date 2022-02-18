const giftRouter = require('./api/gifts');
const sharedGiftRouter = require('./api/shared_gifts');
const userRouter = require('./api/users');

module.exports = (app) => {
    app.use('/api/gift', giftRouter);
    app.use('/api/gift', sharedGiftRouter);
    app.use('/api/user', userRouter);
}
