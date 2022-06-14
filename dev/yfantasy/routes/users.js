"use strict"

var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();
var passport = require('../config/passport');

/* GET users listing. */
// 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 로그인 화면 요청
router.get('/login',  (req, res, next) => {
  res.render("login", { title: '로그인' });
});

// 로그인 요청
// router.post('/login', (req, res, next) => {
//   sess = req.session;
//   var email = req.body.email;
//   var password = req.body.password;
  
//   var sql = "select email, nickName, password from users where email=?";
//     conn.query(sql, [email], (err, rows) => {
//         if(err) console.error("err : " + err); 
//         if(rows[0]){
//           if(rows[0].email == email && rows[0].password == password){
//             console.log("로그인 성공");
//             req.session.is_logined = true;
//             console.log(req.session.is_logined);
//             req.session.email = rows[0].email;
//             req.session.nickName = rows[0].nickName;
//             req.session.password = rows[0].password;
            
//             req.session.save(() => {
//               console.log(req.session);
//               res.redirect('/');
//             });
            
//           }
//           else{
//              res.redirect('/users/login');
//           }
//         } 
//         else {res.redirect('/users/login');}       
//     });
// });

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                    failureRedirect: '/users/login',
                                    failureFlash: true ,
                                    session: true
  })
);

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
  var password = req.body.password;
  var nickName = req.body.nickName;  
  var password_check = req.body.password_check;
  if(email == undefined || password == undefined || nickName == undefined ||  password != password_check){
       console.log('널값 들어옴');
    res.redirect('/users/login');
    return;
  }

  var data = [email, password, nickName];
  
  console.log(data);
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
  conn.query(sql, [email], (err, rows) => {
    if(err) console.error("err : " + err); 
    if(rows[0]){
      console.log('같은 이메일 있음');
      return true;
    }        
    else {
      console.log('같은 이메일 없음');
    return false;
    }
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

// 회원정보 수정 요청
router.post('/updatenick', (req, res, next) => {
  nickname = req.body.nickName;
  var data = [nickname, req.user[0].email];
  var sql = "update users set nickName=?  where email=?";
  conn.query(sql, data, (err, rows) => {
    res.redirect("/",{title: 'Your Fantasy'});
  });

});

// 회원정보 수정 요청
router.post('/updatepassword', (req, res, next) => {
  nickname = req.body.nickName;
  if(req.body.password != req.user.password) res.redirect('/users/mypage');
  new_pw = req.body.newPassword;
  if(new_pw != req.body.newPassword_Check) res.redirect('/users/mypage');

  var data = [new_pw = req.user[0].email];

  var sql = "update users set password=? where email=?";
  conn.query(sql, [req.user[0].email], (err, rows) => {
    res.redirect("/",{title: 'Your Fantasy'});
  });

});

// 마이페이지 화면 요청
router.get('/mypage', (req,res, next) => {
  res.render("mypage",{title: '마이페이지'});
});

// 나의 작품 화면 요청
router.get('/mynovel', (req,res, next) => {

  var sql = "select count(case when status='doing' then 1 end) as 'serialize', "
          + "count(case when status='done' then 1 end) as 'complete' from novel where users_email=? ;";
  conn.query(sql, [req.user[0].email], (err, rows) => {
    res.render("mynovel",{title: '나의 소설 페이지', serialize: rows[0].serialize, complete: rows[0].complete});
  });
  
});

// 연재중인 작품 목록 요청
router.get('/serialize', (req,res, next) => {

  var sql = "select * from novel where users_email=? and status='doing';";
  conn.query(sql, [req.user[0].email], (err, rows) => {
    res.render("serialize", {title: '나의 소설 페이지', novels: rows});
  });
  
});
// 연재중인 작품 목록 요청
router.get('/complete', (req,res, next) => {

  var sql = "select * from novel where users_email=? and status='done';";
  conn.query(sql, [req.user[0].email], (err, rows) => {
    res.render("complete", {title: '나의 소설 페이지', novels: rows});
  });
  
});

module.exports = router;
