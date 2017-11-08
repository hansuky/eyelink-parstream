var stamp = "";

function getData(server, selected){
  var date = $("#date").val();    
  var list = selected['CPU']+selected['MEMORY']+selected['SERVICE'];
  console.log(list);  
  $.ajax({
    url: "/dashboard/restapi/getBottleneckList" ,
    dataType: "json",
    type: "get",
    data: {
      date : new Date(date).getTime(),
      server : server, list : list
    },
    success: function(result) {
      if (result.rtnCode.code == "0000") {              
        drawBottleneckList(result.rtnData);        
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });  
}

function drawBottleneckList(data){
  $('#list').empty();  
  var sb = new StringBuffer();    
  sb.append('<table class="sample_2 table table-striped table-bordered table-hover"><tr>'); 
  if(data.length != 0){
    sb.append('<th>Timestamp</th><th>AlarmType</th></tr>');
    data.forEach(function(d){
      var day = new Date(new Date(d._source.timestamp).getTime()+9*60*60*1000);
      var date = day.getFullYear()+'-'+pad(day.getMonth()+1,2)+'-'+pad(day.getDate(),2)+' '+pad(day.getHours(),2)+':'+pad(day.getMinutes(),2)+':'+day.getSeconds()+'.'+pad(day.getMilliseconds(),3);
      sb.append('<tr onclick="javascript:clickTrEvent('+"'"+d._id+"'"+')"><td>'+date+'</td><td>'+d._source.alarmType+'</td></tr>');
    });
    sb.append('</table>');
  }else{
    sb.append('<td>데이터가 없습니다.</td></tr></table>');
  }  
  $('#list').append(sb.toString());    
}

function clickTrEvent(id){
  console.log(id);
  $.ajax({
    url: "/dashboard/restapi/getBottleneckDetail" ,
    dataType: "json",
    type: "get",
    data: { id : "_id", value : id },
    success: function(result) {
      if (result.rtnCode.code == "0000") {                 
        drawDetail(result);        
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
}

function drawDetail(result){  
  $('#detail').empty();  
  var sb = new StringBuffer();    
  sb.append('<table class="table table-striped table-bordered table-hover">'); 
  var alarm = result.alarm, life = result.life, info = result.info;
  stamp = alarm.timestamp;
  if(alarm.length != 0){    
    var agentId = alarm.agentId, apptype = alarm.applicationType, alarmType = alarm.alarmType, 
      message = alarm.message;
    var state = '', hostname = '', appName = '', ip = '', agentVersion = '', endStatus = '', pid = '',
      jvmVersion = '', gcTypeName = '';
    if(life.length != 0){
      state = life[0]._source.state;
    }  
    if(info.length != 0){
      hostname = info.hostName, appName = info.applicationName, ip = info.ip, agentVersion = info.agentVersion
      endStatus = info.endStatus, pid = info.pid, jvmVersion = info.jvmInfo.jvmVersion, gcTypeName = info.jvmInfo.gcTypeName;
    } 
    sb.append('<tr><td><strong>AgentId</strong></td><td>'+agentId+'</td><td><strong>State</strong></td><td>'+state+'</td><td><strong>AgentVersion</strong></td><td>'+agentVersion+'</td></tr>');    
    sb.append('<tr><td><strong>AppName</strong></td><td>'+appName+'</td><td><strong>Apptype</strong></td><td>'+apptype+'</td><td><strong/>StartTime<strong></td><td>'+alarm.startLocal+'</td></tr>');    
    sb.append('<tr><td><strong>HostName</strong></td><td colspan="3">'+hostname+'</td><td><strong>EventTime</strong></td><td>'+alarm.timestampLocal+'</td></tr>');    
    sb.append('<tr><td><strong>Ip</strong></td><td colspan="3">'+ip+'</td><td><strong>EndStatus</strong></td><td>'+endStatus+'</td></tr>');                
    sb.append('<tr><td><strong>Pid</strong></td><td>'+pid+'</td><td><strong>JvmVersion</strong></td><td>'+jvmVersion+'</td><td><strong>GcTypeName</strong></td><td>'+gcTypeName+'</td></tr>');    
    sb.append('<tr><td><strong>AlarmType</strong></td><td>'+alarmType+'</td><td><strong>Message</strong></td><td colspan="3">'+message+'</td></tr>');                
  }else{
    sb.append('<tr><td>데이터가 없습니다.</td></tr>');
  }
  sb.append('</table>');    
  $('#detail').append(sb.toString());    
}

function pad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function getChartData(range){  
  d3.selectAll("svg").remove();   
  $.ajax({
    url: "/dashboard/restapi/getHeapData" ,
    dataType: "json",
    type: "get",
    data: { gap : range, end : stamp, type : 'range' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {                
        drawHeap(result.heap);
        drawPermgen(result.perm);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
 $.ajax({
    url: "/dashboard/restapi/getJvmSysData" ,
    dataType: "json",
    type: "get",
    data: { gap : range , end : stamp, type : 'range' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        drawJvmSys(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
  $.ajax({
    url: "/dashboard/restapi/getAgentData" ,
    dataType: "json",
    type: "get",
    data: { date : stamp, gap : 'range', range : range },
    success: function(result) {            
      if (result.rtnCode.code == "0000") {                              
        summaryAgent(result.data, result.start, result.end);
        drawAgentScattor(result.data, result.start, result.end);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });}

function drawHeap(data) {  
  var chartName = '#ts-chart01';
  chart01 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'max'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'used'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart01(chartName);
}

function drawPermgen(data) {  
  var chartName = '#ts-chart02';  
  chart02 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'max'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'used'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart02(chartName);
}

function drawJvmSys(data) {  
  var chartName = '#ts-chart03';
  chart03 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'jvm'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'system'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart03(chartName);
}

function drawAgentScattor(data, start, end){  
  if(Modernizr.canvas){
    doBigScatterChart(start, end);
  }
  var oScatterChart;
  function doBigScatterChart(start, end){
    oScatterChart = new BigScatterChart({
      sContainerId : 'chart1',
      nWidth : window.innerWidth*0.32,
      nHeight : 280,
      nXMin: start, nXMax: end,
      nYMin: 0, nYMax: 10000,
      nZMin: 0, nZMax: 5,
      nBubbleSize: 3,
      nPaddingTop : 50,
      nDefaultRadius : 3,
      htTypeAndColor : {
        'Success' : '#0100FF',        
        'Error' : '#FF0000'        
      },
      sXLabel : '(time)',
        sYLabel : '(ms)',
      htGuideLine : {
        'nLineWidth' : 1,
        'aLineDash' : [2, 7],
        'nGlobalAlpha' : 0.2
      },
      sXLabel : '',
      'fXAxisFormat' : function(nXStep, i){        
        var nMilliseconds = (nXStep * i + this._nXMin),
          sDay = new Date(nMilliseconds).toString().split(' '),
          sDate = sDay[4].split(':');
          
        return sDate[0]+':'+sDate[1]; 
      },
      nPaddingRight : 5,
      fOnSelect : function(htPosition, htXY){        
        var aData = this.getDataByXY(htXY.nXFrom, htXY.nXTo, htXY.nYFrom, htXY.nYTo);
        console.log(new Date(parseInt(htXY.nXFrom)), new Date(parseInt(htXY.nXTo)));        
        var link = '/dashboard/selected_detail_agent?start='+htXY.nXFrom+'&end='+htXY.nXTo+'&min='+htXY.nYFrom+'&max='+htXY.nYTo;        
        window.open(link, "EyeLink Service List", "menubar=1,status=no,scrollbars=1,resizable=1 ,width=1200,height=640,top=50,left=50");        
      }
    }); 
      if(cnt != 0){         
        oScatterChart._empty();
        oScatterChart._redraw();      
        //summaryAgent(data, start, end);
      }
      oScatterChart.addBubbleAndDraw(data);         
  }   
   if(cnt++ == 0) {
    //summaryAgent(data, start, end);
   }  
};
var cnt = 0;
function clear(cvsId) {
    //var canvas = document.getElementById("canvas");       
    var canvas = document.getElementsByClassName("bigscatterchart-Success");    
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);      
}

function summaryAgent(data, start, end) {    
  var chart = dc.barChart("#test");
    
  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var termDim = nyx.dimension(function(d) {      
    return d.term; 
  });

  var BarGroup = termDim.group().reduceCount(function(d) {
    return 1;
  });

  var term = ['1s', '3s', '5s', 'Slow', 'Error'];
  chart
    .width(window.innerWidth*0.20)
    .height(320)    
    .margins({left: 40, top: 5, right: 10, bottom: 40})
    .brushOn(false)    
    .dimension(termDim)
    .group(BarGroup)
    .elasticY(true)
    .brushOn(true)    
    .x(d3.scale.ordinal().domain(term))
    .xUnits(dc.units.ordinal)    
    .renderLabel(true);
     
 dc.renderAll();
}