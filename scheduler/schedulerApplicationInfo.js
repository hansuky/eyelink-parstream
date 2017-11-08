var CONSTS = require('../routes/consts');
var config = require('../config/config.json');
global.config = config;

var fs = require('fs');
var parse = require('csv-parse');
require('date-utils');
var Utils = require('../routes/util');
var QueryProvider = require('../routes/dao/' + global.config.fetchData.database + '/'+ global.config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();
var async = require("async");
var exports = module.exports = Scheduler = {}


// Query Loading from Query.xml
var initapps = require('../routes/initApp');
initapps.loadQuery(function() {
});

Scheduler.process = function process(cb) {
  console.log('start scheduler');

  // 1. ES에 오늘 생성된 인덱스 리스트 조회.
  searchIndexList(function(err, count, indexList) {

    if (count > 0) {
      // 2. efsm_applicationinfo에 이미 등록된 ApplicationInfo 조회.
      searchApplicationInfo(function(err, count, appInfoList) {
        if (err) {
        }
        // 3. Application Name 추출
        var newAppInfoList = extractApplicationName(indexList, appInfoList);

        if (newAppInfoList.length > 0) {
          // 4. efsm_applicationinfo 에 ApplicationInfo 저장.
          saveApplicationInfo(newAppInfoList, function(err) {
            console.log('finished scheduler');
            cb();
          });
        } else {
          console.info('Inserting applicationInfo data is nothing!!');
          cb();
        }

      })
    } else {
      console.log('finished scheduler');
      cb();
    }
  });
}

// 오늘 날짜에 생성된 Index만 조회한다.
searchIndexList = function(cb) {
  console.log('start searchIndexList ');
  var d = new Date();
  var curDate = d.toFormat('YYYY.MM.DD');
  console.log(curDate);
  queryProvider.getIndicesStats('*'+curDate, function(err, count, datas) {
    if (err) { throw err; }
    console.log(count);
    console.log('--------------------------------------------')
    console.log('finished searchIndexList ');
    cb(err, count, datas);
  })

}

searchApplicationInfo = function(cb) {
  console.log('start searchApplicationInfo ');
  var in_data = {
    index: CONSTS.APPLICATION_INFO.INDEX.INDEX_NAME,
    type: CONSTS.APPLICATION_INFO.INDEX.TYPE_NAME
  };
  queryProvider.selectSingleQueryByID2("scheduler","selectApplicationInfo", in_data, function(err, out_data, params) {
    if (err) {
      console.log('ApplicationInfo is null');
      console.log('finished searchApplicationInfo ');
      cb(err, 0);
    }
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      // console.log(out_data);
      // console.log(out_data.length);
    }
    console.log('finished searchApplicationInfo ');

    cb(err, out_data.length, out_data);
  });
}

extractApplicationName = function(indexList, existAppInfoList) {
  console.log('start extractApplicationName ');
  var constELAGENT = CONSTS.APPLICATION_INFO.ELAGENT;
  var constFILEBEAT = CONSTS.APPLICATION_INFO.FILEBEAT;

  var newAppInfoList = [];
  // TODO GMT 시간으로 저장 필요함.
  var d = new Date();
  var regTimeStamp = d.toFormat('YYYY-MM-DDTHH24:MI:SS');
  // regTimeStamp = d.toGMTString();
  // var regTimeStamp = d.toGMTString().toFormat('YYYY-MM-DD HH24:MI:SS');
  for(var indexName in indexList) {
    // console.log(indexName);
    var appInfo = {
      applicationId : '',
      applicationName : '',
      serviceType : '',
      serviceTypeName : '',
      collection : CONSTS.APPLICATION_INFO.COLLECTION.LOG,
      indexName : indexName,
      regTimestamp : regTimeStamp
    }
    if (indexName.indexOf(constELAGENT) >= 0) {
      // ex) elagent_test_app-2017.09.20 => test_app 추출.
      appInfo.applicationId = indexName.substring(constELAGENT.length+1, indexName.length-11);
      appInfo.collection = CONSTS.APPLICATION_INFO.COLLECTION.AGENT;
    } else if (indexName.indexOf(constFILEBEAT) >= 0) {
      // ex) filebeat_jira_access-2017.09.17 => jira_access 추출.
      appInfo.applicationId = indexName.substring(constFILEBEAT.length+1, indexName.length-11)
    } else {
      continue;
    }

    // 이미 등록된 ApplicationId 인지 체크 -> 등록안된 Application만 리스팅.
    // console.log(appInfoList);
    var isNew = true;
    if (existAppInfoList != null) {
      for (var idx=0; idx<existAppInfoList.length; idx++) {
        // console.log('------------------')
        // console.log(existAppInfoList[idx]._source.applicationId);
        if (existAppInfoList[idx]._source.applicationId == appInfo.applicationId)  {
          isNew = false;
          continue;
        }
      }
    }
    if (isNew) {
      // console.log(appInfo);
      var obj = {
        index: {
          _index : CONSTS.APPLICATION_INFO.INDEX.INDEX_NAME,
          _type : CONSTS.APPLICATION_INFO.INDEX.TYPE_NAME}
      }
      // newAppInfoList.push(obj)
      // newAppInfoList.push(JSON.parse(appInfo));
      newAppInfoList.push(appInfo);
    }
  }
  // console.log('----------------------')
  // console.log(newAppInfoList);
  console.log('finished extractApplicationName ');
  return newAppInfoList;
}

saveApplicationInfo = function(newAppInfoList, cb) {
  console.log('start saveApplicationInfo ');
  var in_data = {
    index : CONSTS.APPLICATION_INFO.INDEX.INDEX_NAME,
    type : CONSTS.APPLICATION_INFO.INDEX.TYPE_NAME,
    body : newAppInfoList
  };
  queryProvider.insertBulkQuery(in_data, function(err, out_data) {
    if (err) { console.log(err) };
    console.log(out_data);
    if(out_data.errors == false){
      // console.log(out_data);
      var rtnCode = CONSTS.getErrData("D001");
    }
    console.log('finished saveApplicationInfo ');

    cb(err);
  });
}



// for test
Scheduler.process();

