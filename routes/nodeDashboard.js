var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
require('date-utils');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'open selected', timeseries:'', reports:'', analysis:'', management:'', settings:''};

/* GET reports page. */
router.get('/', function(req, res, next) {
  // console.log(_rawDataByDay);
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/main', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/timeseries', function(req, res, next) {
  // console.log(_rawDataByDay);
  mainmenu.dashboard = '';
  mainmenu.timeseries = ' open selected';
  res.render('./dashboard/timeseries', { title: global.config.productname, mainmenu:mainmenu });
});


// test db query logic
router.get('/restapi/get_successcount', function(req, res, next) {
  var in_data = {};
  queryProvider.selectSingleQueryByID("dashboard", "selectSuccessCount", in_data, function(err, out_data) {
    console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data});
  });
});

// test db query logic
router.get('/restapi/get_query_param', function(req, res, next) {
  console.log(req.query);
  var in_data = {};
  queryProvider.selectSingleQueryByID("dashboard", "selectQueryInParams", in_data, function(err, out_data) {
    console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data});
  });
});


// query Dashboard Section 1
router.get('/restapi/getDashboardSection1', function(req, res, next) {
  console.log(req.query);
   var in_data = {
      TODAY_TIMESTAMP: req.query.todate,
      YESTERDAY_TIMESTAMP: req.query.yesterdate,
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("dashboard", "selectDashboardSection1", in_data, function(err, out_data) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });

});

// query RawData
router.get('/restapi/getDashboardRawData', function(req, res, next) {
  // load data on startup이 true일 경우
  if (global.config.loaddataonstartup.active) {
    var in_data = {MERGE:'Y'};
    queryProvider.selectSingleQueryByID("dashboard", "selectEventRawData", in_data, function(err, out_data, params) {
      // console.log(out_data);
      var rtnCode = CONSTS.getErrData('0000');
      if (out_data[0] === null) {
        rtnCode = CONSTS.getErrData('0001');
      }

      // console.log('typeof array : %s', (typeof out_data[0] !== 'undefined'));
      // console.log('typeof array : %s', (out_data[0] !== null));

      // MERGE = 'Y'이면 이전 날짜의 RawData를 합쳐준다.
      if (params.MERGE === 'Y')
        out_data = Utils.mergeLoadedData(out_data);

      // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data);
      // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data[0]);
      console.log('dashboard/restapi/getDashboardRawData -> length : %s', out_data[0].length);
      res.json({rtnCode: rtnCode, rtnData: out_data[0]});
    });
  } else {  // false 인 경우는 현재일자부터 7일전 리스트를 조회.
    var d = new Date();
    var to_date = d.toFormat('YYYY-MM-DD');
    getTbRawDataByPeriod(d.removeDays(7).toFormat('YYYY-MM-DD'), to_date, res);
  }
});

// TO-DO Query 성능 개선 필요.
// query RawData
router.get('/restapi/getTbRawDataByPeriod', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("dashboard", "selectEventRawDataOld", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data);
    // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data[0]);
    console.log('dashboard/restapi/getTbRawDataByPeriod -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

function getTbRawDataByPeriod(from_date, to_date, res) {
  var in_data = {
      START_TIMESTAMP: from_date + ' 00:00:00',
      END_TIMESTAMP: to_date + ' 23:59:59',
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("dashboard", "selectEventRawDataOld", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data);
    // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data[0]);
    console.log('dashboard/restapi/getTbRawDataByPeriod -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
};

module.exports = router;