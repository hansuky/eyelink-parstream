var Logger = require('./log4js-utils').Logger;
var logger = new Logger('nodeDashboardEFSM');
var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
require('date-utils');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'open selected', timeseries:'', reports:'', analysis:'', management:'', settings:''};

var indexAcc = global.config.es_index.es_jira;
var indexAppinfo = global.config.es_index.es_appinfo;
var indexElagent = global.config.es_index.es_elagent;
var indexAlarm = global.config.es_index.es_alarm;
var indexMetric = global.config.es_index.es_metric;

var startTime = CONSTS.STARTTIME.KOREA;
var fmt1 = CONSTS.DATEFORMAT.DATE; // "YYYY-MM-DD",
var fmt2 = CONSTS.DATEFORMAT.DATETIME; // "YYYY-MM-DD HH:MM:SS",
var fmt4 = CONSTS.DATEFORMAT.INDEXDATE; // "YYYY.mm.DD",

router.get('/', function(req, res, next) {
  mainmenu.dashboard = 'open selected';
  mainmenu.timeseries = '';
  var server = req.query.server, type = '';
  var in_data = {    index:  indexAppinfo, type: "applicationInfo"    };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByIndex", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;    
    list.push({ id : 'all', name : 'all' });    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(check[d._source.applicationId]==null){
          check[d._source.applicationId] = { no : cnt++};          
          list.push({ id : d._source.collection, name : d._source.applicationId, type : d._source.collection });
          if(server == d._source.applicationId){
            type = d._source.collection;
          }
        } 
      });       
    }    
    if(server == undefined || server == ""){
      server = list[0].name;
      type = list[0].type;
    }    
    res.render('./dashboard/main', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc, agent: list, server : server, type : type }); 
  });
});

 router.get('/error_pop', function(req, res, next) { 
  res.render('./dashboard/error_pop', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/error_pop_jira', function(req, res, next) {     
  var today = Utils.getToday(fmt1);  
  var in_data = {
    index:  [indexAcc+Utils.getDate(today, fmt4, -1, 0, 0, 0),  indexAcc+Utils.getToday(fmt4)],
    START : Utils.getDate(today, fmt1, -1, 0, 0, 0)+startTime,
    END : today+startTime,    MIN : 400  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraErrorList", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        d._source.timestamp = Utils.getDateUTC2Local(d._source.timestamp, fmt2);
      });
    }
    res.render('./dashboard/scatter_detail_jira', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : out_data });
  });  
});                 

router.get('/error_pop_agent', function(req, res, next) {
  var today = Utils.getToday(fmt1);  
  var in_data = {
    index:  [indexElagent+'*'],
    //index:  [indexElagent+Utils.getDate(today, fmt4, -1, 0, 0, 0),  indexElagent+Utils.getToday(fmt4)],
    type : "TraceDetail",
    start : Utils.getDate(today, fmt1, -1, 0, 0, 0)+startTime,
    end : today+startTime  };   
  queryProvider.selectSingleQueryByID2("dashboard","getAgentError", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    out_data.forEach(function(d){                              
      d._source.startTime = Utils.getDateUTC2Local(d._source.startTime, fmt2);      
    });       
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }  
    res.render('./dashboard/scatter_detail_agent', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : out_data });
  });  
});     

router.get('/timeseriesAGENT', function(req, res, next) {  
  mainmenu.dashboard = '';
  mainmenu.timeseries = ' open selected';    
  var server = req.query.server, type = '';
  var in_data = {    index:  indexAppinfo, type: "applicationInfo"    };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByIndex", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(check[d._source.applicationId]==null){
          check[d._source.applicationId] = { no : cnt++};
          list.push({ id : d._source.collection, name : d._source.applicationId, type : d._source.collection });
          if(server == d._source.applicationId){
            type = d._source.collection;
          }          
        } 
      });       
    }    
    if(server == undefined || server == ""){
      server = list[0].name;
      type = list[0].type
    }    
    res.render('./dashboard/inspector', { title: global.config.productname, mainmenu:mainmenu, agent: list, server : server, type : type });
  });
});

router.get('/timeseriesLOG', function(req, res, next) {    
  mainmenu.dashboard = '';
  mainmenu.timeseries = 'open selected';
  var server = req.query.server, type = '';
  var in_data = {    index:  indexAppinfo, type: "applicationInfo"    };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByIndex", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(check[d._source.applicationId]==null){
          check[d._source.applicationId] = { no : cnt++};
          list.push({ id : d._source.collection, name : d._source.applicationId, type : d._source.collection });
          if(server == d._source.applicationId){
            type = d._source.collection;
          }          
        } 
      });       
    }    
    if(server == undefined || server == ""){
      server = list[0].name;
      type = list[0].type;
    }    
    res.render('./dashboard/timeseries'+global.config.pcode, { title: global.config.productname, mainmenu:mainmenu, agent: list, server : server, type : req.query.server }); 
  });
});

router.get('/timeseries_agent', function(req, res, next) {  
  mainmenu.dashboard = '';
  mainmenu.timeseries = ' open selected';    
  var server = req.query.server;
  var in_data = {    index:  indexAppinfo, type: "applicationInfo"    };    
  queryProvider.selectSingleQueryByID2("dashboard","selectByIndex", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(check[d._source.applicationId]==null){
          check[d._source.applicationId] = { no : cnt++};
          list.push({ id : d._source.collection, name : d._source.applicationId, type : d._source.collection });
        } 
      });       
    }    
    if(server == undefined || server == ""){
      server = list[0].name;
    }    
    res.render('./dashboard/inspector', { title: global.config.productname, mainmenu:mainmenu, agent: list, server : server });
  });
});

router.get('/bottleneck', function(req, res, next) {
  mainmenu.dashboard = 'open selected';
  mainmenu.timeseries = '';
  var server = req.query.server;    
  var in_data = { index:  indexAppinfo, type: "applicationInfo" };
  queryProvider.selectSingleQueryByID2("dashboard","selectByIndex", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    var check = {}, list = [], cnt = 0;        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      out_data.forEach(function(d){
        if(check[d._source.applicationId]==null){
          check[d._source.applicationId] = { no : cnt++};
          list.push({ id : d._source.collection, name : d._source.applicationId })
        } 
      });      
    }    
    if(server == undefined || server == ""){
      server = list[0].name;
    }    
  res.render('./dashboard/bottleneck', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc, agent: list, server : server }); 
  });
});


router.get('/trenddata', function(req, res, next) {
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/trenddata', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc});
});

