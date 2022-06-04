"use strict"

var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();

/* GET users listing. */
// 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 로그인 화면 요청
router.get('/login', (req, res, next) => {
  res.render("login", { title: '로그인' });
});

// 로그인 요청
router.post('/login', (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;
  var password_check = req.body.password_check;
  if(password != password_check) res.redirect('/users/login');
  
  var sql = "select email, password from users where email=?";
    conn.query(sql, [email], (err, rows) => {
        if(err) console.error("err : " + err); 
        if(rows[0]){
          if(rows[0].email == email && rows[0].password == password){
            req.session.is_logigned = true;
            req.session.email = row.email;
            req.session.nickName = row.email;
            req.session.email = row.email;
            req.session.password = row.password;

            res.redirect("/contents");
          }
          else{
             res.redirect('/users/login');
          }
        } 
        else {res.redirect('/users/login');}       
    });
});

// 로그아웃
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('/');
  })
});

// 회원가입 화면 요청
router.get('/register', (req, res, next) => {
  res.render("signup", { title: '회원가입' })
});

// 회원가입 요청
router.post('/register', (req, res, next) => {
  var email = req.body.email;
  if(req.body.email == null)
  console.log('널값 들어옴');
  var password = req.body.password;
  var nickName = req.body.nickName;
  var data = [email, password, nickName];
  console.log(email + " : " + password + " : " + nickName + " : " + data);
  if(chekdEmail(email)){
    console.log('회원가입 재시도');
    res.redirect('/register')
  }else{
    console.log('회원가입 요청');
    var sql = "insert into users(email, password, nickName, createTime) values(?, ?, ?, now())";
    conn.query(sql, data, (err, rows) => {
      if(err) console.error("err : " + err); 
      res.redirect('/users/login');
    });
  }

});

var chekdEmail = (email) => {
  console.log("이메일 체크");
  var sql = "select email from users where email=?";
  console.log("2");
  conn.query(sql, [email], (err, rows) => {
    console.log("3");
    if(err) console.error("err : " + err); 
    if(rows[0]){
      console.log('같은 이메일 있음');
      return true;
    }        
    else console.log('같은 이메일 없음');
    return false;
  });
  
};


// 미완

// 회원정보 수정 화면 요청
router.get('/edit', (req, res, next) => {
  res.render("edit", { title: '회원정보' });
});

// 회원정보 수정 요청
router.post('/update', (req, res, next) => {
 
});

// 마이페이지 화면 요청
router.get('/mypage', (req,res, next) => {
  res.render("mypage",{title: '마이페이지'});
});

// 나의 작품 화면 요청
router.get('/mynovel', (req,res, next) => {
  res.render("mynovel",{title: '나의 소설 페이지'});
});


module.exports = router;
