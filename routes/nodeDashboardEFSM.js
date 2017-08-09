var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
require('date-utils');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'open selected', timeseries:'', reports:'', analysis:'', management:'', settings:''};

var indexAcc = global.config.es_index.es_jira;

router.get('/', function(req, res, next) {
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/main', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc }); 
});

router.get('/timeseries', function(req, res, next) {
  // console.log(_rawDataByDay);
  mainmenu.dashboard = '';
  mainmenu.timeseries = ' open selected';
  res.render('./dashboard/timeseries'+global.config.pcode, { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/inspector', function(req, res, next) {
  mainmenu.dashboard = ' open selected';  
  res.render('./dashboard/inspector', { title: global.config.productname, mainmenu:mainmenu, indexs: indexAcc });
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
      console.log(out_data[0]);
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
      console.log('dashboard/restapi/getDashboardRawData -> length : %s', out_data.length);
      res.json({rtnCode: rtnCode, rtnData: out_data});
    });
  } else {  // false 인 경우는 현재일자부터 7일전 리스트를 조회.
    var d = new Date();
    var to_date = d.toFormat('YYYY-MM-DD');
    getTbRawDataByPeriod(d.removeDays(7).toFormat('YYYY-MM-DD'), to_date, res);
  }
});

router.get('/restapi/selectJiraAccId', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccReqDash');
  var date = new Date().toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: indexAcc+date[3]+"."+mon[date[1]]+"."+date[2]
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccId", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
     }
     var node={}, nodes = [], line = {}, lines = [], req={},  last = {}, lineNode = {}, id={};
     var colors=['#FF0000', '#FF5E00', '#FFBB00', '#FFE400', '#ABF200', '#1DDB16', '#00D8FF', '#0054FF', '#0100FF', '#5F00FF',
                        '#FF00DD', '#FF007F', '#FFA7A7', '#FFE08C', '#CEF279', '#B2EBF4', '#B5B2FF', '#FFB2F5', '#CC723D', '#008299'];  
     var reqCnt = 0, nodeCnt = 0, lineCnt = 0, lineNodeCnt = 0, idCnt = 0;        
     var nodeNo = 0;
     var nodeList = [];
     out_data.forEach(function(d) {        
        var a = d._source.request.split('?');                     
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
          node[nodeId] ={ name : a[0], id : nodeId, no : nodeNo++ };          
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
                lines[lineCnt++] = {  source:  source , target: target, value : 0.0001, cnt :  1 };                
              } else {                            
                lines[line[source+'-'+target].no].value += 0.0001;
                lines[line[source+'-'+target].no].cnt++;
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
       });
     var json = {"nodes" :nodes, "links" : lines };
     var text = JSON.stringify(json);    
    res.json({rtnCode: rtnCode, rtnData: json, id : id});
  });
});

router.get('/restapi/selectJiraAccJson', function(req, res, next) {
  console.log('dashboard/restapi/selectJiraAccJson');
  var date = new Date().toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: indexAcc+date[3]+"."+mon[date[1]]+"."+date[2]    
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccReq", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
     }
     var node={}, nodes = [], line = {}, lines = [], req={},  last = {}, lineNode = {}, id= {};
      var colors=['#61DBF0', '#f5662b', '#FAED7D', '#367d85', '#AB6CFF', '#97ba4c', '#3f3e47', '#9f9fa3', '#1F50B5', '#FFBB00'];
     var reqCnt = 0, nodeCnt = 0, lineCnt = 0, lineNodeCnt = 0, idCnt = 0;        
     var nodeNo = 0;
     var nodeList = [];
     out_data.forEach(function(d) {        
        var a = d._source.request.split('?');                     
        
        if(req[a[0]] == null) {          
          req[a[0]] = { no : reqCnt++, cnt : 1};
        } else {
          req[a[0]].cnt++;        
        }

        if(id[d._source.auth] == null) {
          id[d._source.auth] = colors[idCnt++%10];                   
        }
        var nodeId = d._source.auth+'_'+req[a[0]].no;       
        
        if(node[nodeId] ==null){
          nodeList[nodeNo] = nodeId;
          node[nodeId] ={ name : a[0], id : nodeId, no : nodeNo++ };          
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
                lines[lineCnt++] = {  source:  source , target: target, value : 0.0001 };                
              } else {                            
                lines[line[source+'-'+target].no].value += 0.0001;
              }
            } else {                   
              lines[line[node[to].no+'-'+node[from].no].no].value += 0.0001;
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
       });
     var json = {"nodes" :nodes, "links" : lines };
     var text = JSON.stringify(json);    
    res.json({rtnCode: rtnCode, rtnData: json, color : id});
  });
});