router.get('/test', function(req, res, next) {
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/test', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc });
});

// query RawData
router.get('/restapi/getDashboardRawData', function(req, res, next) {
  // load data on startup이 true일 경우
  if (global.config.loaddataonstartup.active) {    
    queryProvider.selectSingleQueryByID2("dashboard", "selectEventRawData", in_data, function(err, out_data, params) {      
      var rtnCode = CONSTS.getErrData('0000');
      if (out_data === null) {
        rtnCode = CONSTS.getErrData('0001');
      }
      // console.log('typeof array : %s', (typeof out_data[0] !== 'undefined'));
      // console.log('typeof array : %s', (out_data[0] !== null));

      // MERGE = 'Y'이면 이전 날짜의 RawData를 합쳐준다.
      // if (params.MERGE === 'Y')
      //   out_data = Utils.mergeLoadedData(out_data);

      // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data);
      // console.log('dashboard/restapi/getReportRawData -> out_data : %s', out_data[0]);
      logger.debug('dashboard/restapi/getDashboardRawData -> length : %s', out_data.length);
      res.json({rtnCode: rtnCode, rtnData: out_data});
    });
  } else {  // false 인 경우는 현재일자부터 7일전 리스트를 조회.
    var d = new Date();
    var to_date = d.toFormat('YYYY-MM-DD');
    getTbRawDataByPeriod(d.removeDays(7).toFormat('YYYY-MM-DD'), to_date, res);
  }
});

router.get('/restapi/selectJiraAccReq', function(req, res, next) {
  logger.debug('dashboard/restapi/selectJiraAccReq');
  var in_data = { index : req.query.index, START : req.query.START, END : req.query.END  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccReq", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }     
    res.json({rtnCode: rtnCode, rtnData: out_data});
  });
});

router.get('/restapi/selectJiraSankeyByLink', function(req, res, next) {
  logger.debug('dashboard/restapi/selectJiraSankeyByLink');
  if(req.query.gap == 0){
    var day = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N');
    var from = Utils.getDate(day, fmt1, -1, 0, 0, 0);    
    var in_data = {
      //index:  [indexAcc+Utils.getDate(from, fmt4, 0, 0, 0, 0),  indexAcc+Utils.getDate(day, fmt4, 0, 0, 0, 0)],
      index : [indexAcc+'*'], type : "access", START : from+startTime,  END : day+startTime  };   
  } else {       
    var now = Utils.getMs2Date(parseInt(req.query.date),fmt2,'Y');
    var start = Utils.getMs2Date(parseInt(req.query.date)-parseInt(req.query.gap),fmt2,'Y');
    var in_data = { index : [indexAcc+'*'], type : "access", START : start,  END : now  };  
  };     
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccReq", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      var node={}, nodes = [], line = {}, lines = [], req={},  last = {}, lineNode = {}, id={};
      var colors=['#FF0000', '#FF5E00', '#FFBB00', '#FFE400', '#ABF200', '#1DDB16', '#00D8FF', '#0054FF', '#0100FF', '#5F00FF',
                    '#FF00DD', '#FF007F', '#FFA7A7', '#FFE08C', '#CEF279', '#B2EBF4', '#B5B2FF', '#FFB2F5', '#CC723D', '#008299'];  
      var reqCnt = 0, nodeCnt = 0, lineCnt = 0, lineNodeCnt = 0, idCnt = 0, nodeNo = 0;
      var nodeList = []; 
      out_data.forEach(function(d) {          
        if(d._source.request != null) {
          var a = d._source.request.split('?');                         
          var c = a[0].split('.');    

          if(d._source.auth == null){
            d._source.auth = 'visitor';
          }      
          var b = a[0].split('/');

          if(req[a[0]] == null) {          
            req[a[0]] = { no : reqCnt++, cnt : 1};
          } else {
            req[a[0]].cnt++;        
          }        
        
          if(id[b[b.length-1]] == null) {
            id[b[b.length-1]] = colors[idCnt++%20];                   
          }
  
        var nodeId = b[b.length-1]+'_'+req[a[0]].no;      
        if(node[nodeId] ==null){
          nodeList[nodeNo] = nodeId;
          node[nodeId] ={ name : a[0], id : nodeId, no : nodeNo++, errcnt : 0, cnt : 1 };  
        }
        if(last[d._source.auth] != null){
          var from = last[d._source.auth];
          var to = nodeId;  
          if(node[from].no > node[to].no){
            from = nodeId;
            to = last[d._source.auth];
          }        
          if(from != to){
            if(line[node[to].no+'-'+node[from].no] == null){
              if(lineNode[from] == null) {                
                lineNode[from] = {};        
                node[from].no = lineNodeCnt;        
                nodes[lineNodeCnt++] = node[from];                        
              }
              if(lineNode[to] == null) {
                lineNode[to] = {};    
                node[to].no = lineNodeCnt;
                nodes[lineNodeCnt++] = node[to];                                
              }
              var source = node[from].no;
              var target = node[to].no;              
              if(line[source+'-'+target] == null) {                
                line[source+'-'+target] = { no : lineCnt };          
                nodes[target].cnt++              
                if(d._source.response < 400){                           
                  lines[lineCnt++] = {  source:  source , target: target, value : 0.0001, cnt :  1, errcnt : 0 };                           
                } else {                                             
                  lines[lineCnt++] = {  source:  source , target: target, value : 0.0001, cnt :  1, errcnt : 1, elist : d._id };                                                
                  nodes[node[nodeId].no].errcnt++;                   
                }  
              } else {                            
                lines[line[source+'-'+target].no].value += 0.0001;
                lines[line[source+'-'+target].no].cnt++;
                nodes[target].cnt++;                           
                 
                if(d._source.response >= 400){              
                  if(lines[line[source+'-'+target].no].errcnt == 0) {
                    lines[line[source+'-'+target].no].elist = d._id;
                  } else {
                    lines[line[source+'-'+target].no].elist += ','+d._id;       
                  }       
                  lines[line[source+'-'+target].no].errcnt++;             
                  nodes[node[nodeId].no].errcnt++;                                           
                }
              }
            } else {                   
              lines[line[node[to].no+'-'+node[from].no].no].value += 0.0001;
              lines[line[node[to].no+'-'+node[from].no].no].cnt++;
            }
          } else {            
            if(lineNode[to] == null) {
              lineNode[to] = {};                  
              node[to].no = lineNodeCnt;              
              nodes[lineNodeCnt++] = node[to];                                
            }  
          }
        }        
        last[d._source.auth] =  node[nodeId].id;       
      }
    });
    nodes.forEach(function(d){  
      if(d.errcnt > 0){
        d.name = '[Err:'+ d.errcnt + '] '+d.name;
      } else {
        d.name = d.name;
      }
    });
    var json = {"nodes" :nodes, "links" : lines };
  }   
  res.json({rtnCode: rtnCode, rtnData: json, id : id});
  });
});


