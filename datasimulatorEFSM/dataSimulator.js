if ( process.argv[2] == null || process.argv[3] == null ) {
  printUsage();
  process.exit();
}

const log4js = require('log4js');
log4js.configure({
  // appenders: [
  //             { type: 'file', filename: './datagen.log', backups: 5 }
  //             ],
  // categories: { default: { appenders: ['datagen'], level: 'debug' } }
  
    "appenders": [
      {
        "type": "console"
      },
      {
        "type": "file",
        "filename": "./datagen.log",
        "maxLogSize": 1024000,
        "backups": 5,
        "category": "eyelink"
      }
    ]
  
});
global.logger = log4js.getLogger('datagen');

logger.info('Data Simulator has been started.');

var fs = require('fs');
var sleep = require('system-sleep');
var moment = require('moment-timezone');
var datetime = require('node-datetime');
var xml2js = require('xml2js');
var Utils = require('../routes/util');
var CONSTS = require('../routes/consts');
var QueryProvider = require('./nodelib-es').QueryProvider;
var queryProvider = new QueryProvider();

const datafilepath = process.argv[2];
const nodeId = process.argv[3];
const type = 'corecode';
const initialDataInDays = ( process.argv[4] == null ? 0 : process.argv[4] ); 

// startDatetimeToSkip : 실제로 데이터가 insert되어야 하는 일시 입력받는다. (Next Event DateTime 기준)
const startDatetimeToSkip = ( process.argv[5] == null ? null : moment(process.argv[5]) );

// TODO : 현재까지 입력된 데이터 이후의 데이터부터 입력하려면 initialDataInDays로 일자 기준을 잡고, startDatetimeToSkip로 시간을 잡아줘야 한다.
// 이것을 startDatetimeToSkip 하나로만 처리할 수 있도록 하면 좋을 듯 
logger.info('=========================================================');
logger.info('== Data File Path        : ', datafilepath);
logger.info('== Node ID               : ', nodeId);
logger.info('== Initial Data In Days  : ', initialDataInDays);
logger.info('== Start Datetime        : ', startDatetimeToSkip);
logger.info('=========================================================');

var lineReader = require('readline').createInterface({
  input: fs.createReadStream(datafilepath)
});

var notMatchedCount = 0;
var matchedCount = 0;
var curDate;

loadQuery('./dbquery.xml');

// 한 달 분량의 데이터를 선입력하기 위한 변수 선언.
var initialDataProcessed = false;
var processedDays = 0;

// sample csv line data 
// 0002.00000038,49,2016-11-17 11:49:01.533,2016-11-17 11:49:01,,,,,,,,,,,,,,11,100,1.1,10000,,,,,,,,,,,,,,,0,

// var cur_datetime = moment(datetime.create().format('Y-m-d H:M:S'));
var cur_datetime = moment(datetime.create().format('Y-m-d'));
var prev_month_datetime = cur_datetime.subtract(initialDataInDays, 'days');
var needNewMapping = true;

