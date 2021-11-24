// Mongoose db Connection
var mongoose = require('mongoose');

var likeSchema = mongoose.Schema({
    content: String,
    user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
    },
    createdAt: Date
  
});
var Like = mongoose.model('Like', likeSchema);
module.exports = Like;