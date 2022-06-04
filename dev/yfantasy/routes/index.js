var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.is_logined == true){
    res.render("index", { title: '로그인',
      is_logined : req.session.is_logined,
      nickName : req.session.nickName,
      email: req.session.email,
      password : req.session.password
   });
  }
  else{
    res.render("index", { title: '로그인', is_logined: false });
  }    
});

module.exports = router;
