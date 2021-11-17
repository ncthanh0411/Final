var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user){
    return res.redirect('/login');
  }
  console.log('role: ', req.session.role);
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
  username = req.body.username
  pass = req.body.password
  console.log(username);
  User.findOne({ username: username }, (error, user) => {
    if(error || !user) {
      // req.session.flash = {
      //   msg: 'Không tìm thấy email trong dữ liệu'
      // }
      return res.redirect('/login')
    }
    console.log(user);
    bcrypt.compare(pass, user.password).then(function(result){
      console.log(result)
      if(result){
        req.session.user = user.username;
        req.session.role = user.role;
        return res.redirect('/')
      }
      // req.session.flash = {
      //   msg: 'Sai email hoặc mật khẩu'
      // }
      return res.redirect('/login')
    })
  })
});

module.exports = router;
