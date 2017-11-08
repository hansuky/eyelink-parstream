var CONSTS = require('./consts');
var express = require('express');
var router = express.Router();
var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;

var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis:'', management:'', settings:''};


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('login');
  // res.redirect('/dashboard/');s
  res.render('./login/login', { title: global.config.productname});
});
router.get('/login', function(req, res, next) {
  console.log('login');
  // res.redirect('/dashboard/');s
  res.render('./login/login', { title: global.config.productname});
});

router.get('/logout', function(req, res, next) {
  console.log('logout');

  req.session.destroy(function(err) { // 세션 삭제
    res.clearCookie('sid'); // 세션 쿠키 삭제
    res.redirect('/login');
  });
});


// login
router.post('/login', function(req, res, next) {
   var in_data = {
      USERID: req.body.userid,
   };
  console.log('login');
   queryProvider.selectSingleQueryByID("user", "selectLogin", in_data, function(err, out_data, params) {
    console.log(out_data[0][0]);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0][0] != undefined) {
      console.log('tt');
      var in_data = {
        USERID: req.body.userid,
        REGDATE :  out_data[0][0].reg_date
      };
      console.log(in_data);
      queryProvider.selectSingleQueryByID("user", "selectPassword", in_data, function(err, out_data, params) {
        console.log('['+out_data[0][0]+']');
        if(req.body.password === out_data[0][0].user_pw) {
          console.log('로그인 축축');
          res.redirect("/dashboard");
        } else {
          console.log('비밀번호 틀렸돵');
          res.redirect("/?error=1");
        }
      });
    } else {
      rtnCode = CONSTS.getErrData('0001');
      console.log('등록된 정보가 없어용');
      res.redirect("/?error=2");
    }
  });
});

// create
router.post("/", function(req, res){

});

module.exports = router;
