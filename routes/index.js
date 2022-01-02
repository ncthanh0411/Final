var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const saltRounds = 10;
const multer = require('multer');
var upload = multer({ dest: './public/images/avatars/' });
const fs = require('fs');
var moment= require('moment') 

var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');
var Department = require("../models/department");
var Notification = require('../models/notification');

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("session1" + req.session.user);
  console.log("session2" + req.session.email);

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  console.log("role: ", req.session.role);
  Post.find()
    .sort({createdAt: -1})
    .populate()
    .populate("user")
    .populate({
      path: "comment",
      populate: [
        {
          path: "user",
        },
      ],
      options: { sort: { createdAt: -1 } },
    })
    .then((post) => {
      User.findOne({ email: req.session.email }, (error, user) => {
        if (error || !user) {
          return res.status(404).json({ message: error });
        }
        //return res.status(200).json(post);
        res.render("index2", { post: post, user: user });
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("index2");
    });
});

router.get("/login", function (req, res, next) {
  if (req.session.user || req.session.email) {
    res.redirect("/");
  }
  res.render("login", { title: "Login", layout: false });
});

router.get("/logout", function (req, res, next) {
  if (req.session.user || req.session.email) {
    delete req.session.user;
    delete req.session.email;
  }
  
  res.status(200).redirect("/login");
});

router.post("/login", function (req, res, next) {
  console.log(req.body);

  var username = req.body.username;
  var name = req.body.name;
  var email = req.body.email;
  var pass = req.body.password;
  var id_gg = req.body.id_gg;

  if (email) {
    User.findOne({ email: email }, (error, user) => {
      if (!error && user) {
        req.session.email = user.email;
        req.session.role = user.role;
        return res.status(200).json({ message: "Student login sucessfull" });
      }

      //Check if student first login -> Save to DB
      let user_new = new User({
        name: name,
        email: email,
        id_gg: id_gg,
        role: 2,
      });
      user_new.save((err, user_new) => {
        console.log(err);
        if (err) {
          return res
            .status(404)
            .json({ error: "DB Error, please login again" });
        }
        req.session.email = user_new.email;
        req.session.role = user_new.role;
        return res.status(200).json({ message: "Student login sucessfull" });
      });
    });
  }

  //For Admin or phòng ban
  User.findOne({ username: username }, (error, user) => {
    if (error || !user) {
      // req.session.flash = {
      //   msg: 'Không tìm thấy email trong dữ liệu'
      // }
      return res.redirect("/login");
    }
    console.log(user);
    bcrypt.compare(pass, user.password).then(function (result) {
      console.log(result);
      if (result) {
        req.session.user = user.username;
        req.session.role = user.role;
        return res.redirect("/");
      }
      // req.session.flash = {
      //   msg: 'Sai email hoặc mật khẩu'
      // }
      return res.redirect("/login");
    });
  });
});

// CongP 02.12.21 Update

router.get("/test", function (req, res, next) {
  res.render("edit");
});

