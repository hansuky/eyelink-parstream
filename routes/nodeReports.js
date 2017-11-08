var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'open selected', analysis:'', management:'', settings:''};


/* GET reports page. */
router.get('/', function(req, res, next) {
  res.render('./reports/report_all', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/main', function(req, res, next) {
  res.render('./reports/main', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/d3', function(req, res, next) {
  res.render('./reports/report_d3', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/test', function(req, res, next) {
  res.render('./reports/test', { title: 'Test', mainmenu:mainmenu });
});

router.get('/all', function(req, res, next) {
  res.render('./reports/report_all', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/power', function(req, res, next) {
  res.render('./reports/report_power', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/fault', function(req, res, next) {
  res.render('./reports/fault_notification', { title: global.config.productname, mainmenu:mainmenu });
});

router.get('/d3', function(req, res, next) {
  res.render('./report_d3', { title: 'Report_d3', mainmenu:mainmenu });
});

router.get('/live', function(req, res, next) {
  res.render('./reports/report_live', { title: global.config.productname, mainmenu:mainmenu });
});



// query Report
router.get('/restapi/getReportRawData', function(req, res, next) {
  console.log('reports/restapi/getReportRawData');
  var in_data = {MERGE:'Y'};
  queryProvider.selectSingleQueryByID("reports","selectEventRawData", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    // MERGE = 'Y'이면 이전 날짜의 RawData를 합쳐준다.
    if (params.MERGE === 'Y')
      out_data = Utils.mergeLoadedData(out_data);

    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

// query Report
router.get('/restapi/testData', function(req, res, next) {
  console.log('reports/restapi/testData');
  var in_data = {MERGE:'Y'};
  queryProvider.selectSingleQueryByID("reports","testData", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });

});

// query RawData
router.get('/restapi/getTbRawDataByPeriod', function(req, res, next) {
  console.log(req.query);
   var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("reports","selectEventRawDataOld", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    console.log('reports/restapi/getTbRawDataByPeriod -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

// query RawData Power
router.get('/restapi/getTbRawDataByPeriodPower', function(req, res, next) {
  console.log(req.query);
   var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("reports","selectEventRawDataPower", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    console.log('reports/restapi/getTbRawDataByPeriodPower -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

// query RawData Power All
router.get('/restapi/getTbRawDataByAllPower', function(req, res, next) {
  console.log(req.query);
   var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("reports","selectEventRawDataPowerAll", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    console.log('reports/restapi/getTbRawDataByAllPower -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

module.exports = router;
