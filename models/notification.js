// Mongoose db Connection
var mongoose = require('mongoose');
var notificationSchema = mongoose.Schema({
    content: String,
    body: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    createdAt: Date
});
var Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;