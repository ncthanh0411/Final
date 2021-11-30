var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');
const { populate } = require('../models/user');


/* GET users listing. */
/* GET post listing. */
router.get('/', function(req, res, next) {
  console.log('test Post')
  console.log(req.session.email)

  // Post.find({})
  //     .populate()
  //     .populate("user")
  //     .populate({
  //       path:"comment",
  //       populate:[{
  //         path: "user",
  //       }] 
  //     })
  //     .then( post => {
  //       console.log(post)
  //       return res.status(200).json({post})
  //     })
  //     .catch(error => {
  //       console.log(error)
  //     }) 


  User.findOne({ email: req.session.email })
      .populate("post")  
      .then( user => {
        console.log(user)
        return res.status(200).json({user})
      })
      .catch(error => {
        console.log(error)
      })   
});


//New post
router.post('/', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }
    //post
    var post = new Post({
      content: "bạn Minh xấu quá",
      user: user._id
    });
    post.save(function (err, post) {
      if(err || !post) return res.status(404).json({ message: error })
      
      console.log(post._id) 
      user.post.push(post._id)
      console.log(user)
      user.save((err, user_update) => {
        if(error || !user_update)
        if(err){
          return res.status(404).json({ error: 'DB Error, please login again'})             
        }        
        return res.status(200).json({ message: 'New post added' })
      })         
    });         
    
  })
});

//New Comment
router.get('/comment/:id', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }

    console.log(req.params.id);
    //post
    Post.findOne({ _id: req.params.id }, (error, post) => {
      if(error || !post) {                              
        return res.status(404).json({ message: error })      
      }
      //comment     
      var comment = new Comment({
        content: "Comment 1",
        user: user._id,
        post: post._id
      });       
      comment.save(function (err, comment) {
        if(err || !comment) return res.status(404).json({ message: error }) 
        post.comment.push(comment._id)
        post.save((err, post_update) => {
          if(error || !post_update)
          if(err){
            return res.status(404).json({ error: 'DB Error, please login again'})             
          }        
          return res.status(200).json({ message: 'New comment added' })
        })         
      });   
    })       
  })
});

module.exports = router;
