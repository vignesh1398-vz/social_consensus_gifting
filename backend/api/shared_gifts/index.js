const sharedGiftRouter = require('express').Router();
const sharedGiftController = require('./shared_gifts.controller');

sharedGiftRouter.post('/share/:giftId', sharedGiftController.shareGifts);
sharedGiftRouter.put('/share/:sharedGiftId', sharedGiftController.modifySharedGift);
sharedGiftRouter.get('/share/:userId/all', sharedGiftController.allSharedGifts);

module.exports = sharedGiftRouter