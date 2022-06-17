"use strict"
// express 모듈 가져옴
var express = require('express');
// 날짜 변환을 위한 모듈
var moment = require('moment');
// 라우터 객체로 반환하기위한 모듈
var router = express.Router();
// db 접속정보를 가져와서
var mysql_odbc = require('../db/db_conn')();
// db 연결
var conn = mysql_odbc.init();


// 소설 목록 가져오기 카테고리, 페이지 둘다 받아도 상관없는 메서드
router.get('/list',(req, res, next) => {
    // get query형태로 받아오기
    var category = req.query.category;       
    var page = req.query.page;    
    var sql = "select novel_id, novel_title,  novel_introduce, date_format(novel_create_time, '%Y-%m-%d %H:%i:%s') novel_create_time, "+
        "category, nickName from novel, users where novel.users_email = users.email ";
        
    // 페이지가 비어있으면 디폴트값 1
    if(page == undefined) page = 1;    
    // 카테고리가 비어있으면 전체 검색 아니면 카테고리를 필터에 넣어서 검색
    if(category != undefined){        
        sql += "and category=?"
        conn.query(sql, [category], (err, rows) => {
            if(err) console.error("err : " + err);
            res.render('list',{title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category});
        });
    }
    else {
        conn.query(sql, (err, rows) => {            
            if(err) console.error("err : " + err);
            res.render("list", {title:'게시판 리스트', rows:rows, page:page, length:rows.length-1, page_num:10, pass: true, category: category });
        });
    }  
});

// 카테고리만 가지고 소설 목록 가져오기 
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

// 작품 정보 가져오기
router.get('/novel/:novel_id',(req, res, next) => {
    var novel_id = req.params.novel_id;
    
    console.log("novel_id : ",novel_id)

    // 아우터 조인을 사용하여 콘텐츠의 전체 화수(시리즈수), 조회수, 좋아요 수(구현 x 추가 db 수정이 필요할 것으로 보임) 검색
    var cntSql = "select sum(con.views) as 'views',  sum(con.stars) as 'stars' , episodes "
    + "from novel "
    + "     right outer join (select novel_id, count(*) as episodes, sum(views) as 'views', sum(stars) 'stars' from contents"
    + "     where novel_id =? ) as con"
    + " on  novel.novel_id = con.novel_id ;"

    // 작품의 정보와 작가명 검색
    var sql = "select users.nickName, novel.novel_id, novel_title, novel_introduce, "
    + " novel_create_time, category, users_email, status from users, novel where novel.users_email = users.email and novel_id=? ;"

    // 내용을 제외한 전체 글 목록
    var sql2 = "select contents_id, novel_id, subtitle, views, stars, work_review, date_format(content_create_time, '%Y-%m-%d %H:%i:%s') content_create_time from contents where novel_id=?;";
    

    conn.query(cntSql, [novel_id],  (err, cnt) => {
        if(err) console.error("err : " + err);
        conn.query(sql, [novel_id],  (err, novel) => {
            if(err) console.error("err : " + err);
            conn.query(sql2, [novel_id],  (err, contents) => {
                if(err) console.error("err : " + err);
                // novel에 작품정보, 글목록, 카운트 목록 넘겨주기
                res.render("novel", {title: '작품 정보', novel:novel, contents:contents, cnt:cnt });
            });
        });
    });    


});

// 작품의 완결, 연재 변경하는 메서드
router.post('/statusUpdate', (req, res, next) => {
    // 로그인 되어있지 않다면 처음화면으로
    if(!req.user) return res.redirect('/');
    // 변경에 필요한 정보 받기
    var novel_id = req.body.novel_id;
    var status = req.body.status;
    var sql = "select * from novel where novel_id =?"
    var sql2 = "update novel set status =? where novel_id=?";
    var data = [status, novel_id];
    
    conn.query(sql, [novel_id], (err, rows) => {
        if(req.user.email != rows[0].users_email){ // 작가와 현재 변경하는 유저가 같은지 검색
            console.log("해당 작가가 아닌 다른사람이 내용을 변경하려 하였습니다.");
            return res.redirect("/contents/novel/" + novel_id);
        }
        else {  // 
            conn.query(sql2, data, (err, rows) => {
                console.log("성공적으로 변경 완료");
                return res.redirect("/contents/novel/" + novel_id);
            });
        }
    })
    
});