router.get('/sankey_pop', function(req, res, next) {
  var in_data = {
    index:  indexAcc+"*",    
    type: "access",
    id : req.query.link.split(',')
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByIdList", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }     
    res.render('./dashboard/sankey_pop', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : out_data });
  });  
});

router.get('/restapi/selectJiraAccDash', function(req, res, next) {      
  if(req.query.gap == 0){
    var day = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N');
    var from = Utils.getDate(day, fmt1, -1, 0, 0, 0);    
    var in_data = {
      //index:  [indexAcc+Utils.getDate(from, fmt4, 0, 0, 0, 0),  indexAcc+Utils.getDate(day, fmt4, 0, 0, 0, 0)],
      index : [indexAcc+'*'], type : "access", START : from+startTime,  END : day+startTime  };   
  } else {       
    var now = Utils.getMs2Date(parseInt(req.query.date),fmt2,'Y');
    var start = Utils.getMs2Date(parseInt(req.query.date)-parseInt(req.query.gap),fmt2,'Y');
    var in_data = { index : [indexAcc+'*'], type : "access", START : start,  END : now  };  
  }

  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccDash", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }            
    var data = [], max = 0, start = new Date().getTime(), end = new Date('1990-01-01').getTime();    
    out_data.forEach(function(d){             
      var date = new Date(d._source.timestamp).getTime();            
      if(d._source.response != null) {                  
        if(date < start){            
          start = date;            
        } else if(date > end){            
          end = date;        
        }          
        if(max < d._source.responsetime){
          max = d._source.responsetime;
        }
        data.push({
          x : date,
          y : d._source.responsetime,
          date : new Date(date),
          hour : new Date(date).getHours(),
          type : d._source.response >= 400? 'Error' : 'Success', 
          term : d._source.response >= 400? 'Error' : (d._source.responsetime < 1000 ? '1s' : (d._source.responsetime < 3000 ? '3s' : (d._source.responsetime < 5000 ? '5s' : 'Slow'))),
          index : d._source.response >= 400? 4 : (d._source.responsetime < 1000 ? 0 : (d._source.responsetime < 3000 ? 1 : (d._source.responsetime < 5000 ? 2 : 3)))
        });
      }
    });      
    start -= start%(10*60*1000);
    end += (10*60*1000 - end%(10*60*1000));
    max = Math.ceil(max/1000)*1000;
    if(max < 1000){
      max = 1000;
    }
    res.json({rtnCode: rtnCode, rtnData: data, start : start, end : end, max : max });
  });
});

router.get('/selected_detail_jira', function(req, res, next) {          
  var start = Utils.getMs2Date(new Date(parseInt(req.query.start)), fmt2, 'Y');  
  var end = Utils.getMs2Date(new Date(parseInt(req.query.end)), fmt2, 'Y');   
  var in_data = {
    index:  [indexAcc+Utils.getDate(start, fmt4), indexAcc+Utils.getDate(end,fmt4)],
    START : start,  END : end,
    MIN : parseInt(req.query.min),
    MAX : parseInt(req.query.max)  
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectScatterSectionList", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {      
      out_data.forEach(function(d){         
        d._source.timestamp = Utils.getDateUTC2Local(d._source.timestamp, fmt2);                
      });
    }    
    res.render('./dashboard/scatter_detail_jira', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : out_data });
  });  
});                 

router.get('/selected_detail_agent', function(req, res, next) {    
  var start = Utils.getMs2Date(new Date(parseInt(req.query.start)), fmt2, 'Y');  
  var end = Utils.getMs2Date(new Date(parseInt(req.query.end)), fmt2, 'Y');   
  var in_data = {    index : [indexElagent+'*'] , type : "TraceDetail",
            start : start, end : end, min : parseInt(req.query.min), max : parseInt(req.query.max)  }; 
  queryProvider.selectSingleQueryByID2("dashboard","getTransaction", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    out_data.forEach(function(d){                                
      d._source.startTime = Utils.getDateUTC2Local(d._source.startTime, fmt2);
    });       
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }  
    res.render('./dashboard/scatter_detail_agent', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : out_data });
  });  
});        

router.get('/restapi/getTransactionDetail', function(req, res, next) {
  logger.debug('dashboard/restapi/getTransactionDetail');      
  var in_data = {
    index : indexElagent+Utils.getMs2Date(new Date(req.query.date),fmt4) ,
    type : "TraceDetail",
    id : "transactionId",    value : req.query.id,
    sort : "startTime"
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByIdValueSort", in_data, function(err, out_data, params) {     
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/countAccJiraDay', function(req, res, next) {
  logger.debug('dashboard/restapi/countAccJiraDay');   
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;      
  var in_data = {    index : indexAcc+"*", type : "access", START : start , END : end };  
  queryProvider.selectSingleQueryCount("dashboard","countAccJira", in_data, function(err, out_data, params) {
    var today = out_data;    
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      var ydate = Utils.getDate(start, fmt1, -1, 0, 0, 0)+startTime
      var in_data = {    index : indexAcc+"*", type : "access", START : ydate , END : start };        
      queryProvider.selectSingleQueryCount("dashboard","countAccJira", in_data, function(err, out_data, params) {
        var yday = out_data;
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }            
        res.json({rtnCode: rtnCode, rtnData: out_data, today : today, yday : yday });
      });
    }   
    res.json({rtnCode: rtnCode, rtnData: out_data, today : today, yday : yday });
  });
});

router.get('/restapi/countAccJiraMon', function(req, res, next) {
  logger.debug('dashboard/restapi/countAccJiraMon');   
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;    
  var start = Utils.getDate(end, fmt1, -(new Date(parseInt(req.query.date)).getDate()), 0, 0, 0)+startTime;    
  var in_data = {    index : indexAcc+"*", type : "access", START : start , END : end };  
  queryProvider.selectSingleQueryCount("dashboard","countAccJira", in_data, function(err, out_data, params) {
    var tmon = out_data;    
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      end = start;
      start = Utils.getDate(end, fmt1, -(new Date(new Date(end).getTime()-1).getDate()), 0, 0, 0)+startTime;          
      var in_data = {    index : indexAcc+"*", type : "access", START : start , END : end };  
      queryProvider.selectSingleQueryCount("dashboard","countAccJira", in_data, function(err, out_data, params) {
        var ymon = out_data;
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }            
        res.json({rtnCode: rtnCode, rtnData: out_data, tmon : tmon, ymon : ymon });
      });
    }   
    res.json({rtnCode: rtnCode, rtnData: out_data, tmon : tmon, ymon : ymon });
  });
});

