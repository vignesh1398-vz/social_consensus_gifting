const giftRouter = require('express').Router();
const giftController = require('./gift.controller');

giftRouter.get('/all', giftController.getAllGifts);
giftRouter.get('/:keyword/search', giftController.search);

module.exports = giftRouter