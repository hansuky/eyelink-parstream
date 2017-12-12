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

var indexStackingOee = global.config.es_index.stacking_oee;
var indexStackingStatus = global.config.es_index.stacking_status;
var indexStackingPatternData = global.config.da_index.stacking_oee_pattern_data;
var indexStackingPatternInfo = global.config.da_index.stacking_oee_pattern_info;
var indexStackingPatternMatch = global.config.da_index.stacking_oee_pattern_matching;

var indexNotchingOee = global.config.es_index.notching_oee;
var indexStackingStatus = global.config.es_index.notching_status;
var indexNotchingPatternData = global.config.da_index.notching_oee_pattern_data;
var indexNotchingPatternInfo = global.config.da_index.notching_oee_pattern_info;
var indexNotchingPatternMatch = global.config.da_index.notching_oee_pattern_matching;

var startTime = CONSTS.TIMEZONE.KOREA;
var fmt1 = CONSTS.DATEFORMAT.DATE; // "YYYY-MM-DD",
var fmt2 = CONSTS.DATEFORMAT.DATETIME; // "YYYY-MM-DD HH:MM:SS",
var fmt4 = CONSTS.DATEFORMAT.INDEXDATE; // "YYYY.MM.DD",

/* GET analysis page. */
router.get('/', function(req, res, next) {
  var outdata = { title: global.config.productname, mainmenu : mainmenu };
  res.render('efmm' + '/analysis/anomaly', outdata);
});

router.get('/clustering', function(req, res, next) {
  var outdata = { title: global.config.productname, mainmenu : mainmenu };
  res.render('efmm' + '/analysis/clustering', outdata);
});

router.get('/anomaly', function(req, res, next) {
  var outdata = { title: global.config.productname, mainmenu : mainmenu };
  res.render('efmm' + '/analysis/anomaly', outdata);
});

router.get('/pattern', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('efmm'+'/analysis/pattern', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/patternMatching', function(req, res, next) {
  logger.debug(_rawDataByDay);
  res.render('efmm'+'/analysis/patternMatching', { title: global.config.productname, mainmenu:mainmenu});
});

// get notching raw data
router.get('/restapi/getNotchingOeeRaw', function(req, res, next){
  logger.debug("req.query:", req.query);
  var sDate = Utils.getDateLocal2UTC(req.query.sDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.query.eDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var in_data = { INDEX : indexNotchingOee+'*', TYPE : "oee", START: sDate, END: eDate  };
  queryProvider.selectSingleQueryByID2("analysis", "selectNotchingOeeRaw", in_data, function(err, out_data, params) {
    if (out_data.length == 0) {
      var rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode, rtnData: out_data});
    } else {
      var rtnCode = CONSTS.getErrData('0000');
      res.json({rtnCode: rtnCode, rtnData: out_data });
    }
    logger.debug('analysis/restapi/getAnomaly_Pattern -> length : %s', out_data.length);
  });
});


// get stacking status
router.get('/restapi/getStackingStatus', function(req, res, next){
  logger.debug("req.query:", req.query);
  var sDate = Utils.getDateLocal2UTC(req.query.sDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.query.eDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var in_data = {
    INDEX : indexStackingStatus+'*',
    TYPE : "status",
    START: sDate,
    END: eDate,
    CID: req.query.cid,
    STYPE: req.query.sType
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectStackingStatus", in_data, function(err, out_data, params) {
    if (out_data.length == 0) {
      var rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode, rtnData: out_data});
    } else {
      var rtnCode = CONSTS.getErrData('0000');
      var data = []
      out_data.forEach(function(d){
        d._source["data"].forEach(function(element, index) {
          data.push(element);
        });
      });
      res.json({rtnCode: rtnCode, rtnData: data });
    }
    logger.debug('analysis/restapi/getStackingStatus -> length : %s', out_data.length);
  });
});

