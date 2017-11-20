var logger = global.log4js.getLogger('nodeAnalysis');
var CONSTS = require('../consts');
var Utils = require('../util');
var express = require('express');
var fs = require('fs');
var net = require('net');
var router = express.Router();
var QueryProvider = require('../dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;

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
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/clustering', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/clustering', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/clustering', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/cluster_detail', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/cluster_detail', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/clusteringPop', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/clustering_popup', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/runalaysis', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/runanalysis', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/anomaly', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/anomaly', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/anomaly_new', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/anomaly_new', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/pattern', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/pattern', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/patternMatching', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/patternMatching', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/postTest', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/postTest', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/pattern_list', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('./'+global.config.pcode+'/analysis/pattern_list', { title: global.config.productname, mainmenu:mainmenu});
});


router.post('/restapi/insertAnomaly/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/insertAnomaly');
  logger.debug(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: id };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: id,   BODY : JSON.stringify(req.body)   };
      queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
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

router.post('/restapi/insertPatternInfo/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/insertPatternInfo');
  logger.debug(JSON.stringify(req.body));
  var id = req.params.id;
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: id   };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
    }  else  {
      var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: id,   BODY : JSON.stringify(req.body)   };
      queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          logger.debug(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { logger.debug(err); }
        res.json({rtnCode: rtnCode});
      });
    }
  });
});

router.post('/restapi/insertAnomalyPattern/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/insertAnomalyPattern');
  logger.debug(JSON.stringify(req.body));
  var in_data = { INDEX: indexPatternMatching, TYPE: "pattern_matching", ID: req.params.id   };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
    }  else  {
      var in_data = { INDEX: indexPatternMatching, TYPE: "pattern_matching", ID: req.params.id,   BODY : JSON.stringify(req.body)   };
      queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
        if(out_data.result == "created"){
          logger.debug(out_data);
          var rtnCode = CONSTS.getErrData("D001");
        }
        if (err) { logger.debug(err); }
        res.json({rtnCode: rtnCode});
      });
    }
     res.json({rtnCode: rtnCode});
  });
});



router.delete('/restapi/deleteAnomaly/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/deleteAnomaly');
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
  logger.debug(req.query);
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.params.id};
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    }
    logger.debug('analysis/restapi/getDaClusterDetail -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source.da_result});
  });
});

// load master cluster : update 2017-11-15
router.get('/restapi/getPatternInfo', function(req, res, next) {
  logger.debug(req.query);
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: req.query.id};
  queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      logger.debug('analysis/restapi/getPatternInfo -> length : %s', out_data.length);
      res.json({rtnCode: rtnCode, rtnData: out_data[0]._source.da_result});
    }
  });
});


// load patterns data : update 2017-11-07
router.get('/restapi/getPatterns', function(req, res, next) {
  logger.debug(req.query);
  var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: req.query.id};
  queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      var patternData = out_data[0]._source.da_result;
      if (req.query.id == "master"){
        res.json({rtnCode: rtnCode, patternData: patternData});
      } else {
        var in_data = { INDEX: indexPatternInfo, TYPE: "pattern_info", ID: "master"};
        queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
          var rtnCode = CONSTS.getErrData('0000');
          if (out_data.length == 0) {
            rtnCode = CONSTS.getErrData('0001');
            res.json({rtnCode: rtnCode});
          } else {
            var masterData = out_data[0]._source.da_result;

            for (var group in patternData) {
              for (var cno in patternData[group]) {
                if (patternData[group][cno]['masterCN'] != 'unknown'){
                  patternData[group][cno]['status'] = masterData[group][cno]['status'];
                } else {
                  patternData[group][cno]['status'] = 'undefined';
                }
              }
            }
            logger.debug('analysis/restapi/getPatterns -> length : %s', out_data.length);
            res.json({rtnCode: rtnCode, patternData: patternData});      
          }
        });
      }
    }
  });
});

// get select cluster data
router.get('/restapi/getClusterData', function(req, res, next) {
  logger.debug(req.query);
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.query.id, TARGET: req.query.target };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      out_data[0]._source.da_result;
      logger.debug('analysis/restapi/getClusterPattern -> length : %s', out_data.length);
      res.json({rtnCode: rtnCode, rtnData: out_data[0]._source.da_result});
    }
  });
});