router.get('/restapi/selectJiraAccScatter', function(req, res, next) {
  console.log('dashboard/restapi/selectJiraAccScatter');
  console.log(req.query.start, req.query.end);
  var date = new Date().toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: indexAcc+date[3]+"."+mon[date[1]]+"."+date[2]    
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccScatter", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/selectJiraAccDash', function(req, res, next) {
  console.log('dashboard/restapi/selectJiraAccDash');
  var date = new Date().toString().split(' ');
  
  var in_data = {
    index : req.query.index
  };  
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccDash", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});


router.get('/scatter_detail', function(req, res, next) {
  var s = new Date(parseInt(req.query.start)).toString().split(' ');
  var e = new Date(parseInt(req.query.end)).toString().split(' ');
  var start = s[3]+'/'+s[1]+'/'+s[2]+':'+s[4]+' +0000';
  var end = e[3]+'/'+e[1]+'/'+e[2]+':'+e[4]+' +0000';  
  var date = new Date(parseInt(req.query.start)).toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: indexAcc+date[3]+"."+mon[date[1]]+"."+date[2]   ,
    START : start,
    END : end,
    MIN : parseInt(req.query.min),
    MAX : parseInt(req.query.max)  
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectScatterSection", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } 
    var data = [];
    var cnt = 0;
    out_data.forEach(function(d) {
      var r = d._source.request.split('?');      
      d._source.request = r[0];
      var p = d._source.request.split('.');      
      if(p[p.length-1]!='css'&&p[p.length-1]!='js'&&p[p.length-1]!='png'&&p[p.length-1]!='gif'&&p[p.length-1]!='svg'){    
        d._source.no = ++cnt;
        var a = d._source.timestamp.split(':');
        var b = a[0].split('/');
        var c = a[3].split(' ');
        var mon = {'Jan' : 1, 'Feb' : 2, 'Mar' : 3, 'Apr' : 4, 'May' : 5, 'Jun' : 6, 'Jul' : 7, 'Aug' : 8, 'Sep' : 9, 'Oct' : 10, 'Nov' : 11, 'Dec' : 12 };
        //d._source.timestamp = new Date(b[2], mon[b[1]]-1, b[0], a[1], a[2], c[0]);
        d._source.timestamp = b[1]+'-'+b[0]+' '+a[1]+':'+a[2]+':'+c[0];        
        data.push(d._source);
      }
    });       
    res.render('./dashboard/scatter_detail', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list: data });
  });  
});

router.get('/selected_detail', function(req, res, next) {  
  var in_data = {
    index : "transactionlist-2017-06"    
  };
  queryProvider.selectSingleQueryByID2("dashboard","getTransaction", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    console.log(out_data);    
    var data = [], detail = [];
    out_data.forEach(function(d){
      if(d._type == 'transactionList') {
        data.push(d._source);  
      } else {
        detail.push(d._source);
      }      
    });
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }  
    res.render('./dashboard/scatter_detail', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list : data, detail : detail });
  });  
});