router.get('/restapi/countAccJiraError', function(req, res, next) {
  logger.debug('dashboard/restapi/countAccJiraError');      
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;  
  var in_data = {    index : indexAcc+"*", type : "access", START : start , END : end };  
  queryProvider.selectSingleQueryCount("dashboard","countAccJiraError", in_data, function(err, out_data, params) {    
    var today = out_data;
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      var ydate = Utils.getDate(start, fmt1, -1, 0, 0, 0)+startTime
      var in_data = {    index : indexAcc+"*", type : "access", START : ydate , END : start };  
      queryProvider.selectSingleQueryCount("dashboard","countAccJiraError", in_data, function(err, out_data, params) {
        var yday = out_data;
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }        
        res.json({rtnCode: rtnCode, rtnData: out_data, today : today, yday : yday });
      });
    }       
    res.json({rtnCode: rtnCode, rtnData: out_data, today : today, yday : yday });
  });
});

router.get('/restapi/getJiraAccOneWeek', function(req, res, next) {
  logger.debug('dashboard/restapi/getJiraAccOneWeek');  
  var in_data = {
    index: indexAcc+"*", type : "access",
    start: Utils.getDate(Utils.getToday(fmt2,'N','Y'), fmt1, -7, 0, 0, 0)+startTime  
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccOneWeek", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }     
    var data = [];
    out_data.forEach(function(d) {          
      d._source.timestamp = Utils.getDate(d._source.timestamp, fmt2, 0, 0, 0, 0)
      d._source.response = parseInt(d._source.response);
      if(d._source.response >= 400 && d._source.response < 500) {
        d._source.event_type = 1;
      } else {
        d._source.event_type = 0;
      }
      if(d._source.timestamp != null){        
        data.push(d._source);
      }
    });       
    res.json({rtnCode: rtnCode, rtnData: data });
  });  
});

router.get('/restapi/getAgentOneWeek', function(req, res, next) {  
  var in_data = {
    index : indexElagent+'*', type : "ApplicationLinkData",    
    id : "startTime",
    start: Utils.getDate(Utils.getToday(fmt2,'N','Y'), fmt1, -7, 0, 0, 0)+startTime  
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectByStart", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }     
    var data = [];
    out_data.forEach(function(d) {              
      d._source.startTime = Utils.getDate(d._source.startTime, fmt2, 0, 0, 0, 0)
      if(d._source.isError) {
        data.push({ day : d._source.startTime, event_type : 1 });
      } else {
        data.push({ day : d._source.startTime, event_type : 0 });
      }           
    });       
    res.json({rtnCode: rtnCode, rtnData: data });
  });  
});

router.get('/restapi/getAccTimeseries', function(req, res, next) {
  logger.debug('dashboard/restapi/getAccTimeseries');  
  var end = Utils.getMs2Date(req.query.date,fmt1,'Y');  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0);  
  var in_data = { index : [indexAcc+Utils.getDate(start, fmt4), indexAcc+Utils.getDate(end, fmt4)], type : "access",
                  gte : start+startTime, lte : end+startTime, interval : req.query.interval };
  queryProvider.selectSingleQueryByID3("dashboard","getAccTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');  
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {      
      var data = [];
      out_data = out_data.group_by_timestamp.buckets;
      out_data.forEach(function(b) {
        var d = b.group_by_code.buckets;        
        data.push({ timestamp : b.key, res_time : d.ok.group_by_time.buckets.res_time.doc_count, slow : d.ok.group_by_time.buckets.slow.doc_count, error : d.error.doc_count });         
      });
    }   
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});

router.get('/restapi/getProcessTimeseries', function(req, res, next) {
  logger.debug('dashboard/restapi/getProcessTimeseries');    
  var end = Utils.getMs2Date(req.query.date,fmt1,'Y');  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0); 
  var in_data = { index : [indexMetric+Utils.getDate(start, fmt4), indexMetric+Utils.getDate(end, fmt4)], 
                  type : "metricsets", gte : start+startTime, lte : end+startTime }  
  queryProvider.selectSingleQueryByID2("dashboard","getProcessTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];       
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = [];
      out_data.forEach(function(d) {      
        data.push({ timestamp : new Date(d._source.timestamp).getTime(), cpu_total : d._source.system.process.cpu.total.pct, memory_rss : d._source.system.process.memory.rss.pct } );
      });  
    }
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});

router.get('/restapi/getTopTimeseries', function(req, res, next) {
  logger.debug('dashboard/restapi/getTopTimeseries');    
  var end = Utils.getMs2Date(req.query.date,fmt1,'Y');  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0); 
  var in_data = { index : [indexMetric+Utils.getDate(start, fmt4), indexMetric+Utils.getDate(end, fmt4)], 
                  type : "metricsets", gte : start+startTime, lte : end+startTime } 
  queryProvider.selectSingleQueryByID2("dashboard","getTopTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];   
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = [];      
      var top = [0,0,0,0,0,0,0,0,0,0]
      var time = new Date().getTime();
      var cnt = 0;
      out_data.forEach(function(d) {          
        d._source.timestamp = new Date(d._source.timestamp).getTime();    
        if(time != d._source.timestamp){      
          if(time < d._source.timestamp) {
            data.push({ timestamp : time, top1 : top[0], top2 : top[1], top3 : top[2], top4 : top[3], top5 : top[4], top6 : top[5], top7 : top[6], top8 : top[7], top9 : top[8], top10 : top[9] });
          }
          time = d._source.timestamp;
          cnt = 0;
          top = [0,0,0,0,0,0,0,0,0,0];          
        } else {
          top[cnt++] = d._source.system.process.cpu.total.pct;
        }
      });
    }
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});

