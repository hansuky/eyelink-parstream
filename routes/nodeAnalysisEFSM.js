var Logger = require('./log4js-utils').Logger;
var logger = new Logger('nodeDashboardEFSM');
var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var fs = require('fs');
var net = require('net');
var router = express.Router();
var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;

var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis: 'open selected', management:'', settings:''};

var indexCore = global.config.es_index.es_corecode;
var indexClusteringMaster = global.config.da_index.clustering_master;
var indexClusteringDetail = global.config.da_index.clustering_detail;
var indexPatternData = global.config.da_index.ad_pattern_data;
var indexPatternInfo = global.config.da_index.ad_pattern_info;
var indexPatternMatching = global.config.da_index.ad_pattern_matching;

var startTime = CONSTS.STARTTIME.KOREA;
var fmt1 = CONSTS.DATEFORMAT.DATE; // "YYYY-MM-DD",
var fmt2 = CONSTS.DATEFORMAT.DATETIME; // "YYYY-MM-DD HH:MM:SS",
var fmt4 = CONSTS.DATEFORMAT.INDEXDATE; // "YYYY.mm.DD",

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

router.get('/anomaly', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/anomaly', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/anomaly_new', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/anomaly_new', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/pattern', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/pattern', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/patternMatching', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/patternMatching', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/postTest', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/postTest', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/pattern_list', function(req, res, next) {
  console.log(_rawDataByDay);
  res.render('./analysis/pattern_list', { title: global.config.productname, mainmenu:mainmenu});
});


router.post('/restapi/insertAnomaly/:id', function(req, res, next) {
  console.log('/analysis/restapi/insertAnomaly');
  console.log(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = {    INDEX: indexPatternData, TYPE: "pattern_data", ID: id   };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      console.log(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {    INDEX: indexPatternData, TYPE: "pattern_data", ID: id,   BODY : JSON.stringify(req.body)   };
     queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
          console.log(out_data);
          if(out_data.result == "created"){
            console.log(out_data);
            var rtnCode = CONSTS.getErrData("D001");
          }
        if (err) { console.log(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

router.post('/restapi/insertPatternInfo/:id', function(req, res, next) {
  console.log('/analysis/restapi/insertPatternInfo');
  console.log(JSON.stringify(req.body));
  var id = req.params.id;
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: id   };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
    }  else  {
      var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: id,   BODY : JSON.stringify(req.body)   };
      queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          console.log(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { console.log(err); }
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

router.post('/restapi/insertAnomalyPattern/:id', function(req, res, next) {
  console.log('/analysis/restapi/insertAnomalyPattern');
  console.log(JSON.stringify(req.body));
  var in_data = { INDEX: indexPatternMatching, TYPE: "pattern_matching", ID: req.params.id   };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
    }  else  {
      var in_data = { INDEX: indexPatternMatching, TYPE: "pattern_matching", ID: req.params.id,   BODY : JSON.stringify(req.body)   };
      queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          console.log(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { console.log(err); }
        res.json({rtnCode: rtnCode});
      });
    }
     res.json({rtnCode: rtnCode});
  });
});



router.delete('/restapi/deleteAnomaly/:id', function(req, res, next) {
  console.log('/analysis/restapi/deleteAnomaly');
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.params.id };
  queryProvider.deleteQueryByID("analysis", "deleteById", in_data, function(err, out_data) {
    if(out_data.result == "deleted"){
      var rtnCode = CONSTS.getErrData("D003");
    }
    res.json({rtnCode: rtnCode});
  });
});

// query RawData
router.get('/restapi/getAnomaly/:id', function(req, res, next) {
  console.log(req.query);
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.params.id}
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      console.log('test');
      res.json({rtnCode: rtnCode});
    }
    console.log('analysis/restapi/getDaClusterDetail -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source});
  })
});

// get pattern about selected cluster
router.get('/restapi/getClusterPattern', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      INDEX: indexPatternData, TYPE: "pattern_data",
      ID: req.query.id,
      TARGET: req.query.target
  };
  console.log(in_data);
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
    console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      console.log('test');
      res.json({rtnCode: rtnCode});
    }
    console.log('analysis/restapi/getClusterPattern -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source});
  })
});

// patterns
router.get('/restapi/getPatterns', function(req, res, next) {
  console.log(req.query);
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: req.query.id}
  queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    }
    console.log('analysis/restapi/getPatterns -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source});
  })
});

