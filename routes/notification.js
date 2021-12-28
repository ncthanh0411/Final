var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Department = require('../models/department');
var Notification = require('../models/notification');

// router.get('/', function(req, res, next) {
//     let newNoti = new Notification({
//         content: 'Thong bao nhâph học 3k9',
//         body: 'thông tin jjjjjkkkkk',
//         department: '619e4637ffd0d2c4833e20f6'
//     });

//     // get department
//     var depart = Department.findById('619e4637ffd0d2c4833e20f6');
//     // get user
//     var user = User.findById('61a63627bb3d051c44c0821b');
// });

router.post('/:id', function(req, res, next) {
    let userId = req.params.id;
    let content = req.body.content;
    let notibody = req.body.notibody;
    let department = req.body.department;
    User.findById(userId)
        .then(user => {
            if(!user) return res.status(404).json({ isvalid: false, msg: "User not found!" });

            if(!content) return res.json({ isvalid: false, msg: 'Vui lòng ghi tiêu đề bài đăng!' });

            let newNoti = new Notification({
                content: content,
                body: notibody,
                department: department,
                user: userId
            });
            newNoti.save((err, new_notification) => {
                if(err) return res.status(404).json({ isvalid: false, msg: err });
            });
        })
        .catch(err => {
            return res.status(404).json({ isvalid: false, msg: err });
        });
});

module.exports = router;