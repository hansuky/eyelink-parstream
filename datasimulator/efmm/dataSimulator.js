if ( process.argv[2] == null || process.argv[3] == null) {
  printUsage();
  process.exit();
}

var flag = process.argv[2];
var cid = process.argv[3];
var isTest = process.argv[4];

if (isTest == 'Y') {
  isTest = true;
} else {
  isTest = false;
}

global.config = require('../../config/config.json');
global.log4js = require('log4js');
log4js.configure({
  'appenders':
  {
      'console' :
      {
        'type': 'console'
      },
      'file' :
      {
        'type': 'file',
        'filename': './datasimulator-' + cid + '.log',
        'maxLogSize': 1024000000,
        'backups': 5,
        'category': 'eyelink'
      }
  },
  'categories' :
  {
    'default' : { 'appenders': ['console', 'file'], 'level' : 'info'}
  }
});
var logger = log4js.getLogger('dataSimulator');

logger.info('Data Simulator has been started.');

logger.info(__dirname);

var fs = require('fs');
var sleep = require('system-sleep');
var calcOee = require('./calculateOee');
var Utils = require('../../routes/util');
var CONSTS = require('../../routes/consts');
var simuldata = require('./simulation.json');
var QueryProvider = require('../../routes/dao/elasticsearch/nodelib-es').QueryProvider;
var queryProvider = new QueryProvider();

const bulkSize = 100;     // bulk insert 하는 데이터 count

// simuldata = JSON.parse(simuldata);

logger.info('=========================================================');
logger.info('== Test Mode : ', isTest);
logger.info('== Simulation Base Data      : ', simuldata);
logger.info('=========================================================');

/*
  데이터 발생 조건
    - OEE 기준 : 24 시간 (9:00 ~ 익일 8:59)
    - 12:00 ~ 1:00, 6:00 ~ 7:00 meal time 발생
    - 장비별 4시간마다 1회 Real 교체에 따른 15분 short break 발생
    - 1일 최대 1회, 30분간 Random하게 down time 발생
    - 생산량은 1초당 3개 생산
    - 양품 : 초당 3개
*/
/*
  1초마다 1회 Random(1,10000) 실행 rdx값이
    - 1~9500 : 양품 3개 생산 이벤트 발생 (97%)
    - 9501~9900 : 양품 2개 생산 이벤트 발생 (2%)
    - 9901 ~ 9997 : 양품 2개, 불량품 1개 생산 이벤트 발생 (0.97%)
    - 9998 ~ 10000 : DownTime (0.03%)
*/
var cnt = 0;
var cnt_init_oee = 0;
var init_oee_time = '00:00:00'; // GMT 기준 시간임.
var meal_break_time1 = '03'; // GMT 기준 시간임.
var meal_break_time2 = '09'; // GMT 기준 시간임.
var short_break_term = 4 * 60 * 60;
var short_break_period = 15 * 60;
var down_time_period = 30 * 60;

var iRandomSize = 50000;
var iNormalAccept = 48500; // 1s 발생확률 : 97%
var iNormalAcceptLoss = 49500; // 1s 발생활율 : 2%
var iNormalReject = 49999; // 1s 발생확률 : 0.998%
var iDownTime = 49999;  // 1s 발생확률 : 0.002%(1/50000), 1d에 1.x회 발생 가능.

var short_break_cnt = 0;
var v_short_break_period = short_break_period;
var isTodayDown = false;
var isDownTime = false;
var down_time_cnt = 0;

// for test
var curdateTest = '2017-11-22 08:50:55';

