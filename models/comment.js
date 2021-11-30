// Mongoose db Connection
var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    content: String,
    user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
  },    
    createdAt: Date
  
});
var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;