router.get('/restapi/getTotalTimeseries', function(req, res, next) {
  logger.debug('dashboard/restapi/getTotalTimeseries');    
  var end = Utils.getMs2Date(req.query.date,fmt1,'Y');  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0); 
  var in_data = { index : [indexMetric+Utils.getDate(start, fmt4), indexMetric+Utils.getDate(end, fmt4)], 
                  type : "metricsets", gte : start+startTime, lte : end+startTime }
  queryProvider.selectSingleQueryByID2("dashboard","getTotalTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];   
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = [];
      var m_used = 0, m_actual_used = 0, m_swap_used = 0, c_user = 0, c_system = 0, c_idle = 0;
      out_data.forEach(function(d) {      
        if(d._source.metricset.name == "memory") {      
          m_used = d._source.system.memory.used.pct;
          m_actual_used = d._source.system.memory.actual.used.pct;
          m_swap_used = d._source.system.memory.swap.used.pct;
          data.push({ timestamp : new Date(d._source.timestamp).getTime(), memory_used : m_used, memory_actual_used : m_actual_used, memory_swap_used : m_swap_used, cpu_user : c_user, cpu_system : c_system, cpu_idle : c_idle } );
        } else if(d._source.metricset.name == "cpu") {
          c_user = d._source.system.cpu.user.pct;
          c_system = d._source.system.cpu.system.pct;
          c_idle = d._source.system.cpu.idle.pct;
          data.push({ timestamp : new Date(d._source.timestamp).getTime(), cpu_user : d._source.system.cpu.user.pct, cpu_system : d._source.system.cpu.system.pct, cpu_idle : d._source.system.cpu.idle.pct } );
        }
      });
    }
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});

router.get('/restapi/getJiramapdata', function(req, res, next) {
  logger.debug('dashboard/restapi/getJiramapdata');
  if(req.query.gap == 0){
    var day = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N');
    var from = Utils.getDate(day, fmt1, -1, 0, 0, 0);        
    var in_data = {
      //index:  [indexAcc+Utils.getDate(from, fmt4, 0, 0, 0, 0),  indexAcc+Utils.getDate(day, fmt4, 0, 0, 0, 0)],
      index : [indexAcc+'*'], type : "access", START : from+startTime,  END : day+startTime  };   
  } else {       
    var now = Utils.getMs2Date(parseInt(req.query.date),fmt2,'Y');
    var start = Utils.getMs2Date(parseInt(req.query.date)-parseInt(req.query.gap),fmt2,'Y');
    var in_data = { index : [indexAcc+'*'], type : "access", START : start,  END : now  };  
  }
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccMap", in_data, function(err, out_data, params) {        
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }        
      var nodes = [], edges = [], nodekey = [], edgekey = [], nodeList = [];
      nodes.push({ data : { id : 'jira', name : 'jira', img : '../assets/sample/JIRA.png', parent : 'p_jira' }});      
      nodekey['jira'] = 0
      var color = ["#d5d5d5", "#57a115", "#de9400", "#de3636"];
      out_data.forEach(function(d){
        d._source.application_id = 'USER';
        d._source.application_name = 'USER';
        d._source.to_application_id = 'jira';        
        if(nodekey[d._source.application_id]!=null) {       
          if(parseInt(d._source.response) >=400 ) {
            nodekey[d._source.to_application_id]++;
          }
        } else { 
          nodekey[d._source.application_id] = 0;                  
          var img = d._source.application_name.split(' ');
          nodeList.push({ id : d._source.application_id, status : 0 });
          nodes.push({ data : { id : d._source.application_id, name : d._source.application_name, img : '../assets/sample/server-'+img[0]+'.png', parent : 'p_'+d._source.application_id }});      
          if(parseInt(d._source.response) >= 400 ) {
            nodekey[d._source.application_id]++;
          }
        }        
        if(edgekey[d._source.application_id+'>'+d._source.to_application_id] != null) {
          edgekey[d._source.application_id+'>'+d._source.to_application_id]++
        } else {
          edgekey[d._source.application_id+'>'+d._source.to_application_id] = 1;
        }        
      });      
      nodes.forEach(function(d){    
        if(nodekey[d.data.id]!=0){
          d.data.color = color[3];
        } else {
          d.data.color = color[1];
        }
      });      
      for(key in nodekey) {
        if(nodekey[key] != 0){
          nodes.push({ data : { id : 'p_'+key, name : nodekey[key] ,img : '../assets/sample/back.png' }});      
        }
      }
      for(key in edgekey) {
        var id = key.split('>');    
        edges.push({ data : { count : edgekey[key], source : id[0], target : id[1]} });
      }       
    res.json({rtnCode: rtnCode, nodes : nodes, edges : edges, nodeList : nodeList});
  });
});