// pattern data 업데이트
router.post('/restapi/pattern_data/:id/_update', function(req, res, next) {
  console.log('/analysis/restapi/pattern_data/:id/_update');
  console.log(JSON.stringify(req.body));
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.params.id };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] == null){
      var rtnCode = CONSTS.getErrData('E001');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    } else {
      var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.params.id, BODY: JSON.stringify(req.body)};
      queryProvider.updateQueryByID("analysis", "updatePatternData", in_data, function(err, out_data) {
        if(out_data.result == "updated"){
          var rtnCode = CONSTS.getErrData("D002");
          logger.debug((out_data.result));
        } else if (out_data.result == "noop") {
          var rtnCode = CONSTS.getErrData("D007");
          logger.debug((out_data.result));
        }
        if (err) { logger.debug(err);}
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

// pattern_info 정보 수정
router.post('/restapi/pattern_info/:id/_update/', function(req, res, next) {
  console.log('/analysis/restapi/pattern_info/:id/_update');
  console.log(JSON.stringify(req.body));
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: req.params.id };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] == null){
      var rtnCode = CONSTS.getErrData('E001');
    } else {
      var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: req.params.id, BODY: JSON.stringify(req.body)};
      queryProvider.updateQueryByID("analysis", "updatePatternInfo", in_data, function(err, out_data) {
        if(out_data.result == "updated"){
          var rtnCode = CONSTS.getErrData("D002");
        } else if (out_data.result == "noop") {
          var rtnCode = CONSTS.getErrData("D007");
        }
        if (err) { console.log(err);}
        res.json({rtnCode: rtnCode});
      });
    }
  });
});




// query RawData
router.get('/restapi/getAnomalyPattern/:id', function(req, res, next) {
  var in_data = {  INDEX: indexPatternMatching, TYPE: "pattern_matching" , ID: req.params.id};
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length === 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      console.log('f');
      console.log(out_data);
      var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
      var day = new Date().toString().split(' ');
      var id = day[3]+'-'+mon[day[1]]+'-'+day[2];
      var in_data = {  INDEX: indexPatternData, TYPE: "pattern_data" , ID: id };
      var pattern = out_data[0]._source ;
      queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data,  function(err, out_data, params) {
        var clust = out_data[0]._source.pattern_data;
        console.log(pattern);
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data[0] === null) {   rtnCode = CONSTS.getErrData('0001');
         res.json({rtnCode: rtnCode});   }
        console.log('analysis/restapi/getAnomaly -> length : %s', out_data.length);
        res.json({rtnCode: rtnCode, pattern : pattern, clust : clust});
      });
    }
        console.log('analysis/restapi/getAnomalyPattern -> length : %s', out_data.length);
        res.json({rtnCode: rtnCode, pattern : pattern, clust : clust});
  });
});

