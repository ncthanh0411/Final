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

module.exports = router;
