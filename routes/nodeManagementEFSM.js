var Logger = require('./log4js-utils').Logger;
var logger = new Logger('nodeManagementEFSM');
var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis:'', management:'open selected', settings:''};
var indexUser = global.config.es_index.es_user;
var indexRole = global.config.es_index.es_role;
var indexMap = global.config.es_index.es_auth_map;
var indexAuthMenu = global.config.es_index.es_auth_menu;
var indexMenu = global.config.es_index.es_menu;

var fmt1 = CONSTS.DATEFORMAT.DATE; // "YYYY-MM-DD",
var fmt2 = CONSTS.DATEFORMAT.DATETIME; // "YYYY-MM-DD HH:MM:SS",

router.get('/users', function(req, res, next) {
  logger.debug('user/restapi/selectUserList');
  var in_data = { INDEX: indexUser, TYPE: "user" };
  queryProvider.selectSingleQueryByID2("management", "selectList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    out_data.forEach(function(d){
      d._source.reg_date = Utils.getDateUTC2Local(d._source.reg_date, fmt2);
    });
    res.render('./management/users'+global.config.pcode, { title: global.config.productname, mainmenu:mainmenu, users:out_data });
  });
});

router.get('/users/:id', function(req, res) {
  logger.debug(req.params.id);
  // 신규 등록
  if (req.params.id === 'addUser') {
    res.render('./management/sign_up', { title: global.config.productname, mainmenu:mainmenu });
  } else { // 기존 사용자 정보 변경
    var in_data = {  INDEX: indexUser,  TYPE: "user",  ID : "user_id",  VALUE: req.params.id   };
    queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
      if (out_data[0] != null){
        var rtnCode = CONSTS.getErrData('0000');
        var user = out_data[0];
        var in_data = {  INDEX: indexMap, TYPE: "map", ID : "user_id", VALUE: req.params.id   };
        queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
          if (out_data != null){
            var rtnCode = CONSTS.getErrData('0000');
            var maps = out_data;
          } else {
            var rtnCode = CONSTS.getErrData('0001');
            var maps = [];
          }
          res.render('./management/edit_user', { title: global.config.productname, mainmenu:mainmenu, user:user, maps:maps});
        });
      } else {
        var rtnCode = CONSTS.getErrData('0001');
      }
      res.render('./management/edit_user', { title: global.config.productname, mainmenu:mainmenu, user:user, maps:maps });
    });
  }
});

// 사용자 신규 등록
router.post('/users/:id', function(req, res) {
  var in_data = { INDEX: indexUser, TYPE : "user", ID : "user_id", VALUE: req.body.userid  };
  queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var d = new Date().toString().split(' ');
      var s = d[4].split(':');
      var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
      var in_data = {
        INDEX: indexUser,
        NAME: req.body.username,
        USERID: req.body.userid,
        PASSWORD: req.body.password[0],
        POSITION: req.body.position,
        TEL: req.body.tel,
        MOBILE: req.body.mobile,
        USE: req.body.use,
        EMAIL: req.body.email,
        NOTE: req.body.note,
        DATE: Utils.getToday(fmt2, 'Y', 'Y')
      };
      queryProvider.insertQueryByID("management", "insertUser", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          var rtnCode = CONSTS.getErrData("D001");
          logger.debug(out_data.result);
        }
        if (err) { logger.debug(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

// 사용자 정보 수정
router.put('/users/:id', function(req, res) {
  var in_data = {
    INDEX: indexUser,
    ID : req.body.id,
    NAME: req.body.username,
    PASSWORD: req.body.password,
    POSITION: req.body.position,
    TEL: req.body.tel,
    MOBILE: req.body.mobile,
    USE: req.body.use,
    EMAIL: req.body.email,
    NOTE: req.body.note
  };
  logger.debug(in_data);
  queryProvider.updateQueryByID("management", "updateUser", in_data, function(err, out_data) {
    if(out_data.result == "updated"){
     var rtnCode = CONSTS.getErrData("D002");
    }
    if (err) { logger.debug(err);   }
    res.json({rtnCode: rtnCode});
  });
});


// 사용자 정보 삭제
router.delete('/users/:id', function(req, res) {
  logger.debug('deleteUser');
  var in_data = {  INDEX: indexUser,  TYPE: "user",  ID: req.body.id   };
  queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
    if(out_data.result == "deleted");
      var rtnCode = CONSTS.getErrData("D003");
      var in_data = {  INDEX: indexMap, TYPE: "map",  ID: "user_id",  VALUE : req.params.id  };
      queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
        if (out_data != null){
          var rtnCode = CONSTS.getErrData('0000');
          logger.debug(out_data);
          for(i=0; i<out_data.length; i++){
            var in_data = { INDEX : indexMap, TYPE: "map", ID : out_data[i]._id     }
            queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
              if(out_data.result == "deleted"){
                var rtnCode = CONSTS.getErrData("D004");
              }
              if(err){ logger.debug(err);    }
            });
          }
        } else {
          var rtnCode = CONSTS.getErrData('E007');
        }
        res.json({rtnCode: rtnCode});
      });
    if(err){ logger.debug(err);    }
    res.json({rtnCode: rtnCode});
  });
});