// 실제 라인 단위로 데이터 읽어와서 처리하는 로직 시작.
lineReader.on('line', function (line) {

  // if ( line.startsWith(nodeId) ) {  // 17.08.29 전체 노드에 대해서 데이터 입력을 위해서 else문과 함께 주석처리
      matchedCount += 1;

      // 17.08.29 아래 로그는 더 아래쪽으로 내렸음.
      // if ( processedDays >= initialDataInDays ){
      //   logger.info('---------------------------------------------------------------------------');
      //   logger.info('Processing data : ', line);
      // }
      
      cur_datetime = moment(datetime.create().format('Y-m-d H:M:S'));

      var data_arr = line.split(',');

      var eventDatetime12early = moment(data_arr[3]).subtract(12, 'hours');

      data_arr[3] = eventDatetime12early.format('YYYY-MM-DD HH:mm:ss');

      var event_date = data_arr[3].split(' ')[0];

      if ( curDate == null ) {
          curDate = event_date;
      }
      if ( curDate !== event_date ){
          logger.debug('Changing date. curDate: ',curDate,', event_date: ',event_date);
          processedDays += 1;
          prev_month_datetime.add(1, 'days');
          curDate = event_date;

          if ( processedDays >= initialDataInDays ){
              initialDataProcessed = true;
          }
          logger.debug('=========== ' + processedDays + ' days passed ============');

          needNewMapping = true;
      }
      // var cur_kor_datetime = prev_month_datetime.format('YYYY-MM-DD') + ' ' + cur_datetime.format('HH:mm:ss');
      var cur_kor_datetime = prev_month_datetime.format('YYYY-MM-DD') + ' ' + cur_datetime.format('HH:mm:ss');

      // 이벤트 타임을 현재 일자에 맞게 변경하기 (입력시 필요한 값으로 변경)
      data_arr[3] = cur_kor_datetime.split(' ')[0] + 'T' + data_arr[3].split(' ')[1];

      var curDateTime = moment(cur_kor_datetime, 'YYYY-MM-DD HH:mm:ss');
      var nextEventDateTime = moment(data_arr[3], 'YYYY-MM-DD HH:mm:ss');
      data_arr[3] = data_arr[3].split('T')[0] + 'T' + nextEventDateTime.format('HH:mm:ss');

      var diffSeconds = nextEventDateTime.diff(cur_datetime)/1000;
      // logger.debug('nextEventDateTime: ',nextEventDateTime,', curDateTime: ',cur_datetime,', diffMillis: ',diffSeconds);
      
      // logger.debug('ProcessingDateTime : ',event_date + ' ' + cur_kor_datetime.split(' ')[1],', Next Event DateTime : ',data_arr[3].split('T').join(' '),', diffSeconds : ',diffSeconds);
      if ( (processedDays >= initialDataInDays) && (nextEventDateTime.diff(startDatetimeToSkip, 'seconds') > 0) ){
          // 17.08.29 info로 로그를 남기는 아래 두 라인은 사실 최상단에 있는 것이 맞으나, 
          // 과거 데이터를  skip할 때 너무 많은 로그를 남기면서 hang 걸리는 문제가 발생하여 아래쪽으로 내렸음
          logger.info('---------------------------------------------------------------------------');
          logger.info('Processing data : ', line);
          
          logger.debug('Processing DateTime : ',event_date + ' ' + data_arr[3].split('T')[1],', Next Event DateTime : ',data_arr[3].split('T').join(' '),', diffSeconds : ',diffSeconds );
      }
      // 17.11.02 로컬 시간을 UTC 시간으로 변경하기 위한 로직 추가
      data_arr[3] = Utils.getDateLocal2UTC(data_arr[3], CONSTS.DATEFORMAT.DATETIME, 'Y');

      if ( startDatetimeToSkip == null || nextEventDateTime.diff(startDatetimeToSkip, 'seconds') > 0 ){
          var index = 'corecode-' + cur_kor_datetime.split(' ')[0];

          if ( needNewMapping ) {
              queryProvider.defineMappings(index);
              queryProvider.indexSettings(index, 0);
              needNewMapping = false;
          }
          if ( !initialDataProcessed ){
              sleep(1000);
              insertData(index, type, data_arr.join(','));
          } 
          else {

              if ( diffSeconds <= 0 ) {
                  sleep(1000);
                  insertData(index, type, data_arr.join(','));
              } else if ( diffSeconds > 0 ){
                
                  logger.info('Waiting ', diffSeconds, ' seconds.....');

                  sleep(diffSeconds * 1000);
                  insertData(index, type, data_arr.join(','));
              }
          }
      } else {
          // skip
      }
  // } else { // 17.08.29 전체 노드에 대해서 데이터 입력을 위해서 if문과 함께 주석처리
  //   notMatchedCount += 1;
  // }
})
.on('close', function() {
  logger.info('matched : ', matchedCount, ', unmatched: ', notMatchedCount, ', total : ', (matchedCount + notMatchedCount));
  logger.info('Data Simulator finished successfully.');
});

