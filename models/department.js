// Mongoose db Connection
var mongoose = require('mongoose');

var departmentSchema = mongoose.Schema({
    categoryName: String,
});
var Department = mongoose.model('Department', departmentSchema);
module.exports = Department;