router.get('/restapi/selectScatterSection', function(req, res, next) {
  console.log('dashboard/restapi/selectScatterSection');  
  var s = new Date(parseInt(req.query.start)).toString().split(' ');
  var e = new Date(parseInt(req.query.end)).toString().split(' ');
  var start = s[3]+'/'+s[1]+'/'+s[2]+':'+s[4]+' +0000';
  var end = e[3]+'/'+e[1]+'/'+e[2]+':'+e[4]+' +0000';  
  var date = new Date().toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: indexAcc+date[3]+"."+mon[date[1]]+"."+date[2] ,
    START : start,
    END : end,
    MIN : parseInt(req.query.min),
    MAX : parseInt(req.query.max)  
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectScatterSection", in_data, function(err, out_data, params) {
     console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/countAccJira', function(req, res, next) {
  console.log('dashboard/restapi/countAccJira');      
  console.log(req.query.index);
  var in_data = {    index : req.query.index    };
  console.log(in_data);
  queryProvider.selectSingleQueryCount("dashboard","countAccJira", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/countAccJiraError', function(req, res, next) {
  console.log('dashboard/restapi/countAccJiraError');      
  console.log(req.query.index);
  var in_data = {    index : req.query.index    };
  console.log(in_data);
  queryProvider.selectSingleQueryCount("dashboard","countAccJiraError", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }    
    console.log(out_data);  
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getJiraAccOneWeek', function(req, res, next) {
  console.log('dashboard/restapi/getJiraAccOneWeek');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var week = [];
  for(var i=0; i<7; i++)  {
    var time = new Date().getTime() - i*24*60*60*1000;
    var date = new Date(time).toString().split(' ');  
    week[i] = indexAcc+date[3]+"."+mon[date[1]]+"."+date[2];
  }  
  var in_data = {
    index: week
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectJiraAccOneWeek", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } 
    var data = [];
    out_data.forEach(function(d) {              
      d._source.response = parseInt(d._source.response);
      if(d._source.response >= 400 && d._source.response < 500) {
        d._source.event_type = 1;
      } else {
        d._source.event_type = 0;
      }
      if(d._source.timestamp != null)
        data.push(d._source);
    });       
    res.json({rtnCode: rtnCode, rtnData: data });
  });  
});

router.get('/restapi/getTransactionDetail', function(req, res, next) {
  console.log('dashboard/restapi/getTransactionDetail');  
  
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    index : req.query.index ,
    id : req.query.id
  };
  queryProvider.selectSingleQueryByID2("dashboard","getTransactionDetail", in_data, function(err, out_data, params) {
     console.log(out_data);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getTransaction', function(req, res, next) {
  console.log('dashboard/restapi/getTransaction');  
  
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    index : 'transactionlist-2017-06',
    id : req.query.id
  };
  queryProvider.selectSingleQueryByID2("dashboard","getTransactionList", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getAccTimeseries', function(req, res, next) {
  console.log('dashboard/restapi/getAccTimeseries');        
  var in_data = {
    index : req.query.index,
    gte : req.query.gte,
    lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID2("dashboard","getAccTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');  
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getProcessTimeseries', function(req, res, next) {
  console.log('dashboard/restapi/getProcessTimeseries');    
  var in_data = {
    index : req.query.index,
    gte : req.query.gte,
    lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID2("dashboard","getProcessTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];   
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getTopTimeseries', function(req, res, next) {
  console.log('dashboard/restapi/getTopTimeseries');    
  var in_data = {
    index : req.query.index,
    gte : req.query.gte,
    lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID2("dashboard","getTopTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];   
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getTotalTimeseries', function(req, res, next) {
  console.log('dashboard/restapi/getTotalTimeseries');    
  var in_data = {
    index : req.query.index,
    gte : req.query.gte,
    lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID2("dashboard","getTotalTimeseries", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');
    var data = [];   
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

router.get('/restapi/getRestimeCount', function(req, res, next) {
  console.log('dashboard/restapi/getRestimeCount');    
  var in_data = {
    index : req.query.index,
    gte : req.query.gte,
    lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID3("dashboard","getRestimeCount", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    console.log(out_data)  ;
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data.group_by_timestamp.buckets });
  });
});

router.get('/restapi/getAppmapdata', function(req, res, next) {
  console.log('dashboard/restapi/getAppmapdata');    
  var in_data = {
    index : 'applicationmapdata-2017-08',
    //gte : req.query.gte,
    //lte : req.query.lte
  };
  queryProvider.selectSingleQueryByID2("dashboard","selectAppmapdata", in_data, function(err, out_data, params) {    
    var rtnCode = CONSTS.getErrData('0000');    
    console.log(out_data)  ;
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');      
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});


// ###########################################################


module.exports = router;