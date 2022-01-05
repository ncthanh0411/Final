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

router.get('/mypost/edit/:id', function(req, res, next) {
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  if (req.session.role == 2 || !req.session.user) {
    return res.redirect('/');
  }
  
  User.findOne({ username: req.session.user })
    .populate("department")
    .populate("notification")
    .then((user) => {
      var nextRun = false;
      user.notification.forEach(userNoti => {
        if(req.params.id == userNoti.id){
          nextRun = true;
        }
      });

      if(!nextRun) return res.redirect('/');
      Notification.findOne({ _id: req.params.id })
        .populate('department')
        .then(myNoti => {
          var mapNoti = {
            id: myNoti.id,
            title: myNoti.title,
            content: myNoti.content,
            department:  myNoti.department._id,
            departmentName: myNoti.department.departmentName,
          };

          return res.render("editNoti", {
            layout: "alayout",
            title: "Edit Posts",
            user: user,
            noti: mapNoti
          });
        })
        .catch(err => {
          console.log(err);
          return res.status(404).json({ msg: "DB error" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    });
});

router.post('/mypost/edit', function(req, res, next) {
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  if (req.session.role == 2 || !req.session.user) {
    return res.redirect('/');
  }

  var id = req.body.id;
  var depart = req.body.depart;
  var title = req.body.title;
  var content = req.body.content;
  if(!title) return res.json({ isvalid: false, msg: 'Vui lòng ghi tiêu đề bài đăng!' });

  Notification.findById(id)
    .then(myNoti => {
      myNoti.department = depart;
      myNoti.title = title;
      myNoti.content = content;

      myNoti.save((err, edited_noti) => {
        if(err) res.status(404).json({ isvalid: false, msg: err });
        console.log('edit: ');
        return res.json({ isvalid: true, msg: 'Cập nhật bài đăng thành công!' });
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    });
});

module.exports = router;