// 한편 내용 
router.get('/views/:contents_id',(req, res, next) => {
    var contents_id = req.params.contents_id;  

    // 조회수 증기
    if(req.user){
        var uSql = "update contents set views=views+1  where contents_id=?"
        conn.query(uSql, [contents_id],  (err, insert) => {
            if(err) console.error("err : " + err);
            console.log("add view Count");
        });
    }

    var sql = "select contents_id, contents.novel_id, users_email, subtitle, content, views, stars,  date_format(content_create_time, '%Y-%m-%d %H:%i:%s') "+
    "content_create_time, work_review from contents, novel where contents_id=? and novel.novel_id=contents.novel_id";
    // 댓글과 댓글 쓴사람의 닉네임
    var sql2 = "SELECT comment_id, contents_id, comment, stars, nickName, comment.users_email, comment_create_time "
    + "FROM comment, users where contents_id=? and comment.users_email = users.email"
    
    // 해당 회차의 댓글 가져오기
    conn.query(sql2, [contents_id],  (err, comments) => {
        if(err) console.error("err : " + err);        
        conn.query(sql, [contents_id],  (err, rows) => { // 해당회차 글 정보 가져오기
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

    // 인증된 유저가 아니면 이전화면으로 돌아가기
    if(!req.user) {
        return res.redirect("/contents/views/" + contents_id);        
    }

    var user_email = req.user.email;

    var data  = [contents_id, comment, user_email];

    var sql = "insert into comment values (null, ?, ?, 0, ?, now());"
    conn.query(sql, data, (err, rows) => {
        if(err) console.error("err : " + err); 
        console.log("생성성공");
        res.redirect("/contents/views/" + contents_id);
    });
});


// 새로운 작품 생성 화면 요청
router.get('/new', (req, res, next) => {
    res.render("new", { title: '새로운 작품' });
});

// 작품 생성
router.post('/new', (req, res, next) => {
    // 제목, 작품 소개, 카테고리 받아서 생성
    var novel_title = req.body.novel_title;
    var novel_introduce = req.body.novel_introduce;
    var category = req.body.category;
  

    var data = [novel_title, novel_introduce, category, req.user.email];
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
        if(!req.user || req.user.email != novel[0].users_email) res.redirect("/users/novel/"+ novel[0].novel_id);
        res.render("newwriting", { title: '새로운 편', novel:novel });
    });
});
    

// 새로운 글 생성
router.post('/newwriting', (req, res, next) => {  

    // body 내용 받기
    var novel_id = req.body.novel_id;
    var subtitle = req.body.subtitle;
    var content = req.body.content;
    var work_review = req.body.work_review;

    var data = [novel_id, subtitle, content, work_review];
    var sql = "insert into contents(contents_id, novel_id, subtitle, content, views, stars, work_review, content_create_time) " + 
    "values(null, ?, ?, ?, 0, 0 ,?, now())";
    conn.query(sql, data, (err, rows) => {
      if(err) console.error("err : " + err); 
      res.redirect('/users/mynovel');       // 내 작품 목록으로 돌아가기
    });

});

// 글 수정 화면 요청
router.get('/edit/:contents_id', (req, res, next) => {
    var contents_id = req.params.contents_id;
    var sql = "select * from contents where contents_id=?"
    conn.query(sql, [contents_id], (err, rows) => {
        if(err) console.error("err : " + err); 
        res.render("edit", { title: '수정',  content:rows});        // 글 수정 페이지로 이동  
    });
    
});

// 글 수정
router.post('/update', (req, res, next) => {
    // contents_id, subtitle, content, work_review 받아서 업데이트
    var contents_id = req.body.contents_id;
    var subtitle = req.body.subtitle;
    var content = req.body.content;
    var work_review = req.body.work_review;
    var data = [subtitle, content, work_review, contents_id];
    var sql = "update contents set subtitle =?, content=?, work_review=? where contents_id=?";

    conn.query(sql, data, (err, rows)=> {
        if(err) console.error("err : " + err); 
        res.redirect('/contents/views/' + contents_id); // 성공하면 뷰어 페이지로 되돌아가기
    });

});


module.exports = router;