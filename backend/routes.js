const giftRouter = require('./api/gifts');

module.exports = (app) => {
    app.use('/api/gift', giftRouter);
}
