var mongoose = require('mongoose');
var validator = require('validator');

var Schema = mongoose.Schema;

var giftSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    vote: {
        required: true,
        type: Number,
        default: 0
    }
});

giftSchema.index({ name: "text" });

const gifts = mongoose.model('gifts', giftSchema);
module.exports = gifts;