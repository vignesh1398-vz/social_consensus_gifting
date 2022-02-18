const mongoose = require('mongoose');
const _ = require('lodash');

const shared_gifts = require('./shared_gifts.model');
const gifts = require('../gifts/gift.model');
const logger = require('../../logger/logger').logger;

const ObjectId = mongoose.Types.ObjectId;

/* To share a gift to one or many users. */
exports.shareGifts = async(request, response) => {
    try{
        let senderId = request.headers.id;
        let giftId = request.params.giftId;
        let { recipients } = request.body; //An array of userIds.
        if(!ObjectId.isValid(giftId))
            throw new Error('Gift Id should be an objectID');
        if(!recipients || !recipients.length)
            throw new Error('No users to share the gift with');
        
        let gift = await gifts.findById(giftId).lean();
        if(!gift)
            throw new Error('Gift not found in inventory');
        
        let sharedWith = {};
        _.forEach(recipients, (userId) => {
            sharedWith[userId] = {};
            sharedWith[userId].sharedTime = new Date().toISOString()
            sharedWith[userId].vote = 0;
        })
        let sharedGiftRecord = new shared_gifts({
            sender: senderId,
            gift: giftId,
            sharedWith: {...sharedWith}
        })

        await sharedGiftRecord.save();
        logger.info(`Successfully shared the gift with _id: ${giftId}`);
        response.status(200).json({
            id: sharedGiftRecord._id,
            message: "Successfully shared the gift with your buddies !!" 
        });
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({message: error.message });
    }
}