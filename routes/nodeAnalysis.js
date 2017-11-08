var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var fs = require('fs');
var net = require('net');
var router = express.Router();
var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;

var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis: 'open selected', management:'', settings:''};


/* GET reports page. */
router.get('/', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/clustering', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/clustering', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/clustering', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/cluster_detail', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/cluster_detail', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/clusteringPop', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/clustering_popup', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/runalaysis', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/runanalysis', { title: global.config.productname, mainmenu:mainmenu});
});
/*router.get('/clustering', function(req, res, next) {
   var in_data = {};
  queryProvider.selectSingleQueryByID("analysis", "selectDaClusterMasterAll", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log(out_data[0]);
    var master = out_data[0];
    queryProvider.selectSingleQueryByID("analysis", "selectDaClusterDetailAll", in_data, function(err, out_data, params) {
      var rtnCode = CONSTS.getErrData('0000');
      if (out_data[0] === null) {
        rtnCode = CONSTS.getErrData('0001');
      }
      console.log(out_data[0]);
      var detail = out_data[0];
      res.render('./analysis/clustering', { title: 'EyeLink for ParStream', mainmenu:mainmenu, master:master, detail:detail});
    });
  });
});*/

// query RawData
router.get('/restapi/getDaClusterDetail', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      DADATE : req.query.daDate,
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("analysis", "selectDaClusterDetail", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getDaClusterDetail -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});