router.get('/restapi/getAllMapData', function(req, res, next) {
  logger.debug('dashboard/restapi/getAllMapData');    
  var day = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N');
  var from = Utils.getDate(day, fmt1, -1, 0, 0, 0);    
  var in_data = {  index : [indexAcc+'*'], type : "access", START : from+startTime,  END : day+startTime  };   
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccMap", in_data, function(err, out_data, params) {             
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }            
     var nodes1 = [], edges1 = [], nodekey1 = [], edgekey1 = [], nodeList1 = [];     
     nodes1.push({ data : { id : 'jira', name : 'jira', img : '../assets/sample/JIRA.png', parent : 'p_jira' }});      
     nodekey1['jira'] = 0
      var color = ["#d5d5d5", "#57a115", "#de9400", "#de3636"];
      out_data.forEach(function(d){            
        d._source.application_id = 'USER';
        d._source.application_name = 'USER';
        d._source.to_application_id = 'jira';        
        if(nodekey1[d._source.application_id]!=null) {       
          if(parseInt(d._source.response) >=400 ) {
            nodekey1[d._source.to_application_id]++;
          }
        } else { 
          nodekey1[d._source.application_id] = 0;                  
          var img = d._source.application_name.split(' ');
          nodeList1.push({ id : d._source.application_id, status : 0 });
          nodes1.push({ data : { id : d._source.application_id, name : d._source.application_name, img : '../assets/sample/server-'+img[0]+'.png', parent : 'p_'+d._source.application_id }});      
          if(parseInt(d._source.response) >= 400 ) {
            nodekey1[d._source.to_application_id]++;
          }
        }        
        if(edgekey1[d._source.application_id+'>'+d._source.to_application_id] != null) {
          edgekey1[d._source.application_id+'>'+d._source.to_application_id]++
        } else {
          edgekey1[d._source.application_id+'>'+d._source.to_application_id] = 1;
        }        
      });      
      nodes1.forEach(function(d){    
        if(nodekey1[d.data.id]!=0){
          d.data.color = color[3];
        } else {
          d.data.color = color[1];
        }
      });      
    logger.debug('dashboard/restapi/getAgentMap');    
    var in_data = {
      index : indexElagent+"*",
      type : "ApplicationLinkData",
      start : from+startTime,  end : day+startTime,
      id : "startTime"
    };    
    queryProvider.selectSingleQueryByID2("dashboard","selectByRange", in_data, function(err, out_data, params) {          
      var rtnCode = CONSTS.getErrData('0000');    
      if (out_data == null) {
        rtnCode = CONSTS.getErrData('0001');      
      }             
      var nodes = nodes1, edges = edges1, nodekey = nodekey1, edgekey = edgekey1, nodeList = nodeList1;     
      out_data.forEach(function(d){            
        if(d._source.applicationId == 'USER'){

          if(nodekey[d._source.applicationId]!=null) {       
            if(d._source.isError) {
              nodekey[d._source.toApplicationId]++;
            }
          } else {           
            nodekey[d._source.applicationId] = 0;                            
            nodeList.push({ id : d._source.applicationId, status : 0 });
            nodes.push({ data : { id : d._source.applicationId, name : d._source.applicationId, img : '../assets/sample/server-'+d._source.serviceTypeName+'.png', parent : 'p_'+d._source.applicationId }});      
            if(d._source.isError) {
              nodekey[d._source.toApplicationId]++;             
            }
          }
          if(edgekey[d._source.applicationId+'>'+d._source.toApplicationId] != null) {
            edgekey[d._source.applicationId+'>'+d._source.toApplicationId]++
          } else {
            if(nodekey[d._source.toApplicationId] == null){
              nodekey[d._source.toApplicationId] = 0;                            
              nodeList.push({ id : d._source.toApplicationId, status : 0 });
              nodes.push({ data : { id : d._source.toApplicationId, name : d._source.toApplicationId, img : '../assets/sample/server-'+d._source.toServiceTypeName+'.png', parent : 'p_'+d._source.toApplicationId }});      
            }            
            edgekey[d._source.applicationId+'>'+d._source.toApplicationId] = 1;
          }
        }        
      });              
        nodes.forEach(function(d){    
          if(nodekey[d.data.id]!=0){
            d.data.color = color[3];
          } else {
            d.data.color = color[1];
          }
        });      
        for(key in nodekey) {
          if(nodekey[key] != 0){
            nodes.push({ data : { id : 'p_'+key, name : nodekey[key] ,img : '../assets/sample/back.png' }});      
          }
        }
        for(key in edgekey) {
          var id = key.split('>');    
          edges.push({ data : { count : edgekey[key], source : id[0], target : id[1]} });
        }              
      res.json({rtnCode: rtnCode, nodes : nodes, edges : edges, nodeList : nodeList, nodekey : nodekey});
    });       
    res.json({rtnCode: rtnCode, nodes : nodes, edges : edges, nodeList : nodeList, nodekey : nodekey});
  });
});

router.get('/restapi/getHeapData', function(req, res, next) {  
  logger.debug('dashboard/restapi/getHeapData');   
  if(req.query.type == 'range') {
    var gte = Utils.getDate(req.query.end, fmt2, 0, 0, -parseInt(req.query.gap), 0, 'Y');
    var lte = Utils.getDate(req.query.end, fmt2, 0, 0, parseInt(req.query.gap), 0, 'Y');
  } else if(req.query.type == 'normal') {  
    var lte = Utils.getMs2Date(req.query.date, fmt1, 'N')+startTime;      
    var gte = Utils.getDate(lte, fmt2, -1, 0, 0, 0, 'Y');
  }
  var in_data = { index : indexElagent+'*', type : "AgentStatJvmGc", gte : gte, lte : lte };    
  queryProvider.selectSingleQueryByID2("dashboard","selectByTimestamp", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var heap = [], perm = [];
      out_data.forEach(function(d) {    
        d = d._source;
        heap.push({ "timestamp" : new Date(Utils.getDateUTC2Local(d.timestamp,fmt2)).getTime(), "max" : d.heapMax, "used" : d.heapUsed });      
        perm.push({ "timestamp" : new Date(Utils.getDateUTC2Local(d.timestamp,fmt2)).getTime(), "max" : d.nonHeapMax, "used" : d.nonHeapUsed });      
      });
    }       
    res.json({ rtnCode: rtnCode, heap : heap, perm : perm });
  });
});

router.get('/restapi/getJvmSysData', function(req, res, next) {
  logger.debug('dashboard/restapi/getHeapData');    
  if(req.query.type == 'range') {    
    var gte = Utils.getDate(req.query.end, fmt2, 0, 0, -parseInt(req.query.gap), 0, 'Y');
    var lte = Utils.getDate(req.query.end, fmt2, 0, 0, parseInt(req.query.gap), 0, 'Y');
  } else if(req.query.type == 'normal') {  
    var lte = Utils.getMs2Date(req.query.date, fmt1, 'N')+startTime;      
    var gte = Utils.getDate(lte, fmt2, -1, 0, 0, 0, 'Y');
  }
  var in_data = { index : indexElagent+'*', type : "AgentStatCpuLoad",gte : gte, lte : lte };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByTimestamp", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = []
      out_data.forEach(function(d) {        
        d = d._source;        
        data.push({ "timestamp" : new Date(Utils.getDateUTC2Local(d.timestamp,fmt2)).getTime(), "jvm" : d.jvmCpuLoad*100, "system" : d.systemCpuLoad*100 });
      });
    }
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});


router.get('/restapi/getStatTransaction', function(req, res, next) {
  logger.debug('dashboard/restapi/getStatTransaction');    
  if(req.query.type == 'range') {
    var gte = Utils.getDate(req.query.end, fmt2, 0, 0, -parseInt(req.query.gap), 0, 'Y');
    var lte = Utils.getDate(req.query.end, fmt2, 0, 0, parseInt(req.query.gap), 0, 'Y');
  } else if(req.query.type == 'normal') {  
    var lte = Utils.getMs2Date(req.query.date, fmt1, 'N')+startTime;      
    var gte = Utils.getDate(lte, fmt2, -1, 0, 0, 0, 'Y');
  }
  var in_data = { index : indexElagent+'*', type : "AgentStatTransaction", gte : gte, lte : lte };
  queryProvider.selectSingleQueryByID2("dashboard","selectByTimestamp", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = [];        
      out_data.forEach(function(d) {
        d = d._source;    
        data.push({ "timestamp" :  new Date(Utils.getDateUTC2Local(d.timestamp,fmt2)).getTime(), "S.C" : d.sampledContinuationCount, "S.N" : d.sampledNewCount, "U.C" : d.unsampledContinuationCount, "U.N" : d.unsampledNewCount, "Total" : d.sampledContinuationCount+d.sampledNewCount+d.unsampledContinuationCount+d.unsampledNewCount });
      }); 
    }       
    res.json({rtnCode: rtnCode, rtnData: data });
  });
});

