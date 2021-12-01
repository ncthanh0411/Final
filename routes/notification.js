var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Department = require('../models/department');
var Notification = require('../models/notification');

router.get('/', function(req, res, next) {
    let newNoti = new Notification({
        content: 'Thong bao nhâph học 3k9',
        body: 'thông tin jjjjjkkkkk',
    });

    // get department
    var depart = Department.findById('619e4637ffd0d2c4833e20f6');
    // get user
    var user = User.findById('61a63627bb3d051c44c0821b');
});

module.exports = router;