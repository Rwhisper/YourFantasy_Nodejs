// mysql db 정보
var mysql_odbc = require('../db/db_conn')();
// db connection
var conn = mysql_odbc.init();
// passport 모듈 
const passport = require('passport');
const { local } = require('../db/db_info');
const LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

// passport 모듈화

// email 값으로 쿠키 생성
passport.serializeUser((user, done) => {
    done(null, user[0].email);
});

// email를 이용해 user의 전체 정보 받기
passport.deserializeUser((email, done) => {

    var userinfo;
    var sql = 'SELECT * FROM USERS WHERE email=?';
    console.log(email);
    conn.query(sql , [email], function (err, result) {
        if(err) console.log('mysql 에러');    
        
        console.log("deserializeUser mysql result : " , result);
        var json = JSON.stringify(result[0]);
        userinfo = JSON.parse(json);
        done(null, userinfo);
    });    
    
});

//? auth 라우터에서 /login 요청이 오면 local설정대로 이쪽이 실행되게 된다.
// 로그인에 실패한 경우 false
// 로그인에 성공한 경우 true는 생략 가능하고 DB에서 받아온 회원 정보 객체를 리턴
// 이후 req.user를 통해 현재 회원정보 객체에 접근 가능
passport.use(
    new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        session: true,
        passReqToCallback: false
    },
    async  function(email, password, done){
        var sql = 'select * from users where email=? ';
        conn.query(sql, [email], (err, user) => {
            if(err) console.log('err : ' + err);
            
            if(user.length == 0){
                console.log("회원 조회 결과 없음");
                return done(null, false, { message: 'Incorrect'});
            }else{
                //
                if(!bcrypt.compareSync(password, user[0].password)){ // bcrypt를 이용한 암호화 
                    console.log("user[0].password: ", user[0].password);
                    console.log("hash: ", hash);
                    console.log("password 일치하지 않음");
                    return done(null, false, { message: 'Incorrect'});
                } else {              
                    console.log("로그인 성공");
                    console.log(user);                   
                    console.log("userinfo : " , user);
                    return done(null, user);    // result 값으로 받아진 회원정보를 return
                }
            }
        })
    }
));
    

// 모듈 export   
module.exports = passport;