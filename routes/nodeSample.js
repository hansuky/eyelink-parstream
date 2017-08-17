 var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

var mainmenu = {dashboard:'', timeseries:'', reports:'', analysis:'', management:'', settings:'', sample:'open selected'};

var indexAcc = global.config.es_index.es_jira;


/* GET reports page. */
router.get('/', function(req, res, next) {
  res.render('./sample/serverMap', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu });
});

router.get('/samplePage', function(req, res, next) {
  res.render('./sample/samplePage', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu });
});

router.get('/sampleES', function(req, res, next) {
  res.render('./sample/sampleES', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu });
});

router.get('/sampleES_detail', function(req, res, next) {
  var s = new Date(parseInt(req.query.start)).toString().split(' ');
  var e = new Date(parseInt(req.query.end)).toString().split(' ');
  var start = s[3]+'/'+s[1]+'/'+s[2]+':'+s[4]+' +0000';
  var end = e[3]+'/'+e[1]+'/'+e[2]+':'+e[4]+' +0000';  
  var in_data = {
    START : start,
    END : end,
    MIN : parseInt(req.query.min),
    MAX : parseInt(req.query.max)  
  };
  queryProvider.selectSingleQueryByID2("sample","selectScatterSection", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    } 
    var data = [];
    var cnt = 0;
    out_data.forEach(function(d) {
      d._source.no = ++cnt;
      var a = d._source.timestamp.split(':');
      var b = a[0].split('/');
      var c = a[3].split(' ');
      var mon = {'Jan' : 1, 'Feb' : 2, 'Mar' : 3, 'Apr' : 4, 'May' : 5, 'Jun' : 6, 'Jul' : 7, 'Aug' : 8, 'Sep' : 9, 'Oct' : 10, 'Nov' : 11, 'Dec' : 12 };
      //d._source.timestamp = new Date(b[2], mon[b[1]]-1, b[0], a[1], a[2], c[0]);
      d._source.timestamp = b[1]+'-'+b[0]+' '+a[1]+':'+a[2]+':'+c[0];
      var r = d._source.request.split('?');      
      d._source.request = r[0];
      data.push(d._source);
    });       
    res.render('./sample/sampleES_detail', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, list: data });
  });  
});

router.get('/serverMap', function(req, res, next) {
  res.render('./sample/serverMap', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/serverMap1', function(req, res, next) {
  res.render('./sample/serverMap1', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/serverMap2', function(req, res, next) {
  res.render('./sample/serverMap2', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/scatter01', function(req, res, next) {
  res.render('./sample/scatter01', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/scatter02', function(req, res, next) {
  res.render('./sample/scatter02', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/scatter03', function(req, res, next) {
  res.render('./sample/scatter03', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/scatterTest01', function(req, res, next) {
  res.render('./sample/scatterTest01', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/summary', function(req, res, next) {
  res.render('./sample/summary', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/sankey', function(req, res, next) {
  res.render('./sample/sankey', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/sankey01', function(req, res, next) {
  res.render('./sample/sankey01', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu, indexs: indexAcc });
});

router.get('/sankey02', function(req, res, next) {
  res.render('./sample/sankey02', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu });
});

router.get('/sankey03', function(req, res, next) {
  res.render('./sample/sankey03', { title: 'EyeLink for Service Monitoring', mainmenu:mainmenu });
});

// query Report
router.get('/restapi/selectJiraAccess', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccess');
  var in_data = {};
  queryProvider.selectSingleQueryByID2("sample","selectJiraAccess", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data});
  });
});

// query Report
router.get('/restapi/selectJiraAccReq', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccReq');
  var in_data = {};
  queryProvider.selectSingleQueryByID2("sample","selectJiraAccReq", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data});
  });
});

router.get('/restapi/selectJiraAccJson', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccJson');
  var in_data = {   index : req.query.index };
  queryProvider.selectSingleQueryByID2("sample","selectJiraAccReq", in_data, function(err, out_data, params) {
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

router.get('/restapi/selectJiraAccId', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccId');
 var in_data = {   index : req.query.index };
  queryProvider.selectSingleQueryByID2("sample","selectJiraAccReq", in_data, function(err, out_data, params) {
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

// query Report
router.get('/restapi/selectJiraAccScatter', function(req, res, next) {
  console.log('sample/restapi/selectJiraAccScatter');
  var in_data = {};
  queryProvider.selectSingleQueryByID2("sample","selectJiraAccScatter", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

// query Report
router.get('/restapi/selectScatterSection', function(req, res, next) {
  console.log('sample/restapi/selectScatterSection');  
  var s = new Date(parseInt(req.query.start)).toString().split(' ');
  var e = new Date(parseInt(req.query.end)).toString().split(' ');
  var start = s[3]+'/'+s[1]+'/'+s[2]+':'+s[4]+' +0000';
  var end = e[3]+'/'+e[1]+'/'+e[2]+':'+e[4]+' +0000';  
  var in_data = {
    START : start,
    END : end,
    MIN : parseInt(req.query.min),
    MAX : parseInt(req.query.max)  
  };
  queryProvider.selectSingleQueryByID2("sample","selectScatterSection", in_data, function(err, out_data, params) {
    // console.log(out_datsa);
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data == null) {
      rtnCode = CONSTS.getErrData('0001');
    }    
    res.json({rtnCode: rtnCode, rtnData: out_data });
  });
});

  
module.exports = router;