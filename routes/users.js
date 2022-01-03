var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
const saltRounds = 10;

var User = require("../models/user");
var Department = require("../models/department");
var Notification = require("../models/notification");

router.get("/", function (req, res, next) {
  // check login
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  if(req.session.role == 2 || !req.session.user) {
      return res.redirect('/');
  }
  User.findOne({ username: req.session.user })
    .populate("department")
    .then(user => {
      return res.render('user', {
        layout: "alayout",
        title: "Users Page",
        user: user
      })
    })
    .catch(err => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    })
});

router.post('/notiPost', (req, res, next) => {
  var userid = req.body.id;
  var depart = req.body.depart;
  var title = req.body.title;
  console.log(title);
  var content = req.body.content;
  if(!title) return res.json({ isvalid: false, msg: 'Vui lòng ghi tiêu đề bài đăng!' });
  User.findOne({ _id: userid })
      .populate('department')
      .then(user => {
        var newNoti = new Notification({
          title: title,
          content: content,
          department: depart,
          user: userid
        });
        newNoti.save((err, notification) => {
          if(err) res.status(404).json({ isvalid: false, msg: err });
          user.notification.push(notification.id);
          user.save();
          Department.findById(depart)
              .then(mydepart => {
                mydepart.notification.push(notification.id);
                mydepart.save();
                return res.json({ isvalid: true, mydepartName: mydepart.departmentName, mynotiId: notification.id });
              })
              .catch(err => {
                console.log(err);
                return res.status(404).json({ msg: "DB error" });
              })
        })
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({ msg: "DB error" });
      })
});


router.get("/mypost", function (req, res, next) {
  // check login
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  if (req.session.role == 2 || !req.session.user) {
    return res.redirect("/");
  }
  User.findOne({ username: req.session.user })
    .populate("department")
    .then((user) => {
      return res.render("user", {
        layout: "alayout",
        title: "User Posts",
        user: user,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    });
});


module.exports = router;