router.get('/user/:id', function(req, res) {
  var in_data = {  INDEX: indexUser,  TYPE: "user",  ID : "user_id",  VALUE: req.params.id   };
  queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('0000');
      var user = out_data[0];
      var in_data = {  INDEX: indexMap, TYPE: "map", ID : "user_id", VALUE: req.params.id   };
      queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
        if (out_data != null){
          var rtnCode = CONSTS.getErrData('0000');
          var maps = out_data;
        } else {
          var rtnCode = CONSTS.getErrData('0001');
          var maps = [];
        }
        res.render('./management/user_info', { title: global.config.productname, mainmenu:mainmenu, user:user, maps:maps});
      });
    } else {
      var rtnCode = CONSTS.getErrData('0001');
    }
    res.render('./management/user_info', { title: global.config.productname, mainmenu:mainmenu, user:user, maps:maps });
  });
});


router.get('/role', function(req, res, next) {
  logger.debug('role/restapi/selectRoleList');
  var in_data = { INDEX: indexRole, TYPE:"role" };
  queryProvider.selectSingleQueryByID2("management", "selectList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    var roles = out_data;
    res.render('./management/role_list', { title: global.config.productname, mainmenu:mainmenu, roles:roles });
  });
});

router.get('/role/:id', function(req, res) {
  logger.debug(req.params.id);
  // 신규 등록
  if (req.params.id === 'addRole') {
    res.render('./management/add_role', { title: global.config.productname, mainmenu:mainmenu });
  } else { // 기존 사용자 정보 변경
    var in_data = { INDEX: indexRole, TYPE: "role", ID: "role_id", VALUE: req.params.id };
    queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
      if(out_data[0] != null){
        var in_data = { INDEX: indexMenu, TYPE: "menu", ID: "role_id", VALUE: req.params.id };
        var role = out_data[0];
        queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
          var menu = out_data[0];
          res.render('./management/edit_role', { title: global.config.productname,   mainmenu:mainmenu,   role:role, menu:menu});
        });
      }
      res.render('./management/edit_role',  { title: global.config.productname,   mainmenu:mainmenu,   role:role,  menu:menu});
    });
  }
});

// role 신규 등록
router.post('/role/:id', function(req, res) {
  var in_data = { INDEX: indexRole, TYPE: "role", ID: "role_id", VALUE: req.body.roleid };
  queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      res.json({rtnCode: rtnCode});
    } else {
      var in_data = { INDEX: indexRole, ROLEID: req.body.roleid, NAME: req.body.rolename };
      queryProvider.insertQueryByID("management", "insertRole", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          logger.debug(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { logger.debug(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

// ROLE 정보 수정
router.put('/role/:id', function(req, res) {
  var in_data = { INDEX: indexRole, ID : req.body.id, NAME: req.body.rolename };
  queryProvider.updateQueryByID("management", "updateRole", in_data, function(err, out_data) {
    if(out_data.result == "updated" || out_data.result == "noop"){
      var rtnCode = CONSTS.getErrData("D002");
    }
    if (err) { logger.debug(err);   }
    res.json({rtnCode: rtnCode});
  });
});

// role 정보 삭제
router.delete('/role/:id', function(req, res) {
  logger.debug('delete role');
  var in_data = { INDEX: indexRole, TYPE: "role", ID: req.body.id  };
  queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
    if(out_data.result == "deleted"){
      var in_data = { INDEX: indexMenu, TYPE: "menu", ID: req.body.id };
      queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
        if(out_data.result == "deleted"){
          var rtnCode = CONSTS.getErrData("D003");
          var in_data = {  INDEX: indexMap, TYPE: "map",  ID: "role_id",  VALUE : req.params.id  };
          queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
            if (out_data != null){
              var rtnCode = CONSTS.getErrData('0000');
              logger.debug(out_data);
              for(i=0; i<out_data.length; i++){
                var in_data = { INDEX : indexMap, TYPE: "map", ID : out_data[i]._id }
                queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
                  if(out_data.result == "deleted"){
                    var rtnCode = CONSTS.getErrData("D003");
                  }
                  if(err){ logger.debug(err); }
                });
              }
            } else {
              var rtnCode = CONSTS.getErrData('E007');
            }
            res.json({rtnCode: rtnCode});
          });
        }
        if(err){ logger.debug(err); }
        res.json({rtnCode: rtnCode});
      });
      var rtnCode = CONSTS.getErrData("D003");
    if(err){ logger.debug(err);   }
    res.json({rtnCode: rtnCode});
    }
  });
});

