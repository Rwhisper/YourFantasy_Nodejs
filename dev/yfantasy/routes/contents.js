"use strict"

var express = require('express');
var moment = require('moment');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();
var conn = mysql_odbc.init();


// 소설 목록
router.get('/list',(req, res, next) => {
    var category = req.query.category;   
    
    var page = req.query.page;
    
    var sql = "select novel_id, novel_title,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, "+
        "category, nickName from novel, users where novel.users_email = users.email ";
        
    
    if(page == undefined) page = 1;    

    if(category != undefined){        
        sql += "and category=?"
        conn.query(sql, [category], (err, rows) => {
            if(err) console.error("err : " + err);
            res.render('list',{title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category});
            console.log(category);
            console.log(rows.length-1);
        });
    }
    else {
        conn.query(sql, (err, rows) => {            
            if(err) console.error("err : " + err);
            res.render("list", {title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category });
            // console.log("a : " + rows[0].category + " : " + page + " : ");
            console.log(rows.length-1);
        });
    }  
});

// 소설 목록
router.get('/list/:category',(req, res, next) => {
    var category = req.params.category; 
    var sql = "select novel_id, novel_title,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, "+
        "category, nickName from novel, users where novel.users_email = users.email and category=? ";
    var page = 1;   
   
    conn.query(sql, [category], (err, rows) => {
        if(err) console.error("err : " + err);
        res.render('list',{title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category});
        console.log(rows.length-1);
        console.log(rows);
    });
   
});

// 작품 정보 (테스트 전)
router.get('/novel/:novel_id',(req, res, next) => {
    var novel_id = req.params.novel_id;
    
    console.log("novel_id : ",novel_id)


    var cntSql = "select sum(con.views) as 'views',  sum(con.stars) as 'stars' , episodes "
    + "from novel "
    + "     right outer join (select novel_id, count(*) as episodes, sum(views) as 'views', sum(stars) 'stars' from contents"
    + "     where novel_id =? ) as con"
    + " on  novel.novel_id = con.novel_id ;"

    var sql = "select users.nickName, novel.novel_id, novel_title, novel_introduce, "
    + " novel_create_time, category, users_email, status from users, novel where novel.users_email = users.email and novel_id=? ;"

    var sql2 = "select contents_id, novel_id, subtitle, views, stars, work_review, date_format(content_create_time, '%Y-%m-%d %H:%i:%s') content_create_time from contents where novel_id=?;";
    

    conn.query(cntSql, [novel_id],  (err, cnt) => {
        if(err) console.error("err : " + err);
        conn.query(sql, [novel_id],  (err, novel) => {
            if(err) console.error("err : " + err);
            conn.query(sql2, [novel_id],  (err, contents) => {
                if(err) console.error("err : " + err);
                console.log(cnt);
                res.render("novel", {title: '작품 정보', novel:novel, contents:contents, cnt:cnt });
            });
        });
    });    


});

router.post('/statusUpdate', (req, res, next) => {
    var novel_id = req.body.novel_id;
    console.log("1 ", novel_id);
    var status = req.body.status;
    console.log("2 ", status);
    var sql = "select * from novel where novel_id =?"
    var sql2 = "update novel set status =? where novel_id=?";
    var data = [status, novel_id];
    conn.query(sql, [novel_id], (err, rows) => {
        console.log("user : ", req.user[0].email);
        console.log("user2 : ",rows[0].users_email);
        if(req.user[0].email != rows[0].users_email){
            console.log("4");
            return res.redirect("/contents/novel/" + novel_id);
        }
        else {
            conn.query(sql2, data, (err, rows) => {
                console.log("3");
                return res.redirect("/contents/novel/" + novel_id);
            });
        }
    })
    
});

// 한화 내용 (테스트 전)
router.get('/views/:contents_id',(req, res, next) => {
    var contents_id = req.params.contents_id;  

    if(req.user){
        var uSql = "update contents set views=views+1  where contents_id=?"
        conn.query(uSql, [contents_id],  (err, insert) => {
            if(err) console.error("err : " + err);
            console.log("조회수 1추가");
        });
    }

    var sql = "select contents_id, novel_id,  subtitle, content, views, stars,  date_format(content_create_time, '%Y-%m-%d %H:%i:%s') "+
    "content_create_time, work_review from contents where contents_id=? ";
    var sql2 = "SELECT comment_id, contents_id, comment, stars, nickName, comment.users_email, comment_create_time "
    + "FROM comment, users where contents_id=? and comment.users_email = users.email"
    
    conn.query(sql2, [contents_id],  (err, comments) => {
        if(err) console.error("err : " + err);        
        conn.query(sql, [contents_id],  (err, rows) => {
            if(err) console.error("err : " + err);
            console.log("rows :", rows[0]);
            console.log(comments);
            res.render("viewer", {title: '작품 정보',  rows:rows, comments:comments, moment});
        });
    });
});



// 댓글 작성
router.post('/views/comment', (req, res, next) => {
    var comment = req.body.comment;
    var contents_id = req.body.contents_id;

    if(!req.user) {
        return res.redirect("/contents/views/" + contents_id);        
    }

    var user_email = req.user[0].email;

    var data  = [contents_id, comment, user_email];

    var sql = "insert into comment values (null, ?, ?, 0, ?, now());"
    conn.query(sql, data, (err, rows) => {
        if(err) console.error("err : " + err); 
        console.log("생성성공");
        res.redirect("/contents/views/" + contents_id);
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
    // var users_email = req.body.email;
    // console.log("t", req.body.email);
    console.log("t2", req.user[0].email);
    // console.log(req.user.email);
  

    var data = [novel_title, novel_introduce, category, req.user[0].email];
    var sql = "insert into novel(novel_id, novel_title, novel_introduce, novel_create_time, category, users_email, status) " + 
    "values(null, ?, ?, now(), ?, ? , 'doing')";

    conn.query(sql, data, (err, rows) => {
      if(err) console.error("err : " + err); 
      res.redirect('/users/mynovel');
    });

});

// 새로운 글 생성 화면 요청
router.get('/newwriting/:novel_id', (req, res, next) => {
    
    var sql = "select * from novel where novel_id=?"
    conn.query(sql, [req.params.novel_id],(err, novel) => {
        if(err) console.error("err : " + err); 
        if(!req.user[0] || req.user[0].email != novel[0].users_email) res.redirect("/users/novel/"+ novel[0].novel_id);
        res.render("newwriting", { title: '새로운 편', novel:novel });
    });
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