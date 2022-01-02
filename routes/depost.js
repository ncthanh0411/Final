var express = require("express");
var router = express.Router();
var Depost = require("../models/Depost");
var User = require("../models/user");
var Department = require("../models/department");
const { contentType } = require("express/lib/response");

/* GET users listing. */
/* GET post listing. */

router.get("/", function (req, res, next) {
  // check login

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
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
        return res.render("depost", {
          departlst: departLst,
          layout: "playout",
          title: "Department Posts",
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

router.delete('/depost/delete/:id', (req, res, next) => {
    Notification.findByIdAndDelete(req.params.id)
        .then((result) => {
            return res.json({ isvalid: true, msg: result._id + ' had been deleted!!!' });
        })
        .catch((err) => {
            return res.json({ isvalid: false, msg: err });
        });
});

module.exports = router;