// pattern dataset
router.get('/restapi/getAnomalyPatternList', function(req, res, next) {
  console.log("req.query:", req.query);
  var sDate = Utils.getDateLocal2UTC(req.query.startDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.query.endDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  console.log("convert utc:", sDate, eDate);
  console.log("master id: ", req.query.masterId);
  var in_data = {
      INDEX : indexPatternData, TYPE : "pattern_data",
      START_TIMESTAMP: sDate,
      END_TIMESTAMP: eDate,
      MASTER_ID: req.query.masterId};

  var sql = "selectPatternList";

  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getAnomalyPatternList -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

// anomaly pattern dataset by date range
router.get('/restapi/getAnomaly_Pattern', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      INDEX : indexPatternMatching, TYPE : "pattern_matching",
      START_TIMESTAMP: req.query.startTime,
      END_TIMESTAMP: req.query.endTime};

  var sql = "selectAnomaly_Pattern";

  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getAnomaly_Pattern -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

// query RawData
router.get('/restapi/getAnomalyChartData', function(req, res, next) {    
  var now = Utils.getToday(fmt2);
  var end = Utils.getDateLocal2UTC(Utils.getDate(now, fmt2, 0, 0, 0, 10), fmt2, 'Y');
  var in_data = {  
        INDEX: indexPatternMatching, TYPE: "pattern_matching", 
        gte : Utils.getDateLocal2UTC(Utils.getDate(now, fmt2, 0, 0, -10, 0), fmt2, 'Y'), 
        lte : end }   
  queryProvider.selectSingleQueryByID2("analysis", "selectByAnalysisTimestamp", in_data, function(err, out_data, params) {        
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      console.log('null');
      rtnCode = CONSTS.getErrData('0001');
    } else if(out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
    } else {            
      var pattern = out_data[0]._source.da_result;
      var in_data = { INDEX: indexPatternData, TYPE: "pattern_data" , ID: "master", 
        list : ["pattern_data.active_power."+pattern.active_power.top_1,"pattern_data.active_power."+pattern.active_power.top_2+".center","pattern_data.active_power."+pattern.active_power.top_3+".center",
        "pattern_data.voltage."+pattern.voltage.top_1,"pattern_data.voltage."+pattern.voltage.top_2+".center","pattern_data.voltage."+pattern.voltage.top_3+".center",
        "pattern_data.power_factor."+pattern.power_factor.top_1,"pattern_data.power_factor."+pattern.power_factor.top_2+".center","pattern_data.power_factor."+pattern.power_factor.top_3+".center",
        "pattern_data.ampere."+pattern.ampere.top_1,"pattern_data.ampere."+pattern.ampere.top_2+".center","pattern_data.ampere."+pattern.ampere.top_3+".center"] };        
      queryProvider.selectSingleQueryByID2("analysis", "selectAnomalyMatch", in_data,  function(err, out_data, params) {                                
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          console.log('null');
         rtnCode = CONSTS.getErrData('0001');
        } else if(out_data.length == 0) {
           rtnCode = CONSTS.getErrData('0001');
        } else {        
          var clust = out_data[0]._source.pattern_data;   

          var start = Utils.getDate(pattern.timestamp, fmt2, 0, 0, -50, -10, 'Y');          
          var in_data = { index : indexCore+'*', type : "corecode",
                gte: start, lte: end,  NODE: ["0002.00000039"], FLAG : 'N'};    
         queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
            var rtnCode = CONSTS.getErrData('0000');
            if (out_data == null) {
              rtnCode = CONSTS.getErrData('0001');
            } else if(out_data.length == 0) {
              rtnCode = CONSTS.getErrData('0001');
            } else {
              console.log('analysis/restapi/getClusterNodePower -> length : %s', out_data.length);
              var vdata = [], adata = [], pfdata = [], apdata = [];                  
              var vapt = [], aapt = [], pfapt = [], apapt = [], vcpt = [], acpt = [], pfcpt = [], apcpt = [];
              for(i=59; i<120; i++){                  
                var date = new Date(start).getTime()+(i-59)*60*1000;
                vdata.push({date : date, center : clust.voltage[pattern.voltage.top_1].center[i], center2 : clust.voltage[pattern.voltage.top_2].center[i], center3 : clust.voltage[pattern.voltage.top_3].center[i], min : clust.voltage[pattern.voltage.top_1].min_value[i], max : clust.voltage[pattern.voltage.top_1].max_value[i], lower : clust.voltage[pattern.voltage.top_1].lower[i], upper : clust.voltage[pattern.voltage.top_1].upper[i] });                                
                adata.push({date : date, center : clust.ampere[pattern.ampere.top_1].center[i], center2 : clust.ampere[pattern.ampere.top_2].center[i], center3 : clust.ampere[pattern.ampere.top_3].center[i], min : clust.ampere[pattern.ampere.top_1].min_value[i], max : clust.ampere[pattern.ampere.top_1].max_value[i], lower : clust.ampere[pattern.ampere.top_1].lower[i], upper : clust.ampere[pattern.ampere.top_1].upper[i] });
                apdata.push({date : date, center : clust.active_power[pattern.active_power.top_1].center[i], center2 : clust.active_power[pattern.active_power.top_2].center[i], center3 : clust.active_power[pattern.active_power.top_3].center[i], min : clust.active_power[pattern.active_power.top_1].min_value[i], max : clust.active_power[pattern.active_power.top_1].max_value[i], lower : clust.active_power[pattern.active_power.top_1].lower[i], upper : clust.active_power[pattern.active_power.top_1].upper[i] });
                pfdata.push({date : date, center : clust.power_factor[pattern.power_factor.top_1].center[i], center2 : clust.power_factor[pattern.power_factor.top_2].center[i], center3 : clust.power_factor[pattern.power_factor.top_3].center[i], min : clust.power_factor[pattern.power_factor.top_1].min_value[i], max : clust.power_factor[pattern.power_factor.top_1].max_value[i], lower : clust.power_factor[pattern.power_factor.top_1].lower[i], upper : clust.power_factor[pattern.power_factor.top_1].upper[i] });
                if(i<110) {
                  if(pattern.ampere.caution_pt[i] != -1){
                    acpt.push({ date : date, value : pattern.ampere.caution_pt[i] });                 
                  }
                  if(pattern.voltage.caution_pt[i] != -1){
                    vcpt.push({ date : date, value : pattern.voltage.caution_pt[i] });
                  }
                  if(pattern.active_power.caution_pt[i] != -1){
                    apcpt.push({ date : date, value : pattern.active_power.caution_pt[i] });
                  }
                  if(pattern.power_factor.caution_pt[i] != -1){
                    pfcpt.push({ date : date, value : pattern.power_factor.caution_pt[i] });
                  }
                  if(pattern.ampere.anomaly_pt[i] != -1){
                    aapt.push({ date : date, value : pattern.ampere.anomaly_pt[i] });
                  }
                  if(pattern.voltage.anomaly_pt[i] != -1){
                    vapt.push({ date : date, value : pattern.voltage.anomaly_pt[i] });
                  }
                  if(pattern.active_power.anomaly_pt[i] != -1){
                    apapt.push({ date : date, value : pattern.active_power.anomaly_pt[i] });
                  }
                  if(pattern.power_factor.anomaly_pt[i] != -1){
                    pfapt.push({ date : date, value : pattern.power_factor.anomaly_pt[i] });
                  }               
                }                                
              }            
              pattern.timestamp = Utils.getDateUTC2Local(pattern.timestamp, fmt2);
              var anomaly = { vdata : vdata, adata : adata, apdata : apdata, pfdata : pfdata };              
              var pt = { vapt : vapt, aapt : aapt, apapt : apapt, pfapt : pfapt, vcpt : vcpt, acpt : acpt, apcpt : apcpt, pfcpt : pfcpt };              
              var data = [];
              var sdata = out_data[0]._source;              
              sdata.event_time = new Date(start).getTime();              
              data.push(sdata);              
              out_data.forEach(function(d){                
                d._source.event_time = new Date(d._source.event_time).getTime();
                data.push(d._source);                
              });      
              var last = data[data.length-1];
              last.date = new Date().getTime();
              data.push(last);
              res.json({rtnCode: rtnCode, raw : data, pattern : pattern, anomaly : anomaly, pt : pt});              
            }
          });
        }
        console.log('analysis/restapi/getAnomaly -> length : %s', out_data.length);
         res.json({rtnCode: rtnCode, anomaly : anomaly, raw : data, point : point});
      });
    }
    console.log('analysis/restapi/getAnomalyPattern -> length : %s', out_data.length);
     res.json({rtnCode: rtnCode, anomaly : anomaly, raw : data, point : point});
  });
});

