var Logger = require('./log4js-utils').Logger;
var logger = new Logger('initApp');
var CONSTS = require('./consts');
require('date-utils');
var fs = require('fs'),
    xml2js = require('xml2js');

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

function loadQuery(callback) {
  var parser = new xml2js.Parser();
  logger.info('loadQuery -> ' + __dirname + '/dao/' + global.config.fetchData.database + '/dbquery.xml')
  fs.readFile(__dirname + '/dao/' + global.config.fetchData.database + '/dbquery.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
    // console.log('initApps/loadQuery -> xml file');
      // result = cleanXML(result);
      result = JSON.stringify(result);
      // console.log('initApps/loadQuery -> %j', result);
      result = JSON.parse(result)
      global.query = result;
      // console.log('initApps/loadQuery : ' + result.dashboard[0]);
      // console.log('Done');
      callback();
    });
  });
}

var cleanXML = function(xml){

    var keys = Object.keys(xml),
        o = 0, k = keys.length,
        node, value, singulars,
        l = -1, i = -1, s = -1, e = -1,
        isInt = /^-?\s*\d+$/,
        isDig = /^(-?\s*\d*\.?\d*)$/,
        radix = 10;

    for(; o < k; ++o){
        node = keys[o];

        if(xml[node] instanceof Array && xml[node].length === 1){
            xml[node] = xml[node][0];
        }

        if(xml[node] instanceof Object){
            value = Object.keys(xml[node]);

            if(value.length === 1){
                l = node.length;

                singulars = [
                    node.substring(0, l - 1),
                    node.substring(0, l - 3) + 'y'
                ];

                i = singulars.indexOf(value[0]);

                if(i !== -1){
                    xml[node] = xml[node][singulars[i]];
                }
            }
        }

        if(typeof(xml[node]) === 'object'){
            xml[node] = cleanXML(xml[node]);
        }

        if(typeof(xml[node]) === 'string'){
            value = xml[node].trim();

            if(value.match(isDig)){
                if(value.match(isInt)){
                    if(Math.abs(parseInt(value, radix)) <= Number.MAX_SAFE_INTEGER){
                        xml[node] = parseInt(value, radix);
                    }
                }else{
                    l = value.length;

                    if(l <= 15){
                        xml[node] = parseFloat(value);
                    }else{
                        for(i = 0, s = -1, e = -1; i < l && e - s <= 15; ++i){
                            if(value.charAt(i) > 0){
                                if(s === -1){
                                    s = i;
                                }else{
                                    e = i;
                                }
                            }
                        }

                        if(e - s <= 15){
                            xml[node] = parseFloat(value);
                        }
                    }
                }
            }
        }
    }

    return xml;
};

// 어제날짜까지의 Raw Data를 메모리에 적재 처리함.
// TO-DO 1시간전까지 데이터 적재 로직 보완 필요함.
function loadData(callback) {
  var d = new Date();
  logger.debug('loadData -> today : %s', Date.today());

  for (var i=0; i<global.config.loaddataonstartup.loading_day; i++) {
    logger.debug('loadData -> day : %s', d.removeDays(1).toFormat('YYYY-MM-DD'));
    var flag = 'R';
    if (i === (global.config.loaddataonstartup.loading_day-1))
      flag = 'C';
    // console.log('loadData -> i :   %s, loadind day : %s, flag : %s', i, (CONSTS.CONFIG.LOADING_DAY-1), flag);
    var vDate = d.toFormat('YYYY-MM-DD');
    var in_data = {
      LOAD_DATE : vDate,
      START_TIMESTAMP: vDate + ' 00:00:00',
      END_TIMESTAMP: vDate + ' 23:59:59',
      FLAG : flag};
    queryProvider.selectSingleQueryByID("dashboard", "selectEventRawDataOld", in_data, function(err, out_data, params) {
      // console.log(out_data);
      _rawDataByDay[params.LOAD_DATE] = out_data[0];
      try {
        logger.debug('initApps/loadData -> load_date : %s, count : %s', params.LOAD_DATE, global._rawDataByDay[params.LOAD_DATE].length);
        // console.log('loadData -> flag : %s', params['FLAG'], params.FLAG);
      } catch (e) {
      }
      callback(params);
    });
  }
}

// TO-DO 날짜 변경시 메모리 적재/삭제 기능 추가 기능 구현.


module.exports.loadQuery = loadQuery;
module.exports.loadData = loadData;