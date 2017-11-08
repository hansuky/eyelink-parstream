var CONSTS = require('./consts');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {home: 'is-selected', info: '', job: '', staff: '', consult: '', event: ''};

/* GET home page. */
 router.get('/nodes', function(req, res, next) {
  console.log('node');
     var in_data = {};
  queryProvider.selectSingleQueryByID("node","selectNodeList", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
  res.render('./node/nodes', { title: global.config.productname, nodeData:out_data[0]});
    });
});

router.get('/status', function(req, res, next) {
  console.log('node');
    var in_data = {};
  queryProvider.selectSingleQueryByID("node","selectNodeList", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log(out_data[0]);
  res.render('./node/node_status', { title: global.config.productname, nodeData:out_data[0]});
     });
});

router.get('/als', function(req, res, next) {
  console.log('node');
  // res.redirect('/dashboard/');
  res.render('./node/registration_als', { title: global.config.productname });
});

router.get('/gps', function(req, res, next) {
  console.log('node');
  // res.redirect('/dashboard/');
  res.render('./node/registration_gps', { title: global.config.productname});
});


router.get('/restapi/getNodeList', function(req, res, next) {
  console.log(req.query);
  var in_data = {};
  queryProvider.selectSingleQueryByID("node", "selectNodeList", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('node/restapi/getNodeList -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});


module.exports = router;