var mongoose = require('mongoose');
var validator = require('validator');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: [3,'Username should be greater than 2 characters '],
        maxlength: [40, 'Username cannot be more than 40 characters']
    }
});

const users = mongoose.model('users', userSchema);
module.exports = users;