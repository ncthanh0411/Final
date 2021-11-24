var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }

    //post
    var post = new Post({
      content: "bạn đẹp quá",
      company: user._id
    });
    post.save(function (err) {
      if(err) return console.error(err.stack)
      console.log("New post added")
    });       
    
  })
});

module.exports = router;