// CongP 06.12.21 Update
router.get("/me", function (req, res, next) {
  console.log("session1" + req.session.user);
  console.log("session2" + req.session.email);

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  console.log("role: ", req.session.role);
  Post.find({})
    .populate()
    .populate("user")
    .populate({
      path: "comment",
      populate: [
        {
          path: "user",
        },
      ],
      options: { sort: { createdAt: -1 } },
    })
    .then((post) => {
      User.findOne({ email: req.session.email }, (error, user) => {
        if (error || !user) {
          return res.status(404).json({ message: error });
        }
        //return res.status(200).json(post);
        res.render("me", { post: post, user: user });
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("me");
    });
});

router.get("/me/:id", function (req, res, next) {
  console.log("session1" + req.session.user);
  console.log("session2" + req.session.email);

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  console.log("role: ", req.session.role);

  User.findOne({ email: req.session.email })
      .then((user) => {
        console.log(req.params.id)
        User.findOne({ _id: req.params.id })
            .populate({
              path:"post",
              populate:
              [
                { path: "user"},
                [{
                  path: "comment",
                  populate: 
                    {
                      path: "user"
                    }
                }]
              ]
            })        
            .then((user_show) => {
              res.json(user_show)

            })
            .catch((error) => {
              console.log(error);
              res.render("me");
            });  
      })
      .catch((error) => {
        console.log(error);
        res.render("me");
      }); 
     
});

router.get("/edit/:id", function (req, res, next) {
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  Department.find({ role: 1 })
    .then(departLst => {
      let mydepartLst = [];
      User.findOne({ _id: req.params.id })
        .populate('department')
        .then(user => {
          if(user.role == 2 && user.email == req.session.email) {
            departLst.forEach(depart => {
              if(depart.id != user.department[0].id) mydepartLst.push(depart)
            })
            return res.render('edit', { user: user, departLst: mydepartLst, userDepart: user.department[0] });
          } else {
            return res.redirect('/');
          }
        })
        .catch(err => {
          console.log(err);
          return res.status(404).redirect('/404');
        })
    })
    .catch(err => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    });
});

router.put("/edit/:id", upload.single('edit_upload_img'), function (req, res, next) {
  var dataform = req.body;
  console.log(dataform)
  var imgfile = req.file;
  console.log(imgfile);
  // fs.unlinkSync('../images/avatars/576e04ef0e071322dfae480299a183d0');
  User.findOne({ _id: req.params.id })
    .populate('department')
    .then(user => {
      // if(dataform.edit_user_pw || dataform.edit_user_newpw || dataform.edit_user_confnewpw) {
      //   if(!dataform.edit_user_pw) return res.json({ isvalid: false, msg: 'Please enter your old password' });
      //   var checkpass = bcrypt.hashSync(dataform.edit_user_pw, saltRounds);
      //   if(checkpass != user.password) return res.json({ isvalid: false, msg: 'Your old password wrong' });
      //   if(!dataform.edit_user_newpw) return res.json({ isvalid: false, msg: 'Please enter your new password' });
      //   if(!dataform.edit_user_confnewpw) return res.json({ isvalid: false, msg: 'Please enter confirm new password' });
      //   if(dataform.edit_user_newpw != dataform.edit_user_confnewpw) return res.json({ isvalid: false, msg: 'Wrong confirm new password' });
      //   user.password = dataform.edit_user_newpw;
      // }
      user.name = dataform.edit_user_name;
      user.class = dataform.edit_user_class;
      user.department = dataform.states;
      if(imgfile) {
        if(user.image_url) fs.unlinkSync('public' + user.image_url);
        user.image_url = '/images/avatars/' + imgfile.filename;
      }

      user.save((err, update_user) => {
        console.log('user update: ', update_user);
        if (err) return res.status(404).json({ isvalid: false, msg: err });
        return res.json({ isvalid: true, msg: 'Update success' });
      })
    })
    .catch(err => {
      console.log(err);
      return res.status(404).redirect('/404');
    })
});

router.post('/avatarRm/:id', function(req, res) {
  var id = req.params.id;
  User.findOne({ _id: req.params.id })
    .then(user => {
      if(user.image_url) fs.unlinkSync('public' + user.image_url);
      user.image_url = '';

      user.save((err, update_user) => {
        if (err) return res.status(404).json({ isvalid: false, msg: err });
        return res.json({ isvalid: true, msg: 'Update success' });
      })
    })
    .catch(err => {
      console.log(err);
      return res.status(404).redirect('/404');
    })
});

router.get("/posts", function (req, res, next) {
  res.render("posts", { layout: "alayout.hbs", title: "Department Posts" });
});

// router.get("/depost", function (req, res, next) {
//   res.render("depost", { layout: "playout.hbs", title: "Department Posts" });
// });

// router.get("/depost", function (req, res, next) {
//   // check login

//   if (!req.session.user && !req.session.email) {
//     return res.redirect("/login");
//   }
//   Department.find(function (err, departLst) {
//     if (err) return res.status(404).json({ msg: "DB error" });
//     User.find({ $or: [{ role: 1 }, { role: 2 }] })
//       .populate("department")
//       .then((userLst) => {
//         let user_depart_lst = [];
//         let user_stu_lst = [];

//         userLst.forEach((user) => {
//           if (user.role == 1) user_depart_lst.push(user);
//           else user_stu_lst.push(user);
//         });
//         return res.render("depost", {
//           departlst: departLst,
//           layout: "playout",
//           title: "Department Posts",
//           user_depart_lst: user_depart_lst,
//           user_stu_lst: user_stu_lst,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//         return res.status(404).json({ msg: "DB error" });
//       });
//   });
// });

router.get("/detail/:id", function (req, res, next) {
  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  Notification.findOne({ _id: req.params.id })
    .populate('department')
    .then(myNoti => {
      var mapNoti = {
        id: myNoti.id,
        title: myNoti.title,
        content: myNoti.content,
        department:  myNoti.department._id,
        departmentName: myNoti.department.departmentName,
        user: myNoti.user,
        date: moment(myNoti.updatedAt).format('DD/MM/YYYY')
      };
      return res.render('detail', {
        layout: 'playout.hbs',
        title: "Detail Posts",
        noti: mapNoti
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(404).json({ msg: "DB error" });
    });
});

module.exports = router;
