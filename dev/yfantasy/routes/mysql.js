var express = require('express');
var router = express.Router();
var mysql_odbc = require('../db/db_conn')();   // mysql 인스턴스 가져오기
var conn = mysql_odbc.init();

// router.get('/', function(req, res, next){

//     var connection = mysql.createConnection({ 
//         host: 'localhost',
//         port:3306,
//         user:'luan',
//         password: 'tlsqlrmflawk1!'
//     });

//     connection.connect(err => {
//         if(err){
//             res.render('mysql', {connect:'연결 실패', err:err});
//             console.error(err);
//             throw err;
//         }else{
//             res.render('mysql', {connect: "연결 성공", err:'없음'});
//         }
//     });
// });

 module.exports = router;