// get pattern about selected cluster
router.get('/restapi/getClusterPattern', function(req, res, next) {
  logger.debug(req.query);
  var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: req.query.id, TARGET: req.query.targetCluster };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      var patternData = out_data[0]._source.da_result;
      if (req.query.id == "master"){
        var masterData = null;
        res.json({rtnCode: rtnCode, patternData: patternData, masterData: masterData});
      } else {
        var in_data = { INDEX: indexPatternData, TYPE: "pattern_data", ID: "master", TARGET: req.query.targetMaster };
        queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
          var rtnCode = CONSTS.getErrData('0000');
          if (out_data.length == 0) {
            rtnCode = CONSTS.getErrData('0001');
            res.json({rtnCode: rtnCode});
          } else {
            var masterData = out_data[0]._source.da_result;
            logger.debug('analysis/restapi/getClusterPattern -> length : %s', out_data.length);
            res.json({rtnCode: rtnCode, patternData: patternData, masterData: masterData});
          }
        });
      }
    }
  });
});



// pattern data 업데이트
router.post('/restapi/pattern_data/:id/_update', function(req, res, next) {
  logger.debug('/analysis/restapi/pattern_data/:id/_update');
  logger.debug(JSON.stringify(req.body));
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
          var rtnCode = CONSTS.getErrData("D001");
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
  logger.debug('/analysis/restapi/pattern_info/:id/_update');
  logger.debug(JSON.stringify(req.body));
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
        if (err) { logger.debug(err);}
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
      logger.debug('f');
      logger.debug(out_data);
      var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
      var day = new Date().toString().split(' ');
      var id = day[3]+'-'+mon[day[1]]+'-'+day[2];
      var in_data = {  INDEX: indexPatternData, TYPE: "pattern_data" , ID: id };
      var pattern = out_data[0]._source ;
      queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data,  function(err, out_data, params) {
        var clust = out_data[0]._source.da_result;
        logger.debug(pattern);
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data[0] === null) {   rtnCode = CONSTS.getErrData('0001');
         res.json({rtnCode: rtnCode});   }
        logger.debug('analysis/restapi/getAnomaly -> length : %s', out_data.length);
        res.json({rtnCode: rtnCode, pattern : pattern, clust : clust});
      });
    }
        logger.debug('analysis/restapi/getAnomalyPattern -> length : %s', out_data.length);
        res.json({rtnCode: rtnCode, pattern : pattern, clust : clust});
  });
});

