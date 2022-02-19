const _ = require('lodash');
const users = require('../api/users/user.model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.transformAllSharedGifts= async (records) => {
    let hashMap = {};
    let result = [];
    _.forEach((records), (record) => {
        hashMap[record._id] = {};
        hashMap[record._id]['_id'] = record._id;
        hashMap[record._id]['gift'] = record.gift.name;
        hashMap[record._id]['votes'] = 0;
        hashMap[record._id]['sharedWith'] = record.sharedWith;

        _.forOwn(record.sharedWith, (value, key) => {
            hashMap[record._id]['votes'] += value.vote
        });
    })

    _.forOwn(hashMap, (value, key) => {
        result.push(value);
    })

    result = _.sortBy(result, (r) => {return !r.votes});
    for(let record of result) {
        let userIds = Object.keys(record.sharedWith);
        for(let uid of userIds) {
            let user = await users.findById(ObjectId(uid));
            record.sharedWith[uid].name = user.name;
        }
    }

    return result;
}