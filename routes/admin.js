var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
const saltRounds = 10;

var User = require("../models/user");
var Department = require("../models/department");

// AllPosts.findOne({ user: req.params.userid })
// .populate({path: 'housingposts', options: { sort: { 'date': -1 } } })

router.get('/', function (req, res, next) {
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
            .populate('department')
            .then(userLst => {
                let user_depart_lst = [];
                let user_stu_lst = [];

                userLst.forEach(user => {
                    if(user.role == 1)
                        user_depart_lst.push(user);
                    else
                        user_stu_lst.push(user);
                });
                return res.render("admin2", {
                    departlst: departLst,
                    layout: "alayout",
                    title: "Admin Page",
                    user_depart_lst: user_depart_lst,
                    user_stu_lst: user_stu_lst,
                });
            })
            .catch(err => {
                console.log(err);
                return res.status(404).json({ msg: "DB error" });
            });
    });
});

router.post("/newDepartment", function (req, res, next) {
  let newDep = req.body.department;
  if (!newDep)
    return res.json({ isvalid: false, msg: "Chưa nhập tên phòng ban " });
  Department.findOne({ departmentName: newDep }, (error, user) => {
    if (error || user) {
      return res.json({
        isvalid: false,
        msg: "Đã tồn tại phòng ban, vui lòng nhập tên khác ",
      });
    }
    Department({
      departmentName: newDep,
    }).save((err, new_depart) => {
      if (err) return res.status(404).json({ isvalid: false, msg: err });
      return res.json({ isvalid: true, newdepart: new_depart });
    });
  });
});

router.post("/createUser", function (req, res, next) {
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let confpass = req.body.confpassword;
  let departlst = JSON.parse(req.body.department);

  if (!username)
    return res.json({ isvalid: false, msg: "Vui lòng nhập username " });
  if (!password)
    return res.json({ isvalid: false, msg: "Vui lòng nhập password " });
  if (password !== confpass)
    return res.json({
      isvalid: false,
      msg: "Confirm password không trùng khớp ",
    });

  User.findOne({ username: username }, (error, user) => {
    if (error || user) {
      return res.json({
        isvalid: false,
        msg: "Đã tồn tại username, vui lòng nhập tên khác ",
      });
    }
    bcrypt.hash(password, saltRounds).then(function (hash) {
      let newUser = new User({
        name: name,
        username: username,
        password: hash,
        role: 1,
      });
      departlst.forEach((departId) => {
        newUser.department.push(departId);
      });
      newUser.save((err, new_user) => {
        if (err) return res.status(404).json({ isvalid: false, msg: err });
        console.log(new_user._id);
        console.log(new_user.id);
        User.findOne({ _id: new_user.id })
        .populate('department')
        .then(result => {
          return res.json({ isvalid: true, newuser: result });
        })
        .catch(err => {
            console.log(err);
            return res.status(404).json({ msg: "DB error" });
        });
      });
    });
  });
});

// Delete department - done
router.delete("/delDepart", function (req, res, next) {
  let id = req.body.id;
  Department.findByIdAndDelete(id)
    .then((result) => {
      return res.json({
        isvalid: true,
        msg: "Department " + result.departmentName + " had been deleted",
      });
    })
    .catch((err) => {
      return res.json({ isvalid: false, msg: err });
    });
});

// Delete user - done
router.delete("/delUser", function (req, res, next) {
  let id = req.body.id;
  User.findByIdAndDelete(id)
    .then((result) => {
      return res.json({ isvalid: true });
    })
    .catch((err) => {
      return res.json({ isvalid: false, msg: err });
    });
});

// Update department - done
router.put("/upDepart/:id", function (req, res, next) {
  Department.findOne({ _id: req.params.id }, (err, depart) => {
    if (err) return res.status(404).json({ isvalid: false, msg: err });
    if (!depart)
      return res
        .status(404)
        .json({ isvalid: false, msg: "Department not found!" });
    if (!req.body.name)
      return res.json({ isvalid: false, msg: "Must enter department name" });
    else {
      depart.departmentName = req.body.name;
    }
    depart.save((err, depart_update) => {
      if (err) return res.status(404).json({ isvalid: false, msg: err });
      return res
        .status(200)
        .json({ isvalid: true, msg: "Department update successfull", editeddepart: depart_update });
    });
  });
});

// Update User - update
router.put("/upUser/:id", function (req, res, next) {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) return res.status(404).json({ isvalid: false, msg: err });
    if (!user)
      return res.status(404).json({ isvalid: false, msg: "User not found!" });
    // ....check some value must enter

    user.save((err, user_update) => {
      if (err) return res.status(404).json({ isvalid: false, msg: err });
      return res
        .status(200)
        .json({ isvalid: true, msg: "User update successfull" });
    });
  });
});

module.exports = router;
