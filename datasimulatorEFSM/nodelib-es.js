var queryParser = require('./queryParser');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'http://m2utech.eastus.cloudapp.azure.com:9200',
  // log: 'trace'
});

var sleep = require('system-sleep');

QueryProvider = function() {

};

QueryProvider.prototype.defineMappings = function (newIndex) {

  client.indices.create({
    index: newIndex,
    body: {
      mappings: {
        'corecode': {
          properties: {
            "node_id" : { "type" : "string", "index" : "not_analyzed" },
            "event_type" : { "type" : "string", "index" : "not_analyzed" },
            "measure_time" : { "type" : "string" },
            "event_time" : { "type" : "date" },
            "voltage" : { "type" : "double" },
            "ampere" : { "type" : "double" },
            "power_factor" : { "type" : "double" },
            "active_power" : { "type" : "double" },
            "reactive_power" : { "type" : "double" },
            "apparent_power" : { "type" : "double" },
            "amount_of_active_power" : { "type" : "double" },
            "als_level" : { "type" : "integer" },
            "dimming_level" : { "type" : "integer" },
            "vibration_x" : { "type" : "integer" },
            "vibration_y" : { "type" : "integer" },
            "vibration_z" : { "type" : "integer" },
            "vibration_max" : { "type" : "integer" },
            "noise_origin_decibel" : { "type" : "double" },
            "noise_origin_frequency" : { "type" : "integer" },
            "noise_decibel" : { "type" : "double" },
            "noise_frequency" : { "type" : "integer" },
            "gps_longitude" : { "type" : "double" },
            "gps_latitude" : { "type" : "double" },
            "gps_altitude" : { "type" : "double" },
            "node_geo" : { "type" : "geo_point" },
            "gps_satellite_count" : { "type" : "integer" },
            "status_als" : { "type" : "integer" },
            "status_gps" : { "type" : "integer" },
            "status_noise" : { "type" : "integer" },
            "status_vibration" : { "type" : "integer" },
            "status_power_meter" : { "type" : "integer" },
            "status_emergency_led_active" : { "type" : "integer" },
            "status_self_diagnostics_led_active" : { "type" : "integer" },
            "status_active_mode" : { "type" : "integer" },
            "status_led_on_off_type" : { "type" : "integer" },
            "reboot_time" : { "type" : "string"},
            "event_remain" : { "type" : "integer" },
            "failfirmwareupdate" : { "type" : "integer" }
          }
        }
      }
    }
  }).then(function (resp) {
      logger.trace(resp);
  }, function (err) {
      logger.error(err.message);
  });

}

QueryProvider.prototype.indexSettings = function (newIndex, failCount) {
  if ( failCount < 10 ) {
    sleep(1000);
    var self = this;
    client.indices.putSettings({
      index: newIndex,
      body: { "index": { "max_result_window": 100000 } }
    }).then(function (resp) {
        logger.trace(resp);
    }, function (err) {
        logger.debug('failCount(',failCount+1,')', err.message);
        self.indexSettings(newIndex, failCount + 1);
    });
  }else {
    logger.error('Index settings skipped because of too many fail count. failCount: '+failCount);
  }
}

QueryProvider.prototype.insertData = function (type, queryId, datas) {  
  // console.log('queryId : '+queryId);
   // SQL 내 파라메타를 변경해준다.
  var sQueryString = replaceSql2(queryParser.getQuery(type, queryId), datas);
  // console.log('nodelib-es/insertQueryByID -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);
  // console.log(sQueryString);
  // sQueryString = sQueryString.replace(/\r?\n|\r/g, ' ');

  client.index(
    sQueryString
  ).then(function (resp) {      
      // console.log(resp);
  }, function (err) {
      logger.error(err.message);
      console.log(sQueryString);
  });
}

exports.QueryProvider = QueryProvider;


function replaceSql2(sql, params) {
  // var params = {ID : 'AAAA', DATE: '2016-12-12', NUM: 5};
  for (var key in params) {
    // console.log('util/replaceSql2 -> key : %s, value : %s', key, params[key]);
    // if (typeof params[key] === 'object')
    //   console.log('util/replaceSql -> key : %s, value : %s, typeof ', key, params[key], typeof params[key], typeof params[key][0]);

    // 먼저 배열 parameter를 처리한다.
    var re = new RegExp("#" + key + "#","g");
    var re1 = new RegExp("##" + key + "##","g");    
    if (typeof params[key] === 'object') {
      if (typeof params[key][0] === 'string') {
        var tsql = '';
        for (var i=0; i<params[key].length; i++) {
          tsql += '"' + params[key][i] + '",';
        }
        tsql = tsql.substring(0, tsql.length-1);
        sql = sql.replace(re1, tsql);
      } else if (typeof params[key][0] === 'number') {
        var tsql = '';
        for (var i=0; i<params[key].length; i++) {
          tsql += params[key][i] + ",";
        }
        tsql = tsql.substring(0, tsql.length-1);
        sql = sql.replace(re1, tsql);
      } else if (typeof params[key][0] === 'undefined') {
        // console.log('test');
        // console.log(key);
        // console.log(params[key][0]);
        throw new Error('Please check sql array params');
      }
    } else if (typeof params[key] === 'string') {
       if(params[key].substring(0,1) == '{'){
       sql = sql.replace(re, params[key]); 
      } else {
        sql = sql.replace(re, '"' + params[key] + '"');
      }      
    } else if (typeof params[key] === 'number') {
      sql = sql.replace(re, params[key]);
    } else {
      throw new Error('Please check sql params');
    }
  }
  // console.log(sql);
  // sql.should.be.equal("SELECT * FROM A WHERE DATE >= '2016-12-12' AND ID = 'AAAA' AND NUM = 5");
  return sql;
}
