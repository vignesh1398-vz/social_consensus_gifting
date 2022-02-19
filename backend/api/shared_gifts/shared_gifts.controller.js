const mongoose = require('mongoose');
const _ = require('lodash');

const shared_gifts = require('./shared_gifts.model');
const gifts = require('../gifts/gift.model');
const logger = require('../../logger/logger').logger;
const { transformAllSharedGifts } = require('../../helper/shared_gifts.helper');

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

/* To add or remove users from an already shared gift. */
exports.modifySharedGift = async(request, response) => {
    try{
        let userId = request.headers.id;
        let sharedGiftId = request.params.sharedGiftId;
        let { recipients, vote } = request.body;
        
        if(!ObjectId.isValid(sharedGiftId))
            throw new Error('Shared gift id should be an ObjectID');
        
        if(!recipients && !vote)
            throw new Error('Request payload is empty');

        var sharedGiftRecord = await shared_gifts.findById(sharedGiftId);
        if(!sharedGiftRecord)
            throw new Error("Shared gift not found");
        
        let currentSharedUsers = Object.keys(sharedGiftRecord.sharedWith);
        /* The person who's shared the gift would like to 
        add or remove users from the shared gift. */ 
        if(userId == sharedGiftRecord.sender){

            // To add new buddies if any. 
            for(let userId of recipients) {
                if(!currentSharedUsers.includes(userId)) {
                    sharedGiftRecord.sharedWith[userId] = {};
                    sharedGiftRecord.sharedWith[userId].sharedTime = new Date().toISOString()
                    sharedGiftRecord.sharedWith[userId].vote = 0;
                }
            }

            // To remove buddies from a gift.
            _.forEach((currentSharedUsers), (userId) => {
                if(!recipients.includes(userId)){
                    delete sharedGiftRecord.sharedWith[userId];
                }
            })
        }

        /*If a buddy votes for his/her shared gift */
        else if(currentSharedUsers.includes(userId)) {
            if(sharedGiftRecord.sharedWith[userId].vote != 0)
                throw new Error('You have already shared your opinion');
            // if(new Date().getDay() - new Date(sharedGiftRecord.sharedWith[userId].sharedTime).getDay() > 1) // 1 day expiration
            if((new Date().getMinutes() - new Date(sharedGiftRecord.sharedWith[userId].sharedTime).getMinutes()) > 10) // 10 minutes expiry
                throw new Error("Time expired");
            if(vote != undefined && (vote == 1 || vote == -1)){
                sharedGiftRecord.sharedWith[userId].vote = vote;
                let giftRecord = await gifts.findById(sharedGiftRecord.gift);
                if(!giftRecord) 
                    throw new Error("Gift not found");
                giftRecord.vote += vote;
                await giftRecord.save();
            }
        }

        else    
            throw new Error("Invalid operation");

        await sharedGiftRecord.markModified('sharedWith');
        await sharedGiftRecord.save();
        logger.info('Modified shared gift.');

        response.status(200).json({
            id: sharedGiftId, 
            message: "Shared gift modified "
        })
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({ message: error.message });
    }
}

/* View all shared gifts (for sharer).*/
exports.allSharedGifts = async (request, response) => {
    try{
        let userId = request.params.userId;
        if(!ObjectId.isValid(userId))
            throw new Error('User id should be an ObjectID');
        
        let sharedGiftRecords = await shared_gifts.find({sender: ObjectId(userId)})
                                    .populate({
                                        path: 'gift'
                                    })
                                    .lean();

        let result = transformAllSharedGifts(sharedGiftRecords)

        logger.info(`List of all shared gifts sent for sender: ${userId}`);
        response.status(200).json(result);
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({message: error.message });
    }
}

/* View all gifts recieved for voting */
exports.viewAllNotifications = async(request, response) => {
    try {
        let userId = request.params.userId;
        if(!ObjectId.isValid(userId))
            throw new Error('User id should be an ObjectID');
        
        let notifications = await shared_gifts.aggregate([
            {
                $project: {
                    gift: 1,
                    sharedWith: {$objectToArray: "$sharedWith"},
                }
            },
            {
                $unwind: "$sharedWith"
            },
            {
                $match: {"sharedWith.k": userId}
            },
            {
                $lookup: {
                    'from': 'gifts',
                    'localField': 'gift',
                    'foreignField': '_id',
                    'as': 'gift'
                }
            },
            {
                $unwind: "$gift"
            },
            {
                $project: {
                    "gift.vote": 0,
                    "gift._id": 0,
                    "gift.__v": 0
                }
            },
            {
                $addFields: {
                    "sharedTime": "$sharedWith.v.sharedTime",
                    "vote": "$sharedWith.v.vote"
                }
            },
            {
                $unset: "sharedWith"
            }
        ]) 
        logger.info(`List of notifications sent for user: ${userId}`);
        response.status(200).json(notifications);
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({message: error.message });
    }
}