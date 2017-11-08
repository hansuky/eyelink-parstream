var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis:'', management:'open selected', settings:''};

router.get('/users', function(req, res, next) {
  console.log('user/restapi/selectUserList');
  var in_data = {};
  queryProvider.selectSingleQueryByID2("user", "selectUserList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }       
    var users = out_data;    
    res.render('./management/usersEFSM', { title: global.config.productname, mainmenu:mainmenu, users:users });
  });
});

router.get('/users/:id', function(req, res) {
  console.log(req.params.id);
  // 신규 등록
  if (req.params.id === 'addUser') {
    res.render('./management/sign_up', { title: global.config.productname, mainmenu:mainmenu });
  } else { // 기존 사용자 정보 변경
    var in_data = {
      USERID: req.params.id,
    };
    queryProvider.selectSingleQueryByID("user", "selectEditUser", in_data, function(err, out_data, params) {
      console.log('db : '+out_data[0]);
      var rtnCode = CONSTS.getErrData('0000');
      // if (out_data[0] === null) {
      //   rtnCode = CONSTS.getErrData('0001');
      //   var msg = CONSTS.getErrData(out_data);
      //   console.log(msg);
      //   res.redirect("./edit_user?msg=" + msg.code);
      // }
      console.log(out_data[0]);
      var user = out_data[0][0];
      res.render('./management/edit_user',
        { title: 'EyeLink for ParStream',
          mainmenu:mainmenu,
          user:user });
     });
  }
});

// 사용자 신규 등록
router.post('/users/:id', function(req, res) {
  var in_data = {
    USERNAME: req.body.username,
    USERID: req.body.userid,
    PASSWORD: req.body.password[0],
    EMAIL: req.body.email,
    USERROLE: req.body.userrole,
  };
  console.log(in_data);
  queryProvider.selectSingleQueryByID("user", "selectCheckJoin", in_data, function(err, out_data, params) {
    console.log(out_data[0][0]);
    console.log(req.body.userid);
    if (out_data[0][0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      console.log(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {
        USERNAME: req.body.username,
        USERID: req.body.userid,
        PASSWORD: req.body.password[0],
        EMAIL: req.body.email,
        USERROLE: req.body.userrole,
        FLAG : 'C'
      };
      queryProvider.insertQueryByID("user", "insertUser", in_data, function(err, out_data) {
        var rtnCode = CONSTS.getErrData(out_data);
        if (err) { console.log(err);
          rtnCode = CONSTS.getErrData(out_data);
          console.log(rtnCode);
        }
        res.json({rtnCode: rtnCode});
      });
    }
  });
});


// 사용자 정보 수정
router.put('/users/:id', function(req, res) {
  var in_data = {
    USERNAME: req.body.username,
    USERID: req.body.userid,
    PASSWORD: req.body.password,
    EMAIL: req.body.email,
    USERROLE: req.body.userrole,
    FLAG : 'U'
  };
  queryProvider.insertQueryByID("user", "insertUser", in_data, function(err, out_data) {
    if (out_data === 'D001') out_data = 'D002';
    var rtnCode = CONSTS.getErrData(out_data);
    if (err) { console.log(err);
    }
    res.json({rtnCode: rtnCode});
  });
});


// 사용자 정보 삭제
router.delete('/users/:id', function(req, res) {
  var in_data = {
    USERID: req.params.id,
    FLAG : 'D'
  };
  queryProvider.insertQueryByID("user", "insertDeleteUser", in_data, function(err, out_data) {
    if (out_data === 'D001') out_data = 'D003';
    var rtnCode = CONSTS.getErrData(out_data);
    if(err){ console.log(err);
    }
    res.json({rtnCode: rtnCode});
  });
});

module.exports = router;