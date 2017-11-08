function getAgentData(day){
  var data = { date : day.getTime(), gap : 0 }
  drawDashAgent(data);
}

function drawDashAgent(data){
  var server = $("#server").val();  
  if(server != 'all') {
     $.ajax({
      url: "/dashboard/restapi/getAgentMap" ,
      dataType: "json",
      type: "get",
      data: data,
      success: function(result) {            
        if (result.rtnCode.code == "0000") {              
          var elseJson = { nodes : result.nodes, edges : result.edges };              
          getServerMap(elseJson);    
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
  $.ajax({
    url: "/dashboard/restapi/getAgentData" ,
    dataType: "json",
    type: "get",
    data: data,
    success: function(result) {            
      if (result.rtnCode.code == "0000") {                              
        summaryAgent(result.data, result.start, result.end);
        drawAgentScattor(result.data, result.start, result.end, result.max);
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

function summaryAgent(data, start, end) {    
  var chart = dc.barChart("#test");
  var load = dc.barChart("#load");
 
  var timeformat = d3.time.format('%m-%d %H:%M');
  
  if((end-start)<60*60*1000){
    start -= 30*60*1000;
    end += 30*60*1000;
  }
  
  var minDate = new Date(start); 
  var maxDate = new Date(end);
  console.log(minDate, maxDate);  
  var gap = (end-start)/(24 * 60 * 60 * 1000);

  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var termDim = nyx.dimension(function(d) {      
    return d.term; 
  });

  var BarGroup = termDim.group().reduceCount(function(d) {
    return 1;
  });

  var hourDim = nyx.dimension(function(d) {    
    return d.hour;
  });
  var stackGroup = hourDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;    
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {
    return{};
  });
  
  var term = ['1s', '3s', '5s', 'Slow', 'Error'];
  chart
    .width(window.innerWidth*0.14)
    .height(320)    
    .margins({left: 40, top: 5, right: 10, bottom: 40})
    .brushOn(false)    
    .dimension(termDim)
    .group(BarGroup)
    .elasticY(true)
    .brushOn(true)    
    .x(d3.scale.ordinal().domain(term))
    .xUnits(dc.units.ordinal)    
    .renderLabel(true)
    .on('renderlet', function(chart) {
        chart.selectAll('rect').on("click", function(d) {
            console.log("click!", d);
        });
    });
     
  load
    .width(window.innerWidth*0.28)
    .height(310)
    .margins({left: 80, top: 10, right: 10, bottom: 40})
    .brushOn(false)
    .transitionDuration(500)
    .clipPadding(10)
    .title(function(d) {
      for(var i=0; i<term.length; i++) {
        if(this.layer == term[i])                   
          return this.layer + ' : ' + d.value[i];
      }
    })      
    .dimension(hourDim)
    .group(stackGroup, term[0], sel_stack('0'))
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)
    .x(d3.scale.linear().domain([0, 23]))    
    .round(d3.time.hour.round)
    .xUnits(function(){return 24;})
    .elasticY(true)
    .centerBar(false) 
    .colors(d3.scale.ordinal().range(["#57a115", "#0ecdb0", "#0e99cd", "#de9400", "#de3636"]));
  load.legend(dc.legend());
  dc.override(load, 'legendables', function() {
    var items = load._legendables();
    return items.reverse();
  });
  for(var i = 1; i<term.length; ++i){
    load.stack(stackGroup, term[i], sel_stack(i));
  }  
  /*  dc.barChart('#eventBar')  */
  function sel_stack(i) {
    return function(d) {            
      return d.value[i]?d.value[i]:0;
    };
  }
  dc.renderAll();
}

function displayCountAgent() {      
  var day = new Date().getTime();
  $.ajax({
    url: "/dashboard/restapi/countAgentDay",
    dataType: "json",
    type: "GET",    
    data: { date : day, gap : 'day' },
    success: function(result) {
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        console.log(result)
         $('#dayCnt').text(result.today);               
         setStatus($('#dayCnt_status'), result.today/result.yday*100, 'day', result.yday); 
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
    url: "/dashboard/restapi/countAgentMon",
    dataType: "json",
    type: "GET",    
    data: { date : day, gap : 'mon' },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        console.log(result)
        $('#monCnt').text(result.tmon);        
        setStatus($('#monCnt_status'), result.tmon/result.ymon*100, 'day', result.ymon); 
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
    url: "/dashboard/restapi/countAgentError",
    dataType: "json",
    type: "GET",    
    data: { date : day },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
         console.log(result)
         $('#errCnt').text(result.today);                       
         setStatus($('#errCnt_status'), result.today/result.yday*100, 'day', result.yday); 
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
    url: "/dashboard/restapi/getAgentOneWeek",
    dataType: "json",
    type: "GET",    
    data: {},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        console.log(result);
        drawAgentWeekly(result.rtnData);
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

function drawAgentWeekly(data) {  
  var markerName = "dashboardChart";
  var volumeChart = dc.barChart('#volumn-chart', markerName);

  var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
  var df = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');
  var numberFormat = d3.format('.2f');
  var maxDate = new Date();
  var minDate  = addDays(new Date(), -20);

  // for Test
  maxDate = new Date(new Date().getTime());
  minDate = new Date(new Date().getTime()-7*24*60*60*1000-12*60*60*1000);
  
  // console.log(data);
  var ndx = crossfilter(data);

  var moveDays = ndx.dimension(function (d) {    
    return d3.time.day(new Date(d.day));
  });

  var stackGroup = moveDays.group().reduce(function(p, v){
    p[v.event_type] = (p[v.event_type] || 0) + 1;    
    return p;
  }, function(p, v) {
    p[v.event_type] = (p[v.event_type] || 0) - 1;
    return p;
  }, function() {
    return{};
  });
  
    // console.log(ampereGroup);
  function sel_stack(i) {
      return function(d) {            
          return d.value[i]?d.value[i]:0;
      };
  }
   
/*  dc.barChart('#eventBar')  */
var type = ['success', 'error'];
    volumeChart
      // .width(600)
      .height(77)
      .margins({top: 0, right: 50, bottom: 20, left: 60})
      .dimension(moveDays)
      .group(stackGroup, type[0], sel_stack('0'))
      .centerBar(true)
      .brushOn(false)      
      .x(d3.time.scale().domain([minDate, maxDate]))            
      //.yAxisPadding()
      .elasticY(true)
      .round(d3.time.day.round)
      .alwaysUseRounding(true)
      .xUnits(function(){return 8;})      
      .title(function(d) {
       for(var i=0; i<type.length; i++) {
        if(this.layer == type[i])                   
          return this.layer + ' : ' + d.value[i];
          }
       })
       .colors(d3.scale.ordinal().range(["#EDC951",  "#CC333F"]));
    for(var i = 1; i<type.length; ++i){
      volumeChart.stack(stackGroup, type[i], sel_stack(i));
    }  

    volumeChart.on("renderlet.somename", function(chart) {
      chart.selectAll('rect').on("click", function(d) {
        d3.select("#test").select("svg").remove();
        d3.select("#load").select("svg").remove();        
        //d3.select("#cy").select("svg").remove();
        /*document.createElement('chart1');*/        
        getAgentData(d.x);        
      });  
    });    
    dc.renderAll(markerName); 
}


function drawAgentScattor(data, start, end, max){  
  console.log(data, start, end);
  if(Modernizr.canvas){
    doBigScatterChart(start, end);
  }
  var oScatterChart;
  function doBigScatterChart(start, end){
    oScatterChart = new BigScatterChart({
      sContainerId : 'chart1',
      nWidth : window.innerWidth*0.42,
      nHeight : 280,
      nXMin: start, nXMax: end,
      nYMin: 0, nYMax: max,
      nZMin: 0, nZMax: 5,
      nBubbleSize: 3,
      nXSteps: 6,
      nYSteps: 5,
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
      },      nPaddingRight : 5,

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