router.get('/memList/:id', function(req, res, next) {
  logger.debug('role/restapi/selectMemList');
  var in_data = { INDEX: indexMap, TYPE:"map", ID : "role_id", VALUE : req.params.id };
  queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    logger.debug(out_data);
    var mems = out_data;
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }  else {
      var in_data = { INDEX: indexUser, TYPE: "user" };
      queryProvider.selectSingleQueryByID2("management", "selectList", in_data, function(err, out_data, params) {
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }
        var users = out_data;
        logger.debug(users);
        res.render('./management/mem_list', { title: global.config.productname, mainmenu:mainmenu, mems:mems, users:users, roleid:req.params.id });
      });
    }
    res.render('./management/mem_list', { title: global.config.productname, mainmenu:mainmenu, mems:mems, users:users, roleid:req.params.id  });
  });
});

router.get('/mem/:id', function(req, res) {
  logger.debug(req.params.id);
  // 신규 등록
  if (req.params.id === 'addMem') {
    res.render('./management/add_mem', { title: global.config.productname, mainmenu:mainmenu });
  } else { // 기존 사용자 정보 변경
    var in_data = { INDEX: indexMap, TYPE: "map", ID: "role_id", VALUE: req.params.id };
    queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
      logger.debug(out_data[0]);
       if(out_data[0] != null){
        var in_data = { INDEX: indexMenu, TYPE: "menu", ID: "role_id", VALUE: req.params.id };
        var role = out_data[0];
        queryProvider.selectSingleQueryByID2("management", "selectListById", in_data, function(err, out_data, params) {
          var menu = out_data[0];
          res.render('./management/edit_role', { title: global.config.productname, mainmenu:mainmenu, role:role, menu:menu});
        });
      }
      res.render('./management/edit_role', { title: global.config.productname, mainmenu:mainmenu, role:role});
    });
  }
});