router.get('/restapi/getAnomalyPatternCheck/', function(req, res, next) {  
  var now = Utils.getDateLocal2UTC(Utils.getToday(fmt2), fmt2, 'Y');  
  var start = Utils.getDateLocal2UTC(Utils.getDate(now, fmt2, 0, 0, -2, 0), fmt2, 'Y');  
  console.log('((((((((((((((((s')
  console.log(now, start);    
  var in_data = {  INDEX: indexPatternMatching, TYPE: "pattern_matching", 
        gte : start,     lte : now }   
  queryProvider.selectSingleQueryByID2("analysis", "selectByAnalysisTimestamp", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData : out_data});
  });
});

// query RawData
router.get('/restapi/getClusterNodeLive', function(req, res, next) {
  console.log('analysis/restapi/getClusterNodeLive');
  var today = Utils.getToday(fmt2);    
  var in_data = {
        index : indexCore+'*',      type : "corecode",
        gte: Utils.getDate(today, fmt2, 0, 0, -1, 0, 'Y'),
        lte: Utils.getDate(today, fmt2, 0, 0, 0, 1, 'Y'),
        NODE: ["0002.00000039"], FLAG : 'N'};  
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
     //console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
   var data = [];    
    out_data.forEach(function(d){                 
      data.push(d._source);
    });    
    console.log('analysis/restapi/getClusterNodeLive -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterNodePower', function(req, res, next) {
  console.log('analysis/restapi/getClusterNodePower');
  var today = Utils.getToday(fmt2);    
  var in_data = {
        index : indexCore+'*',   type : "corecode",
        gte: req.query.startDate, lte: req.query.endDate,
        NODE: req.query.nodeId.split(','), FLAG : 'N'};
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
     //console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
   var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });    
    console.log('analysis/restapi/getClusterNodeLive -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterRawData', function(req, res, next) {
  console.log(req.query)
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var start = new Date(req.query.startDate).getTime();
  var end = new Date(req.query.endDate).getTime();
  var index = [], cnt = 0;
  for(i = start; i<=end; i=i+24*60*60*1000){
    var d = new Date(i).toString().split(' ');
    index[cnt++]  = "corecode-"+d[3]+'-'+mon[d[1]]+'-'+d[2];
  }
  console.log(index);
  var in_data = {
      index : index, type : "corecode",
      gte: req.query.startDate,
      lte: req.query.endDate,
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterRawData", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterRawDataByNode', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      index : "corecode-*", type : "corecode",
      gte: req.query.startDate,
      lte: req.query.endDate,
      node : req.query.node
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterRawDataByNode", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getDataBySource', function(req, res, next) {
  console.log(req.query)
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var start = new Date(req.query.startDate).getTime();
  var end = new Date(req.query.endDate).getTime();
  var index = [], cnt = 0;
  for(i = start; i<=end; i=i+24*60*60*1000){
    var d = new Date(i).toString().split(' ');
    index[cnt++]  = "corecode-"+d[3]+'-'+mon[d[1]]+'-'+d[2];
  }
  console.log(index);
  var in_data = {
      index : "corecode-*", type : "corecode",
      gte: req.query.startDate,
      lte: req.query.endDate,
      Source : req.query.source.split(',')
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectDataBySource", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } 
    console.log('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });        
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

router.post('/restapi/insertClusterMaster/:id', function(req, res, next) {
  console.log('/analysis/restapi/insertClusterMaster');
  console.log(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = {    INDEX: indexClusterMaster, TYPE: "master", ID: id   };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      console.log(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {    INDEX: indexClusterMaster, TYPE: "master", ID: id,   BODY : JSON.stringify(req.body)   };
     queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
          console.log(out_data);
          if(out_data.result == "created"){
            console.log(out_data);

            var rtnCode = CONSTS.getErrData("D001");
          }
        if (err) { console.log(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

router.post('/restapi/insertClusterDetail/:id', function(req, res, next) {
  console.log('/analysis/restapi/insertClusterDetail');
  console.log(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = {    INDEX: indexClusterDetail, TYPE: "detail", ID: id   };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      console.log(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {    INDEX: indexClusterDetail, TYPE: "detail", ID: id,   BODY : JSON.stringify(req.body)   };
     queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
          console.log(out_data);
          if(out_data.result == "created"){
            console.log(out_data);
            var rtnCode = CONSTS.getErrData("D001");
          }
        if (err) { console.log(err) };
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

// query RawData
router.get('/restapi/getDaClusterDetail', function(req, res, next) {
  var in_data = {
      INDEX : indexClusterDetail,    TYPE : "detail",
      ID : req.query.daDate };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    console.log(err);
    console.log(out_data);
    if (out_data === null) {
      var rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode, rtnData: out_data});
    } else {
      var rtnCode = CONSTS.getErrData('0000');
      console.log('analysis/restapi/getDaClusterDetail -> length : %s', out_data.length);
    }
    res.json({rtnCode: rtnCode, rtnData : out_data[0]._source.detail_result });
  });
});

router.get('/restapi/getDaClusterMasterByDadate', function(req, res, next) {
  console.log(req.query);
  var in_data = {
      index : indexClusterMaster,    type : "master",
      DADATE: req.query.dadate };
  queryProvider.selectSingleQueryByID2("analysis", "selectDaClusterMasterByDadate", in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getDaClusterMaster -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source.master_result });
  });
});


router.get('/restapi/getDaClusterMaster', function(req, res, next) {  
  var gte = Utils.getDate(req.query.sdate, fmt1, -1, 0, 0, 0);
  var lte = Utils.getMs2Date(req.query.edate, fmt1);
  var in_data = {
      index : indexClusterMaster, type : "master",
      gte: gte+startTime,
      lte: req.query.endDate + 'T23:59:59',
      INTERVAL: parseInt(req.query.interval),
      FLAG : 'N'};
  if(req.query.interval === 'all')  {
    var sql = "selectDaClusterMasterAll";
  } else {
    var sql = "selectDaClusterMaster";
  }
  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    console.log('analysis/restapi/getDaClusterMaster -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});



// run analysis
router.post('/restapi/runAnalysis', function(req, res, next) {
  console.log(req.body);
  var in_data = {"start_date": req.body.startDate,
                "end_date": req.body.endDate,
                "time_interval": parseInt(req.body.interval)};
  in_data = JSON.stringify(in_data, null, 4);
  console.log(in_data);
  // FIX-ME Socket Connection Close 처리 로직 보완 필요함.
  getConnectionToDA("DataAnalysis", function(socket) {
    console.log(socket);
    writeDataToDA(socket, in_data, function() {
      var rtnCode = CONSTS.getErrData('0000');
      res.json({rtnCode: rtnCode, rtnData: ''});
    });
  });
});

function getConnectionToDA(connName, callback){
  var pUrl = global.config.analysis.host;
  var pPort = global.config.analysis.port;
  // var pUrl = 'm2u-da.eastus.cloudapp.azure.com';
  // var pUrl = 'localhost';
  console.log(pUrl);
  console.log(pPort);
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