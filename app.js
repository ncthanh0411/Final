var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var Secret = require('./secret');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var User = require('./models/user');

var newUser = new User({
  name: 'TD',
  email: 'td@gmail.com',
  password: '123'
});
newUser.save();

console.log(process.env.MONGO_URL);
// Connect to atlat

var url = 'mongodb+srv://congpham251299:Cong12322132@clusters.odice.mongodb.net/nodejsDatabase?retryWrites=true&w=majority';
mongoose.connect(
  process.env.MONGO_URL || url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(secret.cookieSecret));
app.use(require('express-session')({ saveUninitialized: false, resave: true, secret: secret.sessionSecret }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
