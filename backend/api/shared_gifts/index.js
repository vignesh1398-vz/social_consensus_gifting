const sharedGiftRouter = require('express').Router();
const sharedGiftController = require('./shared_gifts.controller');

sharedGiftRouter.post('/:giftId/share', sharedGiftController.shareGifts);

module.exports = sharedGiftRouter