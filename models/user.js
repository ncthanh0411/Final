// Mongoose db Connection
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: Number,
    id_gg: String
});
var User = mongoose.model('User', userSchema);
module.exports = User;