// pattern dataset
router.get('/restapi/getAnomalyPatternList', function(req, res, next) {
  logger.debug("req.query:", req.query);
  var sDate = Utils.getDateLocal2UTC(req.query.startDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.query.endDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var in_data = {
      INDEX : indexPatternData, TYPE : "pattern_data",
      START_TIMESTAMP: sDate,
      END_TIMESTAMP: eDate,
      MASTER_ID: req.query.masterId};
  var sql = "selectPatternList";
  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getAnomalyPatternList -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

// pattern dataset
router.get('/restapi/getAnomaly_Pattern', function(req, res, next) {
  logger.debug("req.query:", req.query);
  var sDate = Utils.getDateLocal2UTC(req.query.startDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.query.endDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var in_data = {
      INDEX : indexPatternMatching, TYPE : "pattern_matching",
      START_TIMESTAMP: sDate,
      END_TIMESTAMP: eDate};
  var sql = "selectAnomaly_Pattern";
  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getAnomaly_Pattern -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});


// query RawData
router.get('/restapi/getAnomalyChartData', function(req, res, next) {    
  var now = Utils.getToday(fmt2, 'Y');  
  var end = Utils.getDate(now, fmt2, 0, 0, 0, 10, 'Y', 'Y');
  var in_data = {  
        INDEX: indexPatternMatching, TYPE: "pattern_matching", 
        gte : Utils.getDate(now, fmt2, 0, 0, -10, 0, 'Y', 'Y'), 
        lte : end };
  queryProvider.selectSingleQueryByID2("analysis", "selectByAnalysisTimestamp", in_data, function(err, out_data, params) {                
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      logger.debug('null');
      rtnCode = CONSTS.getErrData('0001');
    } else if(out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
    } else {            
      var pattern = out_data[0]._source.da_result;
      var list = makeList(["voltage", "ampere", "power_factor", "active_power"], pattern);
      var in_data = { INDEX: indexPatternData, TYPE: "pattern_data" , ID: "master", list : list }      
      queryProvider.selectSingleQueryByID2("analysis", "selectAnomalyMatch", in_data,  function(err, out_data, params) {                
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          logger.debug('null');
         rtnCode = CONSTS.getErrData('0001');
        } else if(out_data.length == 0) {
           rtnCode = CONSTS.getErrData('0001');
        } else {        
          var clust = out_data[0]._source.da_result;          
          var start = Utils.getDate(pattern.timestamp, fmt2, 0, 0, -50, -10, 'Y', 'Y');                    
          var in_data = { index : indexCore+'*', type : "corecode",
                gte: start, lte: end,  NODE: ["0002.00000039"], FLAG : 'N'};           
          queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
            var rtnCode = CONSTS.getErrData('0000');
            if (out_data == null) {
              rtnCode = CONSTS.getErrData('0001');
            } else if(out_data.length == 0) {
              rtnCode = CONSTS.getErrData('0001');
            } else {
              logger.debug('analysis/restapi/getClusterNodePower -> length : %s', out_data.length);
              var tot = { "voltage" : [], "ampere" : [], "active_power" : [], "power_factor" : [] };              
              for(key in tot) {                
                tot[key] = arangeData(clust, pattern, start, key);                 
              }              
              logger.debug(tot);
              pattern.timestamp = Utils.getDateUTC2Local(pattern.timestamp, fmt2);
              var data = [];
              var sdata = out_data[0]._source;              
              sdata.event_time = new Date(start).getTime();              
              data.push(sdata);              
              out_data.forEach(function(d){                
                d._source.event_time = new Date(d._source.event_time).getTime();
                data.push(d._source);                
              });      
              var last = data[data.length-1];              
              last.event_time = new Date().getTime();
              data.push(last);
              res.json({rtnCode: rtnCode, raw : data, pattern : pattern, tot : tot });
            }
          });
        }
        logger.debug('analysis/restapi/getAnomaly -> length : %s', out_data.length);
        res.json({rtnCode: rtnCode, anomaly : anomaly, raw : data, point : point});
      });
    }
    logger.debug('analysis/restapi/getAnomalyPattern -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, anomaly : anomaly, raw : data, point : point});
  });
});

function arangeData(clust, pattern, start, type){    
  var data = [], cpt = [], apt = [], min = [], max = [];
  for(i=59; i<120; i++){                  
    var date = new Date(start).getTime()+(i-59)*60*1000;        
    min[i-59] = clust[type][pattern[type].top_1].min_value[i];
    max[i-59] = clust[type][pattern[type].top_1].max_value[i]
    data.push({date : date, center : clust[type][pattern[type].top_1].center[i], center2 : clust[type][pattern[type].top_2].center[i], center3 : clust[type][pattern[type].top_3].center[i], min : clust[type][pattern[type].top_1].min_value[i], max : clust[type][pattern[type].top_1].max_value[i], lower : clust[type][pattern[type].top_1].lower[i], upper : clust[type][pattern[type].top_1].upper[i] });
    if(i<110) {      
      if(pattern[type].caution_pt[i] != -1){
        cpt.push({ date : date, value : pattern[type].caution_pt[i] });
      }    
      if(pattern[type].anomaly_pt[i] != -1){
        apt.push({ date : date, value : pattern[type].anomaly_pt[i] });
      }       
    }                                    
  }
  var minValue = Math.min.apply(null, min);
  var maxValue = Math.max.apply(null, max);
  var total = { data : data, cpt : cpt, apt : apt, min : minValue, max : maxValue };  
  return total;
}

function makeList(key, pattern){
  var list = [], cnt = 0;
  for(i=0; i<key.length; i++){    
    list[cnt++] = "da_result."+key[i]+"."+pattern[key[i]].top_1;
    list[cnt++] = "da_result."+key[i]+"."+pattern[key[i]].top_2;
    list[cnt++] = "da_result."+key[i]+"."+pattern[key[i]].top_3;
  }
  return list;
}

router.get('/restapi/getAnomalyPatternCheck/', function(req, res, next) {  
  var now = Utils.getToday(fmt2, 'Y', 'Y');  
  var start = Utils.getDate(now, fmt2, 0, 0, -2, 0, 'Y', 'Y');    
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
  logger.debug('analysis/restapi/getClusterNodeLive');
  var today = Utils.getToday(fmt2, 'Y', 'Y');    
  var in_data = {
        index : indexCore+'*',      type : "corecode",
        gte: Utils.getDate(today, fmt2, 0, 0, -1, 0, 'Y', 'Y'),
        lte: Utils.getDate(today, fmt2, 0, 0, 0, 1, 'Y', 'Y'),
        NODE: ["0002.00000039"], FLAG : 'N'};  
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
     //logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
   var data = [];    
    out_data.forEach(function(d){                 
      data.push(d._source);
    });    
    logger.debug('analysis/restapi/getClusterNodeLive -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterNodePower', function(req, res, next) {
  logger.debug('analysis/restapi/getClusterNodePower');
  var today = Utils.getToday(fmt2);    
  var in_data = {
        index : indexCore+'*',   type : "corecode",
        gte: req.query.startDate, lte: req.query.endDate,
        NODE: req.query.nodeId.split(','), FLAG : 'N'};
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterNodePower", in_data, function(err, out_data, params) {
     //logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
   var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });    
    logger.debug('analysis/restapi/getClusterNodeLive -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterRawData', function(req, res, next) {     
  var start = new Date(req.query.startDate).getTime();
  var end = new Date(req.query.endDate).getTime();
  var index = [], cnt = 0;  
  for(i = start; i<=end; i=i+24*60*60*1000){    
    index[cnt++]  = indexCore+Utils.getMs2Date(i, fmt4);
  }  
  var in_data = {  index : index, type : "corecode",
                   gte: req.query.startDate, lte: req.query.endDate,    };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterRawData", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterDetailRawData', function(req, res, next) {     
  var start = new Date(req.query.startDate).getTime();
  var end = new Date(req.query.endDate).getTime();
  var index = [], cnt = 0;  
  for(i = start; i<=end; i=i+24*60*60*1000){    
    index[cnt++]  = indexCore+Utils.getMs2Date(i, fmt4);
  }  
  var in_data = {  index : index, type : "corecode",
                   gte: req.query.startDate, lte: req.query.endDate,    };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterRawData", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      d = d._source;
      d.event_time = new Date(d.event_time).getTime();
      d.active_power = d.active_power === undefined? 0:d.active_power;
      d.als_level = d.als_level === ''? 0:d.als_level;
      d.dimming_level = d.dimming_level === ''? 0:d.dimming_level;
      d.noise_frequency = d.noise_frequency === ''? 0:d.noise_frequency;
      d.vibration_x = d.vibration_x === ''? 0 : d.vibration_x;
      d.vibration_y = d.vibration_y === ''? 0 : d.vibration_y;
      d.vibration_z = d.vibration_z === ''? 0 : d.vibration_z;      
      data.push(d);
    });
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getClusterRawDataByNode', function(req, res, next) {
  logger.debug(req.query);
  var in_data = {
      index : "corecode-*", type : "corecode",
      gte: req.query.startDate,
      lte: req.query.endDate,
      node : req.query.node
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterRawDataByNode", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// query RawData
router.get('/restapi/getDataBySource', function(req, res, next) {
  logger.debug(req.query)
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var start = new Date(req.query.startDate).getTime();
  var end = new Date(req.query.endDate).getTime();
  var index = [], cnt = 0;
  for(i = start; i<=end; i=i+24*60*60*1000){
    var d = new Date(i).toString().split(' ');
    index[cnt++]  = "corecode-"+d[3]+'-'+mon[d[1]]+'-'+d[2];
  }
  logger.debug(index);
  var in_data = {
      index : "corecode-*", type : "corecode",
      gte: req.query.startDate,
      lte: req.query.endDate,
      Source : req.query.source.split(',')
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectDataBySource", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } 
    logger.debug('analysis/restapi/getClusterRawData -> length : %s', out_data.length);
    var data = [];
    out_data.forEach(function(d){
      data.push(d._source);
    });        
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

router.post('/restapi/insertClusterMaster/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/insertClusterMaster');
  logger.debug(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = {    INDEX: indexClusteringMaster, TYPE: "master", ID: id   };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {    INDEX: indexClusteringMaster, TYPE: "master", ID: id,   BODY : JSON.stringify(req.body)   };
     queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
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

router.post('/restapi/insertClusterDetail/:id', function(req, res, next) {
  logger.debug('/analysis/restapi/insertClusterDetail');
  logger.debug(JSON.stringify(req.body));
   var id = req.params.id;
   var in_data = {    INDEX: indexClusteringDetail, TYPE: "detail", ID: id   };
   queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] != null){
      var rtnCode = CONSTS.getErrData('E005');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    }  else  {
      var in_data = {    INDEX: indexClusteringDetail, TYPE: "detail", ID: id,   BODY : JSON.stringify(req.body)   };
     queryProvider.insertQueryByID("analysis", "insertById", in_data, function(err, out_data) {
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

// query RawData
router.get('/restapi/getDaClusterDetail', function(req, res, next) {
  var in_data = {
      INDEX : indexClusteringDetail,    TYPE : "detail",
      ID : req.query.daDate };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    logger.debug(err);
    logger.debug(out_data);
    if (out_data === null) {
      var rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode, rtnData: out_data});
    } else {
      var rtnCode = CONSTS.getErrData('0000');
      logger.debug('analysis/restapi/getDaClusterDetail -> length : %s', out_data.length);
    }
    res.json({rtnCode: rtnCode, rtnData : out_data[0]._source.detail_result });
  });
});

router.get('/restapi/getDaClusterMasterByDadate', function(req, res, next) {
  logger.debug(req.query);
  var in_data = {
      index : indexClusteringMaster,    type : "master",
      DADATE: req.query.dadate };
  queryProvider.selectSingleQueryByID2("analysis", "selectDaClusterMasterByDadate", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getDaClusterMaster -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data[0]._source.master_result });
  });
});


router.get('/restapi/getDaClusterMaster', function(req, res, next) {  
  var gte = Utils.getDate(req.query.sdate, fmt1, -1, 0, 0, 0);
  var lte = Utils.getMs2Date(req.query.edate, fmt1);
  console.log()
  var in_data = {
      index : indexClusteringMaster, type : "master",
      gte: gte+startTime,
      lte: lte+startTime,
      INTERVAL: parseInt(req.query.interval),
      FLAG : 'N'};
  if(req.query.interval === 'all')  {
    var sql = "selectDaClusterMasterAll";
  } else {
    var sql = "selectDaClusterMaster";
  }
  queryProvider.selectSingleQueryByID2("analysis", sql, in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getDaClusterMaster -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});



// run analysis
router.post('/restapi/runAnalysis', function(req, res, next) {
  logger.debug(req.body);
  var in_data = {"start_date": req.body.startDate,
                "end_date": req.body.endDate,
                "time_interval": parseInt(req.body.interval)};
  in_data = JSON.stringify(in_data, null, 4);
  logger.debug(in_data);
  // FIX-ME Socket Connection Close 처리 로직 보완 필요함.
  getConnectionToDA("DataAnalysis", function(socket) {
    logger.debug(socket);
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
  logger.debug(pUrl);
  logger.debug(pPort);
  var client = net.connect({port: pPort, host:pUrl}, function() {
    logger.debug(connName + ' Connected: ');
    logger.debug('   local = %s:%s', this.localAddress, this.localPort);
    logger.debug('   remote = %s:%s', this.remoteAddress, this.remotePort);
    this.setTimeout(500);
    this.setEncoding('utf8');
    this.on('data', function(data) {
      logger.debug(connName + " From Server: " + data.toString());
      this.end();
    });
    this.on('end', function() {
      logger.debug(connName + ' Client disconnected');
    });
    this.on('error', function(err) {
      logger.debug('Socket Error: ', JSON.stringify(err));
    });
    this.on('timeout', function() {
      logger.debug('Socket Timed Out');
    });
    this.on('close', function() {
      logger.debug('Socket Closed');
    });
    callback(client);
  });
  // return client;
}

function writeDataToDA(socket, data, callback){
  var success = !socket.write(data);
  logger.debug('success : ' + success);
  if (!success){
    (function(socket, data){
      socket.once('drain', function(){
        logger.debug('drain');
        writeData(socket, data, callback);
      });
    })(socket, data);
  }

  if (success) {
    callback();
  }
}



module.exports = router;