/*
For Client Visualization
*/
// Anomaly query RawData
router.get('/restapi/getOeeDataLive', function(req, res, next) {
  logger.debug('analysis/restapi/getOeeDataLive');

  let flag = req.query.step;
  let cid = req.query.machine;
  let today = Utils.getToday(fmt2, 'Y', 'Y');
  let startDate = Utils.getDate(today, fmt2, 0, 0, 0, -14, 'Y', 'Y');
  let endDate = Utils.getDate(today, fmt2, 0, 0, 0, -5, 'Y', 'Y');
  let startIndexDate = startDate.split('T')[0];
  let endIndexDate = endDate.split('T')[0];
  let index = indexNotchingOee+startIndexDate.replace(/-/g,'.');
  if ( startIndexDate != endIndexDate ) {
    index += ','+indexNotchingOee+endIndexDate.replace(/-/g,'.');
  }

  let in_data = {
    INDEX : index, TYPE : "oee",
    START: startDate, END: endDate,
    FLAG : flag, CID : cid
  };
  logger.debug('in_data : ',in_data);
  queryProvider.selectSingleQueryByID2("analysis", "selectNotchingOeeRaw", in_data, function(err, out_data, params) {
     //logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    var data = [];
    out_data.forEach(function(d){
      d._source.data.forEach(function(d2){
        let keys = { "overall_oee" : [], "availability" : [], "quality" : [], "performance" : [] };
        for ( key in keys ) {
          d2[key] = d2[key] * 100;
        }
        data.push(d2);
      });
    });
    logger.debug('analysis/restapi/getOeeDataLive -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: data});
  });
});

// Anomaly
router.get('/restapi/getOeeChartData', function(req, res, next) {
  logger.debug('analysis/restapi/getOeeChartData');
  let flag = req.query.step;
  let cid = req.query.machine;

  let indices = getIndicesOfDataAnalysisByStep(flag);

  // 날짜가 넘어가는 시점에는 indexDate를 2틀분 가져오도록 (* 사용 X )
  let now = Utils.getToday(fmt2, 'Y', 'Y');
  let rawStartDttm = Utils.getDate(now, fmt2, 0, 0, -55, 0, 'Y', 'Y');
  let rawEndDttm = Utils.getDate(now, fmt2, 0, 0, 0, 1, 'Y', 'Y');
  let indicesForRaw = getIndicesForQueryCondition(rawStartDttm, rawEndDttm, indices.raw);
  let rawData=[];

  var rawDataQueryCondition = {
    START: rawStartDttm, END: rawEndDttm,
    INDEX : indicesForRaw, TYPE : "oee",
    FLAG : flag, CID : cid
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectNotchingOeeRaw", rawDataQueryCondition, function(err, out_data) {
     logger.trace('raw data: ',out_data);
    let rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      logger.debug('out_data is NULL');
      rtnCode = CONSTS.getErrData('0001');
    } else if(out_data.length == 0) {
      logger.debug('out_data is EMPTY');
      rtnCode = CONSTS.getErrData('0001');
    } else {
      // logger.debug('raw data : ',out_data);

      out_data.forEach(function(d1){
        d1._source.data.forEach(function(d2){
          let keys = { "overall_oee" : [], "availability" : [], "quality" : [], "performance" : [] };
          for ( key in keys ) {
            d2[key] = d2[key] * 100;
          }
          rawData.push(d2);
        });
      });

      // TODO : 5분 예측 패턴 조회
      let matchingStartDttm = Utils.getDate(now, fmt2, 0, 0, -500, 0, 'Y', 'Y');  // TODO : 시간 수정
      let matchingEndDttm = Utils.getDate(now, fmt2, 0, 0, 0, 5, 'Y', 'Y');

      let matchingDataQueryCondition = {
        START: matchingStartDttm, END: matchingEndDttm,
        INDEX : indices.match, TYPE : "pattern_matching",
        SORTFIELD : cid+".timestamp",
        CID : cid
      };
      queryProvider.selectSingleQueryByID2("analysis", "selectMatchedPatternByTimestamp", matchingDataQueryCondition, function(err, out_data) {
        logger.trace('matching data: ',out_data);
        let rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          logger.debug('null');
          rtnCode = CONSTS.getErrData('0001');
        } else if(out_data.length == 0) {
          logger.debug('No matched pattern exists for now.');
          rtnCode = CONSTS.getErrData('0001');
        } else {

          // 55분 매칭 패턴 조회
          var pattern = out_data[0]._source[cid];
          let list = makeList(["overall_oee", "availability", "quality", "performance"], pattern, cid);
          let patternDataQueryCondition = {
            INDEX: indices.data, TYPE: "pattern_data",
            ID: "master", LIST : list
          };

          queryProvider.selectSingleQueryByID2("analysis", "selectPatternData", patternDataQueryCondition, function(err, out_data) {
            var rtnCode = CONSTS.getErrData('0000');
            if (out_data == null) {
              logger.debug('null');
             rtnCode = CONSTS.getErrData('0001');
            } else if(out_data.length == 0) {
              logger.debug('No pattern data found.');
               rtnCode = CONSTS.getErrData('0001');
            } else {
              let clust = out_data[0]._source[cid];
              logger.trace('clust : ',JSON.stringify(clust));
              var tot = { "overall_oee" : [], "availability" : [], "quality" : [], "performance" : [] };
              for(factor in tot) {
                tot[factor] = arrangeData(clust, pattern, rawStartDttm, factor);
              }
              logger.trace('tot : ',tot);
            }
            res.json({rtnCode: rtnCode, raw : rawData, pattern : pattern, tot : tot});
          });
        }
        res.json({rtnCode: rtnCode, raw : rawData, pattern : pattern, tot : tot});
      });
    }
    logger.debug('analysis/restapi/getOeeChartData -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, raw : rawData, pattern : pattern, tot : tot});
  });
});

