// Mongoose db Connection
var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    content: String,
    user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
    },
    createdAt: Date
  
});
var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;