router.get('/restapi/getActiveTrace', function(req, res, next) {
  logger.debug('dashboard/restapi/getActiveTrace');    
  if(req.query.type == 'range') {
    var gte = Utils.getDate(req.query.end, fmt2, 0, 0, -parseInt(req.query.gap), 0, 'Y');
    var lte = Utils.getDate(req.query.end, fmt2, 0, 0, parseInt(req.query.gap), 0, 'Y');
  } else if(req.query.type == 'normal') {  
    var lte = Utils.getMs2Date(req.query.date, fmt1, 'N')+startTime;      
    var gte = Utils.getDate(lte, fmt2, -1, 0, 0, 0, 'Y');
  }
  var in_data = { index : indexElagent+'*', type : "AgentStatActiveTrace", gte : gte, lte : lte };
  queryProvider.selectSingleQueryByID2("dashboard","selectByTimestamp", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {
      var data = [];
      out_data.forEach(function(d) {        
        d = d._source;
        data.push({ "timestamp" : new Date(Utils.getDateUTC2Local(d.timestamp,fmt2)).getTime(), "Fast" : d.activeTraceCounts.FAST, "Normal" : d.activeTraceCounts.NORMAL, "Slow" : d.activeTraceCounts.SLOW, "Very Slow" : d.activeTraceCounts.VERY_SLOW});
      }); 

    }       
    res.json({rtnCode: rtnCode,  rtnData: data });
  });
});


router.get('/restapi/getRestimeCount', function(req, res, next) {
  logger.debug('dashboard/restapi/getRestimeCount');    
  var today = Utils.getToday(fmt1);  
  var in_data = {
    index:  [indexAcc+Utils.getDate(today, fmt4, -1, 0, 0, 0),  indexAcc+Utils.getToday(fmt4)],
    gte : Utils.getDate(today, fmt1, -1, 0, 0, 0)+startTime,
    lte : today+startTime,
    MIN : 400
  };  
  queryProvider.selectSingleQueryByID3("dashboard","getRestimeCount", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data.group_by_timestamp.buckets });
  });
});

// Agent
router.get('/restapi/getAgentMap', function(req, res, next) {
  logger.debug('dashboard/restapi/getAgentMap');    
  if(req.query.gap == 0){
    var day = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N');
    var from = Utils.getDate(day, fmt1, -1, 0, 0, 0);    
    var in_data = {      
      index : indexElagent+'*', type : "ApplicationLinkData", 
      start : from+startTime, end : day+startTime,  id : "startTime"
    };
  } else {       
    var now = Utils.getMs2Date(parseInt(req.query.date),fmt2,'Y');
    var start = Utils.getMs2Date(parseInt(req.query.date)-parseInt(req.query.gap),fmt2,'Y');
    var in_data = { 
      index : indexElagent+'*', type : "ApplicationLinkData",
      start : start,  end : now, id : "startTime" };  
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectByRange", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } 
    var nodes = [], edges = [], nodekey = [], edgekey = [], nodeList = [];
      var color = ["#d5d5d5", "#57a115", "#de9400", "#de3636"];
      out_data.forEach(function(d){    
        if(nodekey[d._source.applicationId]!=null) {       
          if(d._source.isError) {
            nodekey[d._source.toApplicationId]++;
          }
        } else {           
          nodekey[d._source.applicationId] = 0;                            
          nodeList.push({ id : d._source.applicationId, status : 0 });
          nodes.push({ data : { id : d._source.applicationId, name : d._source.applicationId, img : '../assets/sample/server-'+d._source.serviceTypeName+'.png', parent : 'p_'+d._source.applicationId }});      
          if(d._source.isError) {
            nodekey[d._source.toApplicationId]++;
          }
        }
        if(edgekey[d._source.applicationId+'>'+d._source.toApplicationId] != null) {
          edgekey[d._source.applicationId+'>'+d._source.toApplicationId]++
        } else {
          if(nodekey[d._source.toApplicationId] == null){
            nodekey[d._source.toApplicationId] = 0;                            
            nodeList.push({ id : d._source.toApplicationId, status : 0 });
            nodes.push({ data : { id : d._source.toApplicationId, name : d._source.toApplicationId, img : '../assets/sample/server-'+d._source.toServiceTypeName+'.png', parent : 'p_'+d._source.toApplicationId }});      
          }          
          edgekey[d._source.applicationId+'>'+d._source.toApplicationId] = 1;
        }        
      });      
      nodes.forEach(function(d){    
        if(nodekey[d.data.id]!=0){
          d.data.color = color[3];
        } else {
          d.data.color = color[1];
        }
      });      
      for(key in nodekey) {
        if(nodekey[key] != 0){
          nodes.push({ data : { id : 'p_'+key, name : nodekey[key] ,img : '../assets/sample/back.png' }});      
        }
      }
      for(key in edgekey) {
        var id = key.split('>');    
        edges.push({ data : { count : edgekey[key], source : id[0], target : id[1]} });
      }      
    res.json({rtnCode: rtnCode, nodes : nodes, edges : edges, nodeList : nodeList});
  });
});

