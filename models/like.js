// Mongoose db Connection
var mongoose = require('mongoose');

var likeSchema = mongoose.Schema({
    content: String,
    user:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
    },
    create_date: String,
    update_date: String     
},
{ 
    timestamps: true
});
var Like = mongoose.model('Like', likeSchema);
module.exports = Like;