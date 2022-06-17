"use strict"

var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();
var passport = require('../config/passport');
var bcrypt = require('bcrypt-nodejs');

/* GET users listing. */
// 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 로그인 화면 요청
router.get('/login',  (req, res, next) => {
  res.render("login", { title: '로그인' });
});



// 로그인 passport을 사용하여 session에 로그인 정보 저장
router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                    failureRedirect: '/users/login',
                                    failureFlash: true ,
                                    session: true
  })
);

// 로그아웃
router.get('/logout', (req, res, next) => {
  // 세션 삭제로 로그아웃
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
  // req.body로 post 데이터 읽기
  var email = req.body.email;  
  var password = req.body.password;
  var nickName = req.body.nickName;  
  var password_check = req.body.password_check;
  // 필수요소들이 값이 없거나 비밀번호가 틀리면 바로 login 화면으로 다시 반환해준다.
  if(email == undefined || password == undefined || nickName == undefined ||  password != password_check){
       console.log('널값 들어옴');
    res.redirect('/users/register');
    return;
  }  
  
  // 회원가입 할려는 이메일이 원래 있는지 확인
  if(chekdEmail(email)){
    console.log('회원가입 재시도');
    return res.redirect('/register')  // 있다면 원래 화면으로 돌아감
  }else{                    
    bcrypt.hash(password, null, null, function(err, hash){     //bcrypt hash 명령문. 
      var sql = "insert into users(email, password, nickName, createTime) values(?, ?, ?, now())";
      var data = [email, hash, nickName]; 
      conn.query(sql, data, function(err, rows){          // 진행된 암호화를 mysql에 저장하기 위해  
        if(err) console.error("err : " + err); 
        console.log('success sign-up!');
        console.log('hash');
        res.redirect('/users/login'); //회원가입이 성공하면 login화면으로 이동시킨다.
      });
    });
  }
});

// 이메일 중복체크 메서드
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




// 회원정보 수정 화면 요청(구현 x)
router.get('/edit', (req, res, next) => {
  res.render("edit", { title: '회원정보' });
});

// 회원정보 수정 요청(구현 x 굳이 필요 없다고 느껴서)
router.post('/update', (req, res, next) => {
 
});

// 회원정보 수정 요청
router.post('/updatenick', (req, res, next) => {
  nickname = req.body.nickName;
  var data = [nickname, req.user.email];
  var sql = "update users set nickName=?  where email=?";
  conn.query(sql, data, (err, rows) => {
    res.redirect("/",{title: 'Your Fantasy'});
  });

});


// 마이페이지 화면 요청
router.get('/mypage', (req,res, next) => {
  console.log("a",req.user.nickName);
  console.log("a",req.user.email);
  res.render("mypage",{title: '마이페이지'});
});

// 나의 작품 화면 요청
router.get('/mynovel', (req,res, next) => {
  var sql = "select count(case when status='doing' then 1 end) as 'serialize', "
          + "count(case when status='done' then 1 end) as 'complete' from novel where users_email=? ;";
  conn.query(sql, [req.user.email], (err, rows) => {  // 작품 종류별 갯수 지정해서 뿌려주기(연재중, 완결)
    res.render("mynovel",{title: '나의 소설 페이지', serialize: rows[0].serialize, complete: rows[0].complete});
  });
  
});

// 연재중인 작품 목록 요청
router.get('/serialize', (req,res, next) => {

  var sql = "select * from novel where users_email=? and status='doing';";
  conn.query(sql, [req.user.email], (err, rows) => {  // 로그인 한 사람의 연재중인 작품 목록 요청
    res.render("serialize", {title: '나의 소설 페이지', novels: rows});
  });
  
});
// 완결된 작품 목록 요청
router.get('/complete', (req,res, next) => {

  var sql = "select * from novel where users_email=? and status='done';";
  conn.query(sql, [req.user.email], (err, rows) => {  //로그인 한 사람의 완결된 작품 목록 요청
    res.render("complete", {title: '나의 소설 페이지', novels: rows});
  });
  
});

module.exports = router;
