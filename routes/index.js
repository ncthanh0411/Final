var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var User = require('../models/user');

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("session1" + req.session.user);
  console.log("session2" + req.session.email);

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  console.log("role: ", req.session.role);
  res.render("index2", { title: "Express" });
});

router.get("/login", function (req, res, next) {
  if (req.session.user || req.session.email) {
    res.redirect("/");
  }
  res.render("login");
});

router.get("/logout", function (req, res, next) {
  if (req.session.user || req.session.email) {
    delete req.session.user;
    delete req.session.email;
  }
  res.status(200).redirect("/login");
});

router.post('/login', function(req, res, next) {

  console.log(req.body);

  var username = req.body.username
  var name = req.body.name
  var email = req.body.email
  var pass  = req.body.password
  var id_gg = req.body.id_gg

  if(email){
    User.findOne({ email: email }, (error, user) => {
      if(!error && user) {                              
        req.session.email = user.email;
        req.session.role  = user.role;
        return res.status(200).json({ message: 'Student login sucessfull' })      
      }

      //Check if student first login -> Save to DB
      let user_new = new User({
        name: name,
        email: email,
        id_gg: id_gg,
        role: 2
      })
      user_new.save((err, user_new) => {
        console.log(err)
        if(err){
          return res.status(404).json({ error: 'DB Error, please login again'})             
        }
        req.session.email = user_new.email;
        req.session.role  = user_new.role;           
        return res.status(200).json({ message: 'Student login sucessfull' })
      })                                                           
    })
  }

  //For Admin or phòng ban
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
