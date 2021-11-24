// Mongoose db Connection
var mongoose = require('mongoose');

var departmentSchema = mongoose.Schema({
    departmentName: String,
});
var Department = mongoose.model('Department', departmentSchema);
module.exports = Department;