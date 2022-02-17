const usersData = require('../../data/users.data.json');
const users = require('./user.model'); 
const logger = require('../../logger/logger').logger;

/* To bootstrap all users into db after server start/restart. */
exports.bootstrapUsers = async() => {
    try{
        let user = await users.findOne({}).lean();
        if(!user){
            await users.insertMany(usersData);
            logger.info('Bootstrapped users into DB.');
        }
    }
    catch(error){
        logger.error(error.message);
    }
}

/* To get all users in the platform 
Assumption (temporary): Everyone is everyone's friend */
exports.getAllUsers = async(request, response, next) => {
    try {   
        let {pageNumber, limit} = request.query;

        if(!pageNumber || !limit) 
            throw new Error("Page number and limit is required");
        
        let allUsers = await users.find({}, {__v:0})
                        .sort({ vote: 1})
                        .skip(pageNumber > 0 ? pageNumber - 1 : 0)
                        .limit(limit)
                        .lean();

        logger.info('List of users sent');
        return response.status(200).json(allUsers);
    }
    catch(error){
        logger.error(error.message);
        response.status(400).json({ message: error.message });
    }
}