var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
const saltRounds = 10;

var User = require("../models/user");
var Department = require("../models/department");

router.get("/", function (req, res, next) {
  // check login

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
  // if(req.session.role != 0) {
  //     return res.redirect('/');
  // }
  Department.find(function (err, departLst) {
    if (err) return res.status(404).json({ msg: "DB error" });
    User.find({ $or: [{ role: 1 }, { role: 2 }] })
      .populate("department")
      .then((userLst) => {
        let user_depart_lst = [];
        let user_stu_lst = [];

        userLst.forEach((user) => {
          if (user.role == 1) user_depart_lst.push(user);
          else user_stu_lst.push(user);
        });
        return res.render("user", {
          departlst: departLst,
          layout: "alayout",
          title: "Users Page",
          user_depart_lst: user_depart_lst,
          user_stu_lst: user_stu_lst,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(404).json({ msg: "DB error" });
      });
  });
});

module.exports = router;
