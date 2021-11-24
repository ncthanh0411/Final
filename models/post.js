// Mongoose db Connection
var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    content: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    like:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "like"
    }],
    comment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }],    
    createdAt: Date
});
var Post = mongoose.model('Post', postSchema);
module.exports = Post;