var createError = require("http-errors");
var express = require("express");
var path = require("path");
var hbs = require('hbs');
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var secret = require('./secret');
var bcrypt = require('bcrypt');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');
var adminRouter = require('./routes/admin');
var notificationRouter = require('./routes/notification');
var depostRouter = require("./routes/depost");
const { localsAsTemplateData } = require("hbs");

// Add helper here
hbs.registerHelper("ifEquals", function (firstVal, secondVal, options) {
  return firstVal == secondVal ? options.fn(this) : options.inverse(this);
});

console.log(process.env.MONGO_URL);
// Connect to atlat

var url =
  "mongodb+srv://congpham251299:Cong12322132@clusters.odice.mongodb.net/nodejsDatabase?retryWrites=true&w=majority";
mongoose.connect(
  //process.env.MONGO_URL,
  //process.env.LOCAL_URL,
  process.env.MONGO_URL || url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

// var User = require("./models/user");
// var Department = require("./models/department");
// bcrypt.hash('admin', 10).then(function(hash) {
//   Department.find(function (err, departLst) {
//     if (err) return res.status(404).json({ msg: "DB error" });
//     var lst = [];
//     departLst.forEach(depart => {
//       lst.push(depart.id)
//     })
//     var newUser = new User({
//       username: 'admin',
//       email: '',
//       password: hash,
//       role: 0,
//       id_gg: '',
//       department: lst
//     });
//     newUser.save();
//   });
// })

var app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(secret.cookieSecret));
app.use(
  require("express-session")({
    saveUninitialized: false,
    resave: true,
    secret: secret.sessionSecret,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/post", postRouter);
app.use("/admin", adminRouter);
app.use("/depost", depostRouter);
app.use("/notification", notificationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render("404", { layout: false, title: "404" });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

io.on("connection", (socket) => {
  console.log('user connect: ', socket.id);
  

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

module.exports = { app: app, server: server };
