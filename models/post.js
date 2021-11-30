// Mongoose db Connection
var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    content: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    like:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    comment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],    
    createdAt: Date
});
var Post = mongoose.model('Post', postSchema);
module.exports = Post;