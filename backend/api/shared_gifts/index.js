const sharedGiftRouter = require('express').Router();
const sharedGiftController = require('./shared_gifts.controller');

sharedGiftRouter.post('/share/:giftId', sharedGiftController.shareGifts);
sharedGiftRouter.put('/share/:sharedGiftId', sharedGiftController.modifySharedGift);
sharedGiftRouter.get('/share/:userId/all', sharedGiftController.allSharedGifts);
sharedGiftRouter.get('/share/:userId/notifications', sharedGiftController.viewAllNotifications);

module.exports = sharedGiftRouter