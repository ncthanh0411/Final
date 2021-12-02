// Mongoose db Connection
var mongoose = require('mongoose');
var notificationSchema = mongoose.Schema({
    content: String,
    body: String,
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });
var Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;