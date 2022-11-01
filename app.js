var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var bodyParser = require('body-parser');
const helmet = require('helmet');




const indexRouter = require('./routes/index-router');
const listActivitiesRouter = require('./routes/list-activities-router');
const activitiesRouter = require('./routes/activities-router');
const activityRouter = require('./routes/activity-router');
const administrationRouter = require('./routes/administration-router');
const uploadRouter = require('./routes/file-upload-router');

var app = express();
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(session({ secret: 'cryptoFGT', login : ""}));

app.use('/', indexRouter);
app.use('/list-activities', listActivitiesRouter);
app.use('/activities', activitiesRouter);
app.use('/activity', activityRouter);
app.use('/test', activityRouter);
app.use('/administration', administrationRouter);
app.use('/fileupload', uploadRouter );

app.use(helmet.frameguard({ action: "sameorigin" }));


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
  res.render('layout/error');
});

module.exports = app;