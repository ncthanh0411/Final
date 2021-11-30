// Mongoose db Connection
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    role: Number,
    id_gg: String,
    post:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    like:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    department: [String],
    class: String,
    stu_department: String,
    image_url: String,
    department: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    }]
});
var User = mongoose.model('User', userSchema);
module.exports = User;