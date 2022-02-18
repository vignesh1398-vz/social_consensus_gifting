var mongoose = require('mongoose');
var validator = require('validator');

var Schema = mongoose.Schema;

var sharedGiftSchema = new Schema({
    gift: {
        required: true,
        type: Schema.Types.ObjectId,  
        ref: 'gifts'
    },
    sender: {
        required: true,
        type: Schema.Types.ObjectId,  
        ref: 'users'
    },
    sharedWith: {
        type: Object
    }
});


const shared_gifts = mongoose.model('shared_gifts', sharedGiftSchema);
module.exports = shared_gifts;