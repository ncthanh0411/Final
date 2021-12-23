var express = require('express');
var moment= require('moment') 
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');
const { populate } = require('../models/user');
const multer = require('multer');

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
var upload = multer({ dest: './public/images/posts/' })
router.post('/', upload.single('img'),function(req, res, next) {

  var data = req.body;
  var you_url = req.body.video.replace('watch?v=', "embed/");
  var img = ''
  if(req.file){
    img = '/images/posts/' + req.file.filename;
  }
  
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }
    //post
    //Date
    var datetime = new Date();
    var c_date  = moment(datetime).format('YYYY-MM-DD h:mm:ss');
    var u_date  = c_date;
    //Post
    var post = new Post({
      content: data.content,
      youtube_url: you_url,
      image: img,
      user: user._id,
      create_date: c_date,
      update_date: u_date      
    });
    post.save(function (err, post) {
      if(err || !post) return res.status(404).json({ message: error }) 
      user.post.push(post._id)
      user.save((err, user_update) => {
        if(error || !user_update)
        if(err){
          return res.status(404).json({ error: 'DB Error, please login again'})             
        }
        post.populate('user', function(err) {
          return res.status(200).json(post)
         });
      })         
    });         
    
  })
});

//Edit Post
var upload = multer({ dest: './public/images/posts/' })
router.put('/', upload.single('img'),function(req, res, next) {
  console.log(req.body)
  console.log(req.file)

  return res.status(200).json({ data: 'test' }) 
});


//New Comment
router.post('/comment', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }

    //Get data from body
    let id_post = req.body.id_post;
    let comment_content = req.body.comment;  
    //post
    Post.findOne({_id: id_post }, (error, post) => {
      if(error || !post) {                              
        return res.status(404).json({ message: error })      
      }

      //comment     
      var datetime = new Date();
      var c_date  = moment(datetime).format('YYYY-MM-DD h:mm:ss');
      var u_date  = c_date;
      var comment = new Comment({
        content: comment_content,
        user: user._id,
        post: post._id,
        create_date: c_date,
        update_date: u_date
      });       
      console.log(comment)
      comment.save(function (err, comment) {
        if(err || !comment) return res.status(404).json({ message: error }) 
        post.comment.push(comment._id)
        post.save((err, post_update) => {
          if(error || !post_update)
          if(err){
            return res.status(404).json({ error: 'DB Error, please login again'})             
          }       
          comment_respond ={
            id: comment._id,
            content: comment_content,
            user_id: user._id,
            user_name: user.name,
            create_date: c_date,
            update_date: u_date
          }
          console.log(comment_respond)
          return res.status(200).json(comment_respond)
        })         
      });   
    })       
  })
});

//Edit Comment
router.post('/comment/:id', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }
    //Get data from body
    let id_comment = req.body.id;
    let content = req.body.comment; 
    console.log(id_comment)
    Comment.findOne({_id: id_comment }, (error, comment) => {
      if(error || !comment) {                              
        return res.status(404).json({ message: error })      
      }
      console.log(comment.user)
      console.log(user._id)
      if(String(comment.user) != String(user._id))
      {
        return res.status(404).json({ message: "You are not have permission to edit comment" })
      }
      comment.content = content;
      comment.save();
      return res.status(200).json({ message: "Comment edit succesfull" }) 
    })        
  })
});



//Delete Comment
router.delete('/comment/:id', function(req, res, next) {
  User.findOne({ email: req.session.email }, (error, user) => {
    if(error || !user) {                              
      return res.status(404).json({ message: error })      
    }
    let id = req.params.id;
    //post
    Comment.findOne({_id: id }, (error, comment) => {
      if(error || !comment) {                              
        return res.status(404).json({ message: error })      
      }
      if(String(comment.user) != String(user._id))
      {
        return res.status(404).json({ message: "You are not have permission to delete" })
      }
      comment.remove(function(error){
        if(error) {                              
          return res.status(404).json({ message: error })      
        }
        Post.findOne({_id: comment.post }, (error, post) => {
          post.comment.pull(id)
          post.save()
          return res.status(200).json({ message: "Delete comment succesfull" })
        })     
      })
   
    })       
  })
});
module.exports = router;