while(true) {
  var isNormal = true;
  var rdx = Utils.generateRandom(1, iRandomSize);

  var curdate = Utils.getToday(CONSTS.DATEFORMAT.DATETIME, 'Y', 'Y');

  if (isTest) {
    // for test : oee init
    curdateTest = Utils.getDate(curdateTest, CONSTS.DATEFORMAT.DATETIME, 0, 0, 0, 1);
    curdate = Utils.getDateLocal2UTC(curdateTest, CONSTS.DATEFORMAT.DATETIME, 'Y');
  }

  logger.debug('rdx : %s, today : %s', rdx, curdate);

  // 09:00 이면 OEE 관련 데이터를 초기화한다.
  //  - 누적 생산량 값 초기화
  if (compareTime(curdate, init_oee_time)) {  // oee init
    logger.info('initiate OEE data');
    isNormal = false;
    isDownTime = false;
    isTodayDown = false;
    // OEE 초기화.
    calcOee.initiateOee();

  } else if (compareTime(curdate, meal_break_time1) || compareTime(curdate, meal_break_time2)) { // meal_break event
    // json data에서 날짜값과 양불량품개수 값을 변경
    setDataInEventData('meal_break', curdate);
    isNormal = false;
    isDownTime = false;
  } else if (short_break_cnt > short_break_term) { // short_break event
    // json data에서 날짜값과 양불량품개수 값을 변경
    setDataInEventData('short_break', curdate);
    isNormal = false;
    isDownTime = false;
    v_short_break_period--;
    if (v_short_break_period == 0) {
      short_break_cnt = 0;
      v_short_break_period = short_break_period;
    }
  } else if (rdx > iDownTime) {   // down_time event
    isNormal = false;
    isDownTime = true;
  }

  if (isDownTime && isTodayDown == false) {
    // json data에서 날짜값과 양불량품개수 값을 변경
    setDataInEventData('down_time', curdate);
    down_time_cnt++;
    if (down_time_cnt == down_time_period) {
      down_time_cnt = 0;
      isDownTime = false;
      isTodayDown = true;
    }
  } else if (isNormal) {
    if (rdx <= iNormalAccept) {
      // json data에서 날짜값과 양불량품개수 값을 변경
      setDataInEventData('normal_accept', curdate);
    } else if (rdx <=  iNormalAcceptLoss ) {
      // json data에서 날짜값과 양불량품개수 값을 변경
      setDataInEventData('normal_accept_loss', curdate);
    } else if (rdx <= iNormalReject) {
      // json data에서 날짜값과 양불량품개수 값을 변경
      setDataInEventData('normal_reject', curdate);
    }
  }

  short_break_cnt ++;
  cnt++;

  // for test
  // if (cnt > 10) break;

  sleep(1000);
}

function printUsage() {
  console.log('Usage : $ node dataSimulator.js [notching/stacking] [cid] {Test Y/N}');
  console.log('    []: required, {}: optional');
  console.log('');
  console.log('Ex. $ node dataSimulator.js notching 100 N');
}


function compareTime(d1, t1) {
  return d1.indexOf('T' + t1) > 0 ? true : false;
  // var d2 = new Date(d1.substring(0,11) + d2);
  // var d1 = new Date(d1);
  // var gap = d1.getTime() - d2.getTime();
  // gap = gap / 1000 / 60 / 60;
  // logger.debug('gap : ', gap);
  // return isEqual;
}

function setDataInEventData(key, curdate) {
  // TODO bulk insert 로직으로 보강이 필요함.
  var listData = [];
  var vJson = simuldata[key];
  vJson.flag = flag;
  vJson.cid = cid;
  vJson.dtTransmitted = curdate;
  vJson.data[0].dtSensed = curdate;
  logger.debug('%s : %s', key, JSON.stringify(vJson.data[0]));

  // OEE 계산.
  calcOee.calculateOee(vJson)

  // DB에 저장
  var index = makeIndexName(vJson);
  listData.push(vJson);
  insertData(index, listData);
}

// ElasticSearch dateType으로 날짜 형식을 변환
function changeDate(jData) {
  jData.dtTransmitted = convertDateFormat(jData.dtTransmitted);
  for (var i=0; i<jData.data.length; i++) {
    jData.data[i].dtSensed = convertDateFormat(jData.data[i].dtSensed);
  }
}

function convertDateFormat(val) {
  var v;
  v = val.substring(0,4) + '/' +
    val.substring(4,6) + '/' +
    val.substring(6,8);
  if (val.length >= 14) {
    v = v + 'T' +
      val.substring(8,10) + ':' +
      val.substring(10,12) + ':' +
      val.substring(12,14);
  }
  return v;
}

// ElasticSearch에 입력을 위한 IndexName을 구성.
//   ex) efmm_notching_oee_2017.11.24
function makeIndexName(jData) {
  var indexName = 'EFMM_' + jData.flag.toUpperCase() + '_' + jData.sensorType.toUpperCase();
  var dt = '-' + jData.dtTransmitted.substring(0,10).replace(/-/g, '.');
  return {
    indexName : CONSTS.SCHEMA_EFMM[indexName].INDEX + dt,
    typeName : CONSTS.SCHEMA_EFMM[indexName].TYPE
  };
}

function insertData(index, listData){

  // logger.debug('Inserting index : %s, data : %s', index, listData);
  var in_data = {
    index : index.indexName,
    type : index.typeName,
    body : listData
  };
  logger.debug('insertData - indata : %s', JSON.stringify(in_data));
  queryProvider.insertBulkQuery(in_data, function(err, out_data) {
    if (err) { console.log(err) };
    logger.debug(JSON.stringify(out_data));
    if(out_data.errors == false){
      // console.log(out_data);
      var rtnCode = CONSTS.getErrData("D001");
    }
    logger.info('finished insertData - index : %s, status : %s',
      out_data.items[0].index._index, in_data.body[0].data[0].status);

    // cb(err);
  });
}
