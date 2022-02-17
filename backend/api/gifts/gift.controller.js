const logger = require('../../logger/logger').logger;
const giftsData = require('../../data/gifts.data.json');
const gift = require('./gift.model');

// To bootstrap all gifts into db after server start/restart.
exports.bootstrapGifts = async () => {
    try{
        let giftRecord = await gift.findOne({}).lean();
        if(!giftRecord) {
            await gift.insertMany(giftsData);
            logger.info('Gifts bootstrapped into the db');
        }
    }
    catch(error){
        logger.error(error.message);
    }
}

/* Get all gifts in the catalog sorted by votes by default. */
exports.getAllGifts = async(request, response, next) => {
    try{
        let {pageNumber, limit} = request.query;

        if(!pageNumber || !limit) 
            throw new Error("Page number and limit is required");
        
        let gifts = await gift.find({})
                        .sort({ vote: 1})
                        .skip(pageNumber > 0 ? pageNumber - 1 : 0)
                        .limit(limit)
                        .lean();

        logger.info('List of gifts sent');
        return response.status(200).json(gifts);
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({message: error.message });
    }
}