function printUsage() {
  console.log('Usage : $ node dataSimulator.js [data source file path] [node id] {days for initial data} {insert start datetime}');
  console.log('    []: required, {}: optional');
  console.log('');
  console.log('Ex. $ node dataSimulator.js ./source.csv 0002.00000039 30 \'2017-08-11 11:00:00\'');
  // node dataSimulator.js ../source/busan_tb_node_raw.0315.csv 0002.00000039 49 '2017-08-29 16:58:27'
  // forever start dataSimulator.js ./busan_tb_node_raw.0315.csv 0 1 '2017-10-10 15:20:00'
  // TODO : forever start dataSimulator.js ./busan_tb_node_raw.0315.csv 0 0 으로 실행 시에도 문제없이 돌아야 함., 로직 수정 필요 
}
function insertData(index, type, linedata){

  logger.debug('Inserting data - index: ',index,', data : ',linedata);
  queryProvider.insertData(type, 'insertData', makeJsonData(index, type, linedata));
}

function loadQuery(queryFilePath) {
  var parser = new xml2js.Parser();
  // console.log('initApps/loadQuery -> ' + queryFilePath);
  fs.readFile(queryFilePath, function(err, data) {
    parser.parseString(data, function (err, result) {
    // console.log('initApps/loadQuery -> xml file');
      // result = cleanXML(result);
      result = JSON.stringify(result);
      // console.log('initApps/loadQuery -> %j', result);
      result = JSON.parse(result)
      // console.log('initApps/loadQuery : ' + result.dashboard[0]);
      // console.log('Done');
      global.query = result;
      // console.log('global.query : ', result);
    });
  });
}

function makeJsonData(index, type, data) {

  var linedataArr = data.split(',');
  var s_logs = {
    "index" : index,
    "type" : type,
    "node_id" : linedataArr[0],
    "event_type" : linedataArr[1],
    "measure_time" : linedataArr[2],
    "event_time" : linedataArr[3],
    "voltage" : parseFloat(linedataArr[4]) || 0,
    "ampere" : parseFloat(linedataArr[5]) || 0,
    "power_factor" : parseFloat(linedataArr[6]) || 0,
    "active_power" : parseFloat(linedataArr[7]) || 0,
    "reactive_power" : parseFloat(linedataArr[8]) || 0,
    "apparent_power" : parseFloat(linedataArr[9]) || 0,
    "amount_of_active_power" : parseFloat(linedataArr[10]) || 0,
    "als_level" : parseInt(linedataArr[11]) || 0,
    "dimming_level" : parseInt(linedataArr[12]) || 0,
    "vibration_x" : parseInt(linedataArr[13]) || 0,
    "vibration_y" : parseInt(linedataArr[14]) || 0,
    "vibration_z" : parseInt(linedataArr[15]) || 0,
    "vibration_max" : parseInt(linedataArr[16]) || 0,
    "noise_origin_decibel" : parseFloat(linedataArr[17]) || 0,
    "noise_origin_frequency" : parseInt(linedataArr[18]) || 0,
    "noise_decibel" : parseFloat(linedataArr[19]) || 0,
    "noise_frequency" : parseInt(linedataArr[20]) || 0,
    "gps_longitude" : parseFloat(linedataArr[21]) || 0,
    "gps_latitude" : parseFloat(linedataArr[21]) || 0,
    "gps_altitude" : parseFloat(linedataArr[23]) || 0,
    "gps_satellite_count" : parseInt(linedataArr[24]) || 0,
    "status_als" : parseInt(linedataArr[25]) || 0,
    "status_gps" : parseInt(linedataArr[26])|| 0,
    "status_noise" : parseInt(linedataArr[27]) || 0,
    "status_vibration" : parseInt(linedataArr[28]) || 0,
    "status_power_meter" : parseInt(linedataArr[29]) || 0,
    "status_emergency_led_active" : parseInt(linedataArr[30]) || 0,
    "status_self_diagnostics_led_active" : parseInt(linedataArr[31]) || 0,
    "status_active_mode" : parseInt(linedataArr[32]) || 0,
    "status_led_on_off_type" : parseInt(linedataArr[33]) || 0,
    "reboot_time" : linedataArr[34] || 'NULL',
    "event_remain" : parseInt(linedataArr[35]) || 0,
    "failfirmwareupdate" : parseInt(linedataArr[36]) || 0
  }
  return s_logs;
}