router.get('/restapi/getDaClusterMasterByDadate', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      DADATE: req.query.daDate,
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("analysis", "selectDaClusterMasterByDadate", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getDaClusterMaster -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

router.get('/restapi/getDaClusterMasterAll', function(req, res, next) {
  console.log(req.query);
  var in_data = {};
  queryProvider.selectSingleQueryByID("analysis", "selectDaClusterMasterAll", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getDaClusterMasterAll -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

// query RawData
router.get('/restapi/getClusterNodePower', function(req, res, next) {
  console.log(req.query);
  console.log(req.query.nodeId[0]);
  var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      NODE: req.query.nodeId,
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }

    // console.log('typeof array : %s', (typeof out_data[0] !== 'undefined'));
    // console.log('typeof array : %s', (out_data[0] !== null));

    // console.log('analysis/restapi/getReportRawData -> out_data : %s', out_data);
    // console.log('analysis/restapi/getReportRawData -> out_data : %s', out_data[0]);
    console.log('analysis/restapi/getClusterNodePower -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});

// query RawData
router.get('/restapi/getClusterRawData', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      START_TIMESTAMP: req.query.startDate + ' 00:00:00',
      END_TIMESTAMP: req.query.endDate + ' 23:59:59',
      NODE: req.query.node,
      FLAG : 'N'};
  queryProvider.selectSingleQueryByID("analysis", "selectClusterRawData", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getClusterRawData -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]});
  });
});


// run analysis
router.post('/restapi/runAnalysis', function(req, res, next) {
  console.log(req.query);
  var in_data = {"start_date": req.body.startDate,
                "end_date": req.body.endDate,
                "time_interval": parseInt(req.body.interval)};
  in_data = JSON.stringify(in_data, null, 4);
  console.log(in_data);
  // FIX-ME Socket Connection Close 처리 로직 보완 필요함.
  getConnectionToDA("DataAnalysis", function(socket) {
    writeDataToDA(socket, in_data, function() {
      var rtnCode = CONSTS.getErrData('0000');
      res.json({rtnCode: rtnCode, rtnData: ''});
    });
  });
});

// insert RawData
router.post('/restapi/insertClusterRawData', function(req, res, next) {
  console.log('/restapi/insertClusterRawData start ');
  // console.log('/restapi/insertClusterRawData -> body : %j', req.body);
  // console.log('/restapi/insertClusterRawData -> master : %j', req.body.tb_da_clustering_master);
  // console.log('/restapi/insertClusterRawData -> detail : %j', req.body.tb_da_clustering_detail);

  req.body.tb_da_clustering_master.forEach(function(d) {
    var in_data = {
      DATIME : d.da_time, START : d.start_date+' 00:00:00.0',  END : d.end_date+' 23:59:59.0', TIMEINTERVAL : d.time_interval ,
      C0VOL : d.c0_voltage, C1VOL : d.c1_voltage, C2VOL : d.c2_voltage, C3VOL : d.c3_voltage,
      C0AMP : d.c0_ampere, C1AMP : d.c1_ampere, C2AMP : d.c2_ampere, C3AMP : d.c3_ampere,
      C0ACT : d.c0_active_power, C1ACT : d.c1_active_power, C2ACT : d.c2_active_power, C3ACT : d.c3_active_power,
      C0POW : d.c0_power_factor, C1POW : d.c1_power_factor, C2POW : d.c2_power_factor, C3POW : d.c3_power_factor,
     };
    queryProvider.insertQueryByID("analysis", "insertClusteringMaster", in_data, function(err, out_data) {
      console.log('/restapi/insertClusterRawData -> insertClusteringMaster result : %s ', out_data);
    });
  });

  // req.body.tb_da_clustering_detail.forEach(function(d) {
  //   console.log(d);
  // });


  req.body.tb_da_clustering_detail.forEach(function(d) {
    var in_data = {
      DATIME : d.da_time, EVENTTIME : d.event_time,
      C0VOL : d.c0_voltage, C1VOL : d.c1_voltage, C2VOL : d.c2_voltage, C3VOL : d.c3_voltage,
      C0AMP : d.c0_ampere, C1AMP : d.c1_ampere, C2AMP : d.c2_ampere, C3AMP : d.c3_ampere,
      C0ACT : d.c0_active_power, C1ACT : d.c1_active_power, C2ACT : d.c2_active_power, C3ACT : d.c3_active_power,
      C0POW : d.c0_power_factor, C1POW : d.c1_power_factor, C2POW : d.c2_power_factor, C3POW : d.c3_power_factor,
     };
    queryProvider.insertQueryByID("analysis", "insertClusteringDetail", in_data, function(err, out_data) {
      console.log('/restapi/insertClusterRawData -> insertClusteringDetail result : %s ', out_data);
    });
  });

  // TO-DO 일단 파일로 저장함. DB로 INSERT 로직 추가 구현 필요함.
  // var clustering_data = req.body;
  // var clustering_data = JSON.parse(req.body);
  // var clustering_data = JSON.stringify(req.body, null, 4);
  // console.log(clustering_data);
/*  fs.writeFile('./insertClusterRawData.log', clustering_data, function(err) {
    if(err) throw err;
    console.log('File write completed');
  });*/
  // var in_data = {
  //     START_TIMESTAMP: req.query.startDate + ' 00:00:00',
  //     END_TIMESTAMP: req.query.endDate + ' 23:59:59',
  //     NODE: req.query.node,
  //     FLAG : 'N'};
  // queryProvider.selectSingleQueryByID("analysis", "selectClusterRawData", in_data, function(err, out_data, params) {
  //   // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');

    // console.log('analysis/restapi/getReportRawData -> out_data : %s', out_data);
    // console.log('analysis/restapi/getReportRawData -> out_data : %s', out_data[0]);
    // console.log('analysis/restapi/getClusterRawData -> length : %s', out_data[0].length);
    res.json({rtnCode: rtnCode, rtnData: ''});
  // });
});


function getConnectionToDA(connName, callback){
  var pUrl = global.config.analysis.host;
  var pPort = global.config.analysis.port;
  // var pUrl = 'm2u-da.eastus.cloudapp.azure.com';
  // var pUrl = 'localhost';
  var client = net.connect({port: pPort, host:pUrl}, function() {
    console.log(connName + ' Connected: ');
    console.log('   local = %s:%s', this.localAddress, this.localPort);
    console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
    this.setTimeout(500);
    this.setEncoding('utf8');
    this.on('data', function(data) {
      console.log(connName + " From Server: " + data.toString());
      this.end();
    });
    this.on('end', function() {
      console.log(connName + ' Client disconnected');
    });
    this.on('error', function(err) {
      console.log('Socket Error: ', JSON.stringify(err));
    });
    this.on('timeout', function() {
      console.log('Socket Timed Out');
    });
    this.on('close', function() {
      console.log('Socket Closed');
    });
    callback(client);
  });
  // return client;
}

function writeDataToDA(socket, data, callback){
  var success = !socket.write(data);
  console.log('success : ' + success);
  if (!success){
    (function(socket, data){
      socket.once('drain', function(){
        console.log('drain');
        writeData(socket, data, callback);
      });
    })(socket, data);
  }

  if (success) {
    callback();
  }
}



module.exports = router;