var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
const { bootstrapGifts } = require('./api/gifts/gift.controller');
var logger = require('./logger/logger').logger;


var app = express();
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
require('./routes')(app);

(async() => {
  try{
    await mongoose.connect(process.env.MONGODB_URI);
    await bootstrapGifts();
    logger.info('Server is up and running');
  }
  catch(error){
    logger.error(error.message);
  }
})();


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
  res.json({ message: err.message });
});

module.exports = app;
