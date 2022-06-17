var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var passport = require('./config/passport');
var flash = require('connect-flash');


var options = {
  host: 'localhost',
  port: '3306',
  user: 'luan',
  password: 'tlsqlrmflawk1!',
  database: 'noveldb',
  multipleStatements: true,
};

// 세션정보를 mysql DB 내에 저장한다. (sessions라는 table이 생김)
var sessionStore = new MySQLStore(options);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(multiparty());
app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// 세션 사용을 위한 쿠키설정
app.use(cookieParser('session_cookie_secret'));
app.use(express.static(path.join(__dirname, 'public')));

// post형식의 데이터를 읽기 위한 bodyparser 사용
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// 플래시 데이터 사용
app.use(flash());

// 세션 설정
app.use(
  session({
  secret: 'session_cookie_secret',       // 데이터를 암호화 하기 위해 넣은 임의값
  resave: false,            // 요청이 왔을 때 세션을 수정하지 않더라고 다시 저장소에 저장 되도록
  saveUninitialized: false,  // 세션이 필요하면 세션을 실행시킨다.
  store: sessionStore    // 세션이 데이터를 저장하는 곳
}));

// passport 초기화 + 연결
app.use(passport.initialize());
app.use(passport.session());

// local vars
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated(); // passport제공 함수로 현재 로그인이 되어있는지 아닌지 true, false로 반환
  res.locals.user = req.user || null; // passport에서 추가하는 항목으로 session으로부터 user를 deserialize하여 생성
  res.locals.errors = [];
  next();
})

// 라우터 모듈 생성
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contentsRouter = require('./routes/contents');


// passport config
// require('./config/passport')(passport);

// 라우터 모듈 적용
app.use('/', indexRouter);
app.use('/users', usersRouter);
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
