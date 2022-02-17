const giftRouter = require('express').Router();
const giftController = require('./gift.controller');

giftRouter.get('/all', giftController.getAllGifts);

module.exports = giftRouter