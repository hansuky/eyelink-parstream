var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
require('date-utils');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'open selected', timeseries:'', reports:'', analysis:'', management:'', settings:''};

router.get('/', function(req, res, next) {
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/main', { title: global.config.productname, mainmenu:mainmenu});
});

router.get('/trenddata', function(req, res, next) {
  mainmenu.dashboard = ' open selected';
  mainmenu.timeseries = '';
  res.render('./dashboard/trenddata', { title: global.config.productname, mainmenu:mainmenu});
});

// query RawData
router.get('/restapi/getDashboardRawData', function(req, res, next) {
  // load data on startup이 true일 경우
  if (global.config.loaddataonstartup.active) {
    var in_data = {MERGE:'Y'};
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
  var in_data = {};
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
  console.log(date);
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  var in_data = {
    today: date[3]+'-'+mon[date[1]]+'-'+date[2]
  };
  console.log(in_data);  
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

// ###########################################################


module.exports = router;