// mem 신규 등록
router.post('/mem/:id', function(req, res) {
  var in_data = { INDEX: indexMap, TYPE: "map", ROLEID: req.params.id, USERID: req.body.userid };
  queryProvider.selectSingleQueryByID2("management", "selectCheckMap", in_data, function(err, out_data, params) {
    logger.debug(out_data);
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E006');
      res.json({rtnCode: rtnCode});
    } else {
      var in_data = { INDEX: indexMap, ROLEID: req.params.id, USERID: req.body.userid };
      queryProvider.insertQueryByID("management", "insertMap", in_data, function(err, out_data) {
        logger.debug(out_data);
        if(out_data.result == "created"){
          logger.debug(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { logger.debug(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

// role 정보 삭제
router.delete('/mem/:id', function(req, res) {
  logger.debug('delete mem');
  var in_data = { INDEX: indexMap, TYPE: "map", ID: req.params.id };
  queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
    if(out_data.result == "deleted");
      var rtnCode = CONSTS.getErrData("D003");
    if(err){ logger.debug(err); }
    res.json({rtnCode: rtnCode});
  });
});

router.get('/menu', function(req, res, next) {
  logger.debug('management/restapi/menu');
  mainmenu.management = ' open selected';
  res.render('./management/menu', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/restapi/getMenuList', function(req, res, next) {
  logger.debug('/restapi/getMenuList');
  var in_data = {  INDEX: indexMenu, TYPE: req.query.type, SORT: "code" };
  var rtnCode = CONSTS.getErrData('0000');
  queryProvider.selectSingleQueryByID2("management", "selectSortList", in_data, function(err, out_data, params) {
    logger.debug(out_data);
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    }
    logger.debug('management/restapi/getMenuList -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/menu/:id', function(req, res) {
  mainmenu.management = ' open selected';
  logger.debug(req.params.id);
  // 신규 등록
  if (req.params.id === 'editMenu') {
    var in_data = { INDEX: indexMenu, TYPE: "menu", ID: "code", SORT : "code" };
     queryProvider.selectSingleQueryByID2("management", "selectSortList", in_data, function(err, out_data, params) {
      logger.debug(out_data);
      var list = [];
      out_data.forEach(function(d){
        if(parseInt(d._source.code)%1000 == 0 && d._source.code != "0000") {
          list.push(d._source);
        }
      });
      res.render('./management/menu_edit', { title: global.config.productname, mainmenu:mainmenu, list:list });
    });
  }
});

// menu 신규 등록
router.post('/menu/:id', function(req, res) {
  var in_data = {   INDEX: indexMenu, TYPE: "menu",   ID : "code",
                    VALUE: req.params.id, NAME: req.body.name, UPCODE: req.body.upcode };
  queryProvider.selectSingleQueryByID2("management", "selectById", in_data, function(err, out_data, params) {
    if (out_data.length != 0){
      var rtnCode = CONSTS.getErrData('D005');
      res.json({rtnCode: rtnCode});
    }  else  {
      queryProvider.insertQueryByID("management", "insertMenu", in_data, function(err, out_data) {
        logger.debug(out_data);
        if(out_data.result == "created"){
          logger.debug(out_data);
          var rtnCode = CONSTS.getErrData("D001");
          if(parseInt(req.params.id)%1000 != 0){
            var in_data = { INDEX: indexAuthMenu, TYPE: "auth", ID : out_data._id, CODE : req.params.id };
            queryProvider.insertQueryByID("management", "insertAuthMenu", in_data, function(err, out_data) {
              logger.debug(out_data);
              if(out_data.result == "created"){
                var rtnCode = CONSTS.getErrData("D001");
              }
              if (err) { logger.debug(err) };
              res.json({rtnCode: rtnCode});
            });
          }
        }
        if (err) { logger.debug(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

router.get('/menu_upper', function(req, res, next) {
  logger.debug('menu/menu_upper');
  var in_data = { INDEX: indexMenu, TYPE:"menu", SORT : "code" };
  var list = [];
  queryProvider.selectSingleQueryByID2("management", "selectSortList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(d._source.upcode == "0000"){
          list.push(d);
        }
      });
    }
    res.render('./management/menu_upper', { title: global.config.productname, mainmenu:mainmenu, list:list });
  });
});

// update
router.put('/menu_upper/:id', function(req, res, next) {
  logger.debug('menu_upper/update');
  var in_data = { INDEX: indexMenu, TYPE:"menu", ID : req.body.id,
                  CODE : req.body.code, NAME : req.body.name, UPCODE : req.body.upcode };
  queryProvider.updateQueryByID("management", "updateMenu", in_data, function(err, out_data, params) {
    if(out_data.result == "updated"){
      var rtnCode = CONSTS.getErrData("D002");
    } else if(out_data.result == "noop"){
      var rtnCode = CONSTS.getErrData("D007");
    } else {
      var rtnCode = CONSTS.getErrData("D006");
    }
    if (err) { logger.debug(err);   }
    res.json({rtnCode: rtnCode});
  });
});

// update
router.put('/menu/:id', function(req, res, next) {
  logger.debug('menu/update');
  var in_data = { INDEX: indexMenu, TYPE:"menu", ID : req.body.id, CODE : req.body.code, NAME : req.body.name, UPCODE : req.body.upcode };
  queryProvider.updateQueryByID("management", "updateMenu", in_data, function(err, out_data, params) {
    if(out_data.result == "updated"){
      var rtnCode = CONSTS.getErrData("D002");
      var in_data = { INDEX: indexAuthMenu, TYPE:"auth", ID : req.body.id, CODE : req.body.code };
      queryProvider.updateQueryByID("management", "updateAuthMenuCode", in_data, function(err, out_data, params) {
        if(out_data.result == "updated"){
          var rtnCode = CONSTS.getErrData("D002");
        } else if(out_data.result == "noop"){
          var rtnCode = CONSTS.getErrData("D007");
        } else {
          var rtnCode = CONSTS.getErrData("D006");
        }
        if (err) { logger.debug(err);   }
        res.json({rtnCode: rtnCode});
      });
    }
    if (err) { logger.debug(err);   }
    res.json({rtnCode: rtnCode});
  });
});

// update
router.put('/menu_auth/:id', function(req, res, next) {
  logger.debug('updateAuthMenu');
  if(req.body.role == undefined){
    var query = "updateAuthMenuNone";
    var in_data = { INDEX: indexAuthMenu, TYPE:"auth", ID : req.body.id };
  } else {
    query = "updateAuthMenu";
    var in_data = { INDEX: indexAuthMenu, TYPE:"auth", ID : req.body.id, ROLE : req.body.role };
  }
  console.log(in_data);
  queryProvider.updateQueryByID("management", query, in_data, function(err, out_data, params) {
    if(out_data.result == "updated"){
      var rtnCode = CONSTS.getErrData("D002");
    } else if(out_data.result == "noop"){
      var rtnCode = CONSTS.getErrData("D007");
    } else {
      var rtnCode = CONSTS.getErrData("D006");
    }
    if (err) { logger.debug(err);   }
    res.json({rtnCode: rtnCode});
  });
});


// menu 정보 삭제
router.delete('/menu/:id', function(req, res) {
  logger.debug('delete menu_upper');
  var in_data = { INDEX: indexMenu, TYPE: "menu", ID: req.params.id };
  queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
    if(out_data.result == "deleted");
      var rtnCode = CONSTS.getErrData("D003");
      var in_data = { INDEX: indexAuthMenu, TYPE: "auth", ID: req.params.id };
      queryProvider.deleteQueryByID("management", "deleteById", in_data, function(err, out_data) {
        if(out_data.result == "deleted");
          var rtnCode = CONSTS.getErrData("D003");
        if(err){ logger.debug(err);    }
        res.json({rtnCode: rtnCode, rtnData : out_data});
      });
    if(err){ logger.debug(err);    }
    res.json({rtnCode: rtnCode, rtnData : out_data});
  });
});

router.get('/restapi/getCodeList', function(req, res) {
  logger.debug('getCodeList');
  var in_data = { INDEX: indexMenu, TYPE: "menu", SORT : "code", ID: "upcode", VALUE : req.query.upcode };
  queryProvider.selectSingleQueryByID2("management", "selectByIdSort", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getAuthMenu', function(req, res) {
  logger.debug('getAuthRole');
  var in_data = {  INDEX: indexRole, TYPE: "role" };
  queryProvider.selectSingleQueryByID2("management", "selectList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      var in_data = { INDEX: indexAuthMenu, TYPE: "auth", SORT : "role", ID : "code", VALUE : req.query.code };
      var roleList = out_data;
      queryProvider.selectSingleQueryByID2("management", "selectById", in_data, function(err, out_data, params) {
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }
        var menuAuth = out_data[0]._source;
       res.json({rtnCode: rtnCode, menuAuth : menuAuth, roleList : roleList });
      });
    }
    res.json({rtnCode: rtnCode, menuAuth : menuAuth, roleList : roleList });
  });
});

router.get('/restapi/getAlarmList', function(req, res, next) {
  logger.debug('start /restapi/getAlarmList');
  selectAlarmList(function(data) {
    res.json({rtnCode: data.rtnCode, rtnData: data.rtnData, rtnCount : data.rtnCount});
  })
});

function selectAlarmList(cb) {
  var d = new Date();
  var in_data = {
    INDEX: CONSTS.SCHEMA.EFSM_ALARM.INDEX + d.toFormat('YYYY.MM.DD'),
    TYPE: 'AgentAlarm',
    SORT: "timestamp" };
  var rtnCode = CONSTS.getErrData('0000');
  queryProvider.selectSingleQueryByID2("management", "selectAlarmList", in_data, function(err, out_data, count) {
    // logger.debug(out_data);
    if (count == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    }
    logger.debug('selectAlarmList -> count : ' + count);
    cb({rtnCode: rtnCode, rtnData: out_data, rtnCount : count});
  });
}

function saveAlarmData(data, cb) {
  logger.debug('start saveAlarmData');
  var d = new Date();
  var in_data = {
    INDEX: CONSTS.SCHEMA.EFSM_ALARM.INDEX + d.toFormat('YYYY.MM.DD'),
    TYPE: 'AgentAlarm',
    BODY : JSON.stringify(data)};

  queryProvider.insertQueryByID("management", "insertAlarmData", in_data, function(err, out_data) {
    logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (err) {
      logger.debug(err)
      rtnCode.code = 'UNDEFINED';
      rtnCode.message = err;
    };
    if(out_data.result == "created"){
      rtnCode = CONSTS.getErrData("D001");
    }
    logger.debug('end saveAlarmData');
    cb({rtnCode: rtnCode});
  });
}

router.get('/authority', function(req, res, next) {
  logger.debug('management/restapi/authority');
  mainmenu.management = ' open selected';
  res.render('./management/authority', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/asset', function(req, res, next) {
  logger.debug('asset');
  var in_data = { INDEX: indexUser, TYPE: "user" };
  queryProvider.selectSingleQueryByID2("management", "selectList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug(out_data);
    var users = out_data;
    res.render('./management/asset'+global.config.pcode, { title: global.config.productname, mainmenu:mainmenu, users:users });
  });
});

module.exports = router;
module.exports.selectAlarmList = selectAlarmList;
module.exports.saveAlarmData = saveAlarmData;