router.get('/restapi/getAgentData', function(req, res, next) {
  logger.debug('dashboard/restapi/getAgentData');    
  if(req.query.gap == 0){
    var end = Utils.getMs2Date(parseInt(req.query.date), fmt1, 'N')+startTime;
    var start = Utils.getDate(end, fmt1, -1, 0, 0, 0) + startTime;            
  } else if(req.query.gap == 'range') {
    var start = Utils.getDate(req.query.date, fmt2, 0, 0, -parseInt(req.query.range), 0, 'Y');
    var end = Utils.getDate(req.query.date, fmt2, 0, 0, parseInt(req.query.range), 0, 'Y');
  } else {       
    var end = Utils.getMs2Date(parseInt(req.query.date),fmt2,'Y');
    var start = Utils.getMs2Date(parseInt(req.query.date)-parseInt(req.query.gap),fmt2,'Y');    
  };
  var in_data = { 
      index : indexElagent+'*', type : "ApplicationLinkData",
      start : start,  end : end, id : "startTime" };  
  queryProvider.selectSingleQueryByID2("dashboard","selectByRange", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }      
    var data = [], rtnData = [], max = 0;
    var start=new Date().getTime(), end=new Date(1990,0,0,0,0,0).getTime();        
    out_data.forEach(function(d){
      var date = new Date(d._source.startTime).getTime();
      if(date < start){            
        start = date;            
      } else if(date > end){            
        end = date;        
      }             
      if(max < d._source.elapsed){
        max = d._source.elapsed;        
      }
      rtnData.push(d._source);
      data.push({
        x : date,
        y : d._source.elapsed,
        date : new Date(date),
        hour : new Date(date).getHours(),
        type : d._source.isError ? 'Error' : 'Success', 
        term : d._source.isError ? 'Error' : (d._source.elapsed < 1000 ? '1s' : (d._source.elapsed < 3000 ? '3s' : (d._source.elapsed < 5000 ? '5s' : 'Slow'))),
        index : d._source.isError ? 4 : (d._source.elapsed < 1000 ? 0 : (d._source.elapsed < 3000 ? 1 : (d._source.elapsed < 5000 ? 2 : 3)))
      });
    });        
    start -= start%(10*60*1000);
    end += (10*60*1000 - end%(10*60*1000));    
    max = Math.ceil(max/1000)*1000;
    res.json({ rtnCode: rtnCode, rtnData : rtnData, data : data, start : start, end : end, max : max });
  });
});

router.get('/restapi/countAgentDay', function(req, res, next) {
  logger.debug('dashboard/restapi/countAgent');      
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;  
  var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", START : start, END : end  };  
  queryProvider.selectSingleQueryCount("dashboard","countAgent", in_data, function(err, out_data, params) {
    var today = out_data;
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      end = start;
      start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;        
      var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", START : start, END : end  };  
      queryProvider.selectSingleQueryCount("dashboard","countAgent", in_data, function(err, out_data, params) {
        var yday = out_data;
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }    
        res.json({rtnCode: rtnCode, today : today, yday : yday });
      });
    }    
    res.json({rtnCode: rtnCode, today : today, yday : yday });
  });
});

router.get('/restapi/countAgentMon', function(req, res, next) {
  logger.debug('dashboard/restapi/countAgent');      
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -(new Date(parseInt(req.query.date)).getDate()), 0, 0, 0)+startTime;    
  var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", START : start, END : end  };  
  queryProvider.selectSingleQueryCount("dashboard","countAgent", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    var tmon = out_data;
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      end = start;
      start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;  
      var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", START : start, END : end  };  
      queryProvider.selectSingleQueryCount("dashboard","countAgent", in_data, function(err, out_data, params) {
        var ymon = out_data;
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }    
        res.json({rtnCode: rtnCode,tmon : tmon, ymon : ymon });
      });
    }
    res.json({rtnCode: rtnCode, tmon : tmon, ymon : ymon });
  });
});

router.get('/restapi/countAgentError', function(req, res, next) {
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;
  var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", start : start  };  
  queryProvider.selectSingleQueryCount("dashboard","countAgentError", in_data, function(err, out_data, params) {
    var today = out_data;
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } else {
      var in_data = { index : indexElagent+'*', type : "ApplicationLinkData", start : start  };  
      queryProvider.selectSingleQueryCount("dashboard","countAgentError", in_data, function(err, out_data, params) {
        var yday = out_data;        
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        }
        res.json({rtnCode: rtnCode, today : today, yday : yday });
      });
    }
    res.json({rtnCode: rtnCode, today : today, yday : yday });
  });
});


router.get('/restapi/getBottleneckList', function(req, res, next) {
  logger.debug('dashboard/restapi/getBottleneckList');     
  var end = Utils.getMs2Date(parseInt(req.query.date),fmt1,'Y')+startTime;  
  var start = Utils.getDate(end, fmt1, -1, 0, 0, 0)+startTime;       
  var in_data = {
    index : indexAlarm+'*', type : "AgentAlarm",
    start : start,  end : end, 
    list : req.query.list,
    server : req.query.server
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectBottleneckList", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }        
    res.json({rtnCode: rtnCode, rtnData : out_data});
  });
});

router.get('/restapi/getBottleneckDetail', function(req, res, next) {
  logger.debug('dashboard/restapi/getBottleneckDetail');        
  var in_data = {
    index : indexAlarm+'*',    type : "AgentAlarm",
    value : req.query.value,    id : req.query.id,    
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectById", in_data, function(err, out_data, params) {    
    var alarm = out_data[0]._source;      
    alarm.startLocal = Utils.getDateUTC2Local(alarm.startTimestamp, fmt2);
    alarm.timestampLocal = Utils.getDateUTC2Local(alarm.timestamp, fmt2);
    var rtnCode = CONSTS.getErrData('0000');        
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    } else {      
      var in_data = {
        index : "elagent_"+alarm.agentId+"-"+Utils.getDate(alarm.timestamp, fmt4), type : "AgentLifeCycle",
        value : alarm.timestamp, id : "eventTimestamp" };        
      queryProvider.selectSingleQueryByID2("dashboard","selectMatchRecent", in_data, function(err, out_data, params) {            
        var rtnCode = CONSTS.getErrData('0000');    
        if (out_data == null){
          rtnCode = CONSTS.getErrData('0001');  
          var life = [];
        } else { 
          var life = out_data;
        var in_data = {
          index : "elagent_"+alarm.agentId+"-*",    type : "AgentInfo",
          value :  alarm.startTimestamp,    id : "startTime"            
        };                  
        queryProvider.selectSingleQueryByID2("dashboard","selectMatchIdValue", in_data, function(err, out_data, params) {              
          var rtnCode = CONSTS.getErrData('0000');    
          if (out_data == null){
            rtnCode = CONSTS.getErrData('0001');  
            var info = [];
          } else if(out_data.length == 0) {
            rtnCode = CONSTS.getErrData('0001');      
            var info = [];
          } else {
            var info = out_data[0]._source;
          }                  
          res.json({rtnCode: rtnCode, alarm: alarm, life: life, info : info});    
        });       
        }
        res.json({rtnCode: rtnCode, alarm: alarm, life: life, info : info});    
      });
    }            
    res.json({rtnCode: rtnCode, alarm: alarm, life: life, info : info});    
  });
});


// ###########################################################


module.exports = router;