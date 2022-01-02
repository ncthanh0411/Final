var express = require("express");
var router = express.Router();
var Depost = require("../models/Depost");
var Notification = require("../models/notification");

var hbs = require("hbs");
var User = require("../models/user");
var Department = require("../models/department");
const { contentType, redirect } = require("express/lib/response");
//Register Helper

router.get("/", function (req, res, next) {
  res.redirect('/depost/page/1');
});
// Get list post pagination
router.get("/page/:page", function (req, res, next) {
  // check login

  if (!req.session.user && !req.session.email) {
    return res.redirect("/login");
  }
    let perPage = 10; // số lượng thông báo xuất hiện trên 1 page
    let page = req.params.page || 1; 
    let pagearray = []
  Department.find(function (err, departLst) {
    console.log('get depart list')
    if (err) return res.status(404).json({ msg: "DB error" });
    Notification.find()
      .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("department")
      .exec((err, depost_list) => {
        Notification.countDocuments((err, count) => {
          if (err) return next(err);
          // đếm để tính có bao nhiêu trang
          let pages = Math.ceil(count / perPage);

          for (i = 1; i <= pages; i++){
            if (pagearray < 10)
              pagearray.push(i);
          } 
          console.log(pagearray);
          return res.render("depost", {
            departlst: departLst,
            layout: "playout",
            title: "Department Posts",
            depost_list: depost_list,
            current: page, // page hiện tại
            pages: pages, // tổng số các page
            pagearray: pagearray,
          });
        })
      })

      // .then((depost_list) => {
      //   // if (!depost_list.img) {

      //   //   depost_list.img = "bloglist-1.jpg";
      //   // }
      //     return res.render("depost", {
      //       departlst: departLst,
      //       layout: "playout",
      //       title: "Department Posts",
      //       depost_list: depost_list,
      //       current: page, // page hiện tại
      //       pages: Math.ceil(count / perPage), // tổng số các page
      //     });
      // })
      // .catch((err) => {
      //   console.log(err);
      //   return res.status(404).json({ msg: "DB error" });
      // });

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
