"use strict"

var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();

// router.get('/list', function(req, res, next) {
   
//     res.render('content');
//   });

// 소설 목록
router.get('/',(req, res, next) => {
    var category = req.query.category;   
    var page = req.query.page;
    
    var sql = "select novel_id, novel_title,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, "+
        "category, nickName from novel, users where novel.users_email = users.email ";
        
    
    if(page == undefined) page = 1;    

    if(category != undefined){        
        sql += "and category=?"
        conn.query(sql, [category], (err, rows) => {
            if(err) console.error("err : " + err);
            res.render('content',{title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category});
            console.log(rows.length-1);
        });
    }
    else {
        conn.query(sql, (err, rows) => {            
            if(err) console.error("err : " + err);
            res.render("content", {title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category });
            // console.log("a : " + rows[0].category + " : " + page + " : ");
            console.log(rows.length-1);
        });
    }  
});

// 소설 목록
router.get('/:category',(req, res, next) => {
    var category = req.params.category; 
    var sql = "select novel_id, novel_title,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, "+
        "category, nickName from novel, users where novel.users_email = users.email and category=? ";
    var page = 1;   
   
    conn.query(sql, [category], (err, rows) => {
        if(err) console.error("err : " + err);
        res.render('content',{title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category});
        console.log(rows.length-1);
        console.log(rows);
    });
   
});

// 작품 정보 (테스트 전)
router.get('/novel/:novel_id',(req, res, next) => {
    var novel_id = req.params.novel_id;
    var data = [novel_id, novel_id, novel_id];

    var sql1 = "select novel_id,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, category, status, nickName from novel, users where users.email = novel.users_email and novel_id=? ;";
    var sql2 = "select contents_id, novel_id, subtitle, views, stars, work_review, date_format(content_create_time, '%Y-%m-%d %H:%i:%s') content_create_time from contents where novel_id=?;";
    
    var sql = sql1 + sql2 ;

    conn.query(sql, data,  (err, novel, contents) => {
        if(err) console.error("err : " + err);
        res.render("novel", {title: '작품 정보', novel:novel, contents:contents});
    });

});

// 한화 내용 (테스트 전)
router.get('/views',(req, res, next) => {
    var contents_id = req.query.contents_id;  

    var sql = "select contents_id, novel_id,  subtitle, content, views, stars,  date_format(modidate, '%Y-%m-%d %H:%i:%s') "+
    "content_create_time from contents where contents_id=? ";
  

    conn.query(sql, [contents_id],  (err, rows) => {
        if(err) console.error("err : " + err);
        res.render("novel", {title: '작품 정보',  rows:rows});
    });

});

// 미완 

// 새로운 작품 생성 화면 요청
router.get('/new', (req, res, next) => {
    res.render("new", { title: '새로운 작품' });
});

// 새로운 작품 생성 페이지 요청 (테스트 전)
router.post('/new', (req, res, next) => {
    var novel_title = req.body.novel_title;
    var novel_introduce = req.body.novel_introduce;
    var category = req.body.category;
    var users_email = req.body.users_email;

    var data = [novel_title, novel_introduce, category, users_email]
    var sql = "insert into novel(novel_id, novel_title, novel_introduce, novel_create_time, category, users_email, status) " + 
    "values(null, ?, ?, now(), ?, ? , 'doing')";
    conn.query(sql, data, (err, rows) => {
      if(err) console.error("err : " + err); 
      res.redirect('/users/mynovel');
    });

});

// 새로운 글 생성 화면 요청
router.get('/newwriting', (req, res, next) => {
    res.render("newwriting", { title: '새로운 편' });
});

// 새로운 글 생성
router.post('/newwriting', (req, res, next) => {  

    var novel_id = req.body.novel_id;
    var subtitle = req.body.subtitle;
    var content = req.body.content;
    var work_review = req.body.work_review;

    var data = [novel_id, subtitle, content, work_review];
    var sql = "insert into contents(contents_id, novel_id, subtitle, content, views, stars, work_review, content_create_time) " + 
    "values(null, ?, ?, ?, 0, 0 ,?, now())";
    conn.query(sql, data, (err, rows) => {
      if(err) console.error("err : " + err); 
      res.redirect('/users/mynovel');
    });

});

router.get('/edit', (req, res, next) => {
    res.render("edit", { title: '새로운 편' });
});

module.exports = router;