// Pattern Management pattern list
router.get('/restapi/getAnomalyPatternList', function(req, res, next) {
  logger.debug("req.query: ", req.query);
  var sDate = Utils.getDate(req.query.startDate, fmt1, -1, 0, 0, 0);
  var eDate = Utils.getMs2Date(req.query.endDate, fmt1);
  let flag = req.query.flag;
  let cid = req.query.cid;
  let index = getIndicesOfDataAnalysisByStep(flag).data;
  var in_data = {
      INDEX : index, TYPE : "pattern_data",
      START_TIMESTAMP: sDate+startTime,
      END_TIMESTAMP: eDate+startTime,
      MASTER_ID: req.query.masterId,
      RANGEFIELD: cid+'.createDate'
    };
  queryProvider.selectSingleQueryByID2("analysis", "selectPatternList", in_data, function(err, out_data, params) {
    // logger.debug(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    logger.debug('analysis/restapi/getAnomalyPatternList -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

// Pattern Management load patterns data : update 2017-11-07
router.get('/restapi/getPatterns', function(req, res, next) {
  logger.debug('req.query: ',req.query);
  let flag = req.query.flag;
  let cid = req.query.cid;
  let index = getIndicesOfDataAnalysisByStep(flag).info;
  var in_data = {
    INDEX: index,    TYPE: "pattern_info",
    ID: req.query.id,    CID: cid,
    CID_QUALITY: cid+'.quality',
    CID_PERFORMACE: cid+'.performance',
    CID_OVERALL_OEE: cid+'.overall_oee',
    CID_AVAILABILITY: cid+'.availability'
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
    logger.debug('[OUT] getPatterns: ', JSON.stringify(out_data));
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      logger.debug('No data exists.');
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      logger.debug('');
      var patternData = out_data[0]._source[cid];
      if (req.query.id == "master"){
        res.json({rtnCode: rtnCode, patternData: patternData});
      } else {
        var in_data = {
          INDEX: index, TYPE: "pattern_info",
          ID: "master", CID: cid,
          CID_QUALITY: cid+'.quality',
          CID_PERFORMACE: cid+'.performance',
          CID_OVERALL_OEE: cid+'.overall_oee',
          CID_AVAILABILITY: cid+'.availability'
        };
        queryProvider.selectSingleQueryByID2("analysis", "selectPatterns", in_data, function(err, out_data, params) {
          var rtnCode = CONSTS.getErrData('0000');
          if (out_data.length == 0) {
            rtnCode = CONSTS.getErrData('0001');
            res.json({rtnCode: rtnCode});
          } else {
            var masterData = out_data[0]._source[cid];

            for (var group in patternData) {
              for (var cno in patternData[group]) {
                mCno = patternData[group][cno]['masterCN'];
                if (mCno != 'unknown'){
                  patternData[group][cno]['status'] = masterData[group][mCno]['status'];
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

// Pattern Matching
router.post('/restapi/getMatchingPattern', function(req, res, next) {
  logger.debug("[getMatchingPattern] req.body: ", req.body);
  var sDate = Utils.getDateLocal2UTC(req.body.startDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  var eDate = Utils.getDateLocal2UTC(req.body.endDate, CONSTS.DATEFORMAT.DATETIME, 'Y');
  let flag = req.body.step;
  let cid = req.body.machine;
  let index = getIndicesOfDataAnalysisByStep(flag).match;
  var in_data = {
    INDEX: index,
    TYPE: "pattern_matching",
    START_TIMESTAMP: sDate,
    END_TIMESTAMP: eDate,
    CID: cid,
    CID_TIMESTAMP: cid+'.timestamp'
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectMatchingPattern", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data === null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        var utcDt = d._source[cid].timestamp;
        var localDt = Utils.getDateUTC2Local(utcDt, CONSTS.DATEFORMAT.DATETIME, 'Y');
        d._source[cid].timestamp = localDt;
      });
    }
    logger.debug('analysis/restapi/getAnomaly_Pattern -> length : %s', out_data.length);
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getAnomalyPatternCheck/', function(req, res, next) {
  let cid = req.query.machine;
  let step = req.query.step;
  let indices = getIndicesOfDataAnalysisByStep(step);

  var now = Utils.getToday(fmt2, 'Y', 'Y');
  var from = Utils.getDate(now, fmt2, 0, 0, -2, 0, 'Y', 'Y');
  var in_data = {
        INDEX: indices.match, TYPE: "pattern_matching",
        START : from,     END : now,
        SORTFIELD : cid+".timestamp",
        CID : cid
      }
  console.log('in_data: ',in_data);
  queryProvider.selectSingleQueryByID2("analysis", "selectMatchedPatternByTimestamp", in_data, function(err, out_data) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData : out_data});
  });
});

// get pattern about selected cluster
router.get('/restapi/getClusterPattern', function(req, res, next) {
  logger.debug(req.query);
  let flag = req.query.step;
  let cid = req.query.machine;
  let index = getIndicesOfDataAnalysisByStep(flag).data;
  var in_data = {
    INDEX: index, TYPE: "pattern_data",
    ID: req.query.id, TARGET: req.query.targetCluster
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data.length == 0) {
      rtnCode = CONSTS.getErrData('0001');
      res.json({rtnCode: rtnCode});
    } else {
      var patternData = out_data[0]._source[cid];
      if (req.query.id == "master"){
        var masterData = null;
        res.json({rtnCode: rtnCode, patternData: patternData, masterData: masterData});
      } else {
        var in_data = {
          INDEX: indexPatternData, TYPE: "pattern_data",
          ID: "master", TARGET: req.query.targetMaster
        };
        queryProvider.selectSingleQueryByID2("analysis", "selectClusterPattern", in_data, function(err, out_data, params) {
          var rtnCode = CONSTS.getErrData('0000');
          if (out_data.length == 0) {
            rtnCode = CONSTS.getErrData('0001');
            res.json({rtnCode: rtnCode});
          } else {
            var masterData = out_data[0]._source[cid];
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

  let flag = req.body.step;
  let cid = req.body.machine;
  let index = getIndicesOfDataAnalysisByStep(flag).data;
  var in_data = {
    INDEX: index, TYPE: "pattern_data",
    ID: req.params.id,
    CID: cid
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] == null){
      var rtnCode = CONSTS.getErrData('E001');
      logger.debug(rtnCode);
      res.json({rtnCode: rtnCode});
    } else {
      var in_data = {
        INDEX: index, TYPE: "pattern_data",
        ID: req.params.id, BODY: JSON.stringify(req.body.data),
        CID: cid
      };
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

  let flag = req.body.step;
  let cid = req.body.machine;
  let index = getIndicesOfDataAnalysisByStep(flag).info;
  var in_data = {
    INDEX: index, TYPE: "pattern_info",
    ID: req.params.id,
    CID: cid
  };
  queryProvider.selectSingleQueryByID2("analysis", "selectById", in_data, function(err, out_data, params) {
    if (out_data[0] == null){
      var rtnCode = CONSTS.getErrData('E001');
    } else {
      console.log('1111111    index: ', index);
      var in_data = {
        INDEX: index, TYPE: "pattern_info",
        ID: req.params.id, BODY: JSON.stringify(req.body.data),
        CID: cid
      };
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


function getIndicesOfDataAnalysisByStep(step){
  let result={};
  if ( step == 'notching'){
    result.raw = indexNotchingOee;
    result.data = indexNotchingPatternData;
    result.info = indexNotchingPatternInfo;
    result.match = indexNotchingPatternMatch;
  } else if ( step == 'stacking') {
    result.raw = indexStackingOee;
    result.data = indexStackingPatternData;
    result.info = indexStackingPatternInfo;
    result.match = indexStackingPatternMatch;
  }
  return result;
}
function getIndicesForQueryCondition(startDttm, endDttm, indexHead){
  let startIndexDate = startDttm.split('T')[0];
  let endIndexDate = endDttm.split('T')[0];
  let indices = indexHead+startIndexDate.replace(/-/g,'.');
  if ( startIndexDate != endIndexDate ) {
    indices += ','+indexHead+endIndexDate.replace(/-/g,'.');
  }
  return indices;
}
function arrangeData(clust, pattern, start, factor){
  var data = [], cpt = [], apt = [], min = [], max = [];
  for(i=59; i<120; i++){
    var date = new Date(start).getTime()+(i-59)*60*1000;
    min[i-59] = clust[factor][pattern[factor].top_1].min_value[i];
    max[i-59] = clust[factor][pattern[factor].top_1].max_value[i]
    data.push({date : date
              , center : clust[factor][pattern[factor].top_1].center[i] * 100
              , center2 : clust[factor][pattern[factor].top_2].center[i] * 100
              , center3 : clust[factor][pattern[factor].top_3].center[i] * 100
              , min : clust[factor][pattern[factor].top_1].min_value[i] * 100
              , max : clust[factor][pattern[factor].top_1].max_value[i] * 100
              , lower : clust[factor][pattern[factor].top_1].lower[i] * 100
              , upper : clust[factor][pattern[factor].top_1].upper[i] * 100 });
    if(i<110) {
      if(pattern[factor].caution_pt[i] != -1){
        cpt.push({ date : date, value : pattern[factor].caution_pt[i] * 100 });
      }
      if(pattern[factor].anomaly_pt[i] != -1){
        apt.push({ date : date, value : pattern[factor].anomaly_pt[i] * 100 });
      }
    }
  }

  var minValue = Math.min.apply(null, min);
  var maxValue = Math.max.apply(null, max);
  var total = { data : data, cpt : cpt, apt : apt, min : minValue, max : maxValue };
  return total;
}

function makeList(factors, pattern, cid){
  var list = [], cnt = 0;
  for(i=0; i<factors.length; i++){
    list[cnt++] = cid+"."+factors[i]+"."+pattern[factors[i]].top_1;
    list[cnt++] = cid+"."+factors[i]+"."+pattern[factors[i]].top_2;
    list[cnt++] = cid+"."+factors[i]+"."+pattern[factors[i]].top_3;
  }
  return list;
}

module.exports = router;