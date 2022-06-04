var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session');
var FileStore = require('session-file-store');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contentsRouter = require('./routes/contents');
var formRouter = require('./routes/form');
var mysqlRouter = require('./routes/mysql');
var boardRouter = require('./routes/board');

var mysql_odbc = require('./db/db_conn')();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'scsesion',       // 데이터를 암호화 하기 위해 넣은 임의값
  resave: false,            // 요청이 왔을 때 세션을 수정하지 않더라고 다시 저장소에 저장 되도록
  saveUninitialized: true,  // 세션이 필요하면 세션을 실행시킨다.
  store: new MySQLStore(mysql_odbc)    // 세션이 데이터를 저장하는 곳
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multiparty());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/form', formRouter);
app.use('/mysql', mysqlRouter);
app.use('/board', boardRouter);
app.use('/contents', contentsRouter);

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
