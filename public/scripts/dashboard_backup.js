var nodeList = [];
$(function(){ // on dom ready  
  getDash(new Date);  
  displayCount();
  drawChart();      
   $.ajax({
    url: "/dashboard/restapi/getAppmapdata" ,
    dataType: "json",
    type: "get",
    data: {},
    success: function(result) {      
      if (result.rtnCode.code == "0000") {          
        var elseJson = { nodes : result.nodes, edges : result.edges };      
        getServerMap(elseJson);             
        nodeLIst = result.nodeList;
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
}); // on dom ready

function getServerMap(elesJson) {    
  var cy = cytoscape({
    container: document.getElementById('cy'),
     style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'width': '90px',
          'height': '90px',
          'content': 'data(name)',
          'background-fit': 'cover',
           'border-color': 'data(color)',
          'border-width': 3,
          'border-opacity': 0.5,
          'text-outline-width': 2,
          'text-outline-color': 'white',          
          'shape': 'circle',   
          'text-valign': 'bottom', 
          'text-wrap' : 'wrap' ,          
          'background-image': 'data(img)',
          'background-color': 'white',
          })
      .selector(':parent')
        .css({
          'background-opacity': 0.333 })
      .selector('$node > node')
        .css({
          'padding-top': '0px',
          'padding-left': '0px',
          'padding-bottom': '0px',
          'padding-right': '0px',
           'border-color': 'white',
          'text-valign': 'top',
          'text-halign': 'right',
          'text-outline-width': 10,
          'text-outline-color': 'red',
          'background-color': 'white',
          "color" : "white",
          "font-size" : '20px'
        })
      .selector('edge')
        .css({
          'curve-style': 'bezier',
          'width': 3,
          'line-color': '#ddd ',
          'target-arrow-color': '#ddd ',
          'target-arrow-shape': 'triangle',
          'text-outline-width': 5,
          'text-outline-color': 'white',
          'content': 'data(count)',
          'opacity': 0.8,          
        })
      .selector(".background")
        .css({
          "text-background-opacity": 1,
          "text-background-color": "red",
          "text-background-shape":  "circle",
          "text-border-color": "red",
          "text-border-width": 2,
          "text-border-opacity": 1,
          "text-valign": "top",
          "text-halign": "right",
          "text-color" : "white"
        })      
      .selector(':selected')
        .css({
          'background-color': 'white',
          'line-color': '#1593ff',
           'border-width': 3,
          'border-color': '#1593ff',
          'target-arrow-color': '#1593ff',
          'source-arrow-color': 'white',
          'opacity': 1
        })
        .selector('#a1')
        .css({
          'background-image': '../assets/images/user1.png'
        })
        .selector('#a2')
        .css({
          'background-image': '../assets/images/user2.png'

        })
        .selector('#b1')
        .css({
          'background-image': '../assets/sample/tomcat.png'
        })
        .selector('.multiline-manual')
        .css({
          'text-wrap' : 'wrap'
        }),
      
    elements: elesJson,

    layout: {
      name: 'dagre',
      rankDir: 'LR',
      nodeSep: 100,
      edgeSep: 100,
      rankSep: 100,
    },
    ready: function(){
      window.cy = this;
      // giddy up
    }
  });  
  cy.on('click', 'node', function(evt){    
     var id = this.id();
     nodeList.forEach(function(d){      
      if(d.id == id){
         d.status = (d.status == 0) ?1 : 0
      }
     });
  });  
};

function getDash(day) {  
  console.log(day);
  var yDay = new Date(day.getTime()-24*60*60*1000);    
  var indexs = $('#indexs').val();
  var d = day.toString().split(' ');  
  var y = yDay.toString().split(' ');  
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  $.ajax({
    url: "/dashboard/restapi/selectJiraAccDash",
    dataType: "json",
    type: "GET",    
    data: { index: [indexs+d[3]+"."+mon[d[1]]+"."+d[2], indexs+y[3]+"."+mon[y[1]]+"."+y[2]],
              START : y[3]+"-"+mon[y[1]]+"-"+y[2]+'T15:00:00', END : d[3]+"-"+mon[d[1]]+"-"+d[2]+"T15:00:00"},
    success: function(result) {
      console.log(result)      ;
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        console.log(result);
        drawDash(result.rtnData, result.start, result.end);
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
    url: "/dashboard/restapi/selectJiraSankeyByLink" ,
    dataType: "json",
    type: "get",
    data: { index: [indexs+d[3]+"."+mon[d[1]]+"."+d[2], indexs+y[3]+"."+mon[y[1]]+"."+y[2]],
              START : y[3]+"-"+mon[y[1]]+"-"+y[2]+'T15:00:00', END : d[3]+"-"+mon[d[1]]+"-"+d[2]+"T15:00:00"},
    success: function(result) {      
      if (result.rtnCode.code == "0000") {                
        drawSankey({rtnData : result.rtnData, id : result.id});
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

function getDataByToggle(gap) {  
  d3.select("#test").select("svg").remove();
  d3.select("#load").select("svg").remove();
  d3.select("#sankey").select("svg").remove();
  var day = new Date();
  var yDay = new Date(day.getTime()-24*60*60*1000);  
  var indexs = $('#indexs').val();
  var d = day.toString().split(' ');  
  var y = yDay.toString().split(' ');
  var yyDay = new Date(day.getTime()-48*60*60*1000);  
  var yy = yyDay.toString().split(' ')
  var now = new Date().getTime() - 9*60*60*1000;
  var e = new Date(now).toString(' ').split(' ');
  var s = new Date(now-gap*60*1000).toString().split(' ');
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
  $.ajax({
    url: "/dashboard/restapi/selectJiraAccDash",
    dataType: "json",
    type: "GET",    
    data: { index: [indexs+d[3]+"."+mon[d[1]]+"."+d[2], indexs+y[3]+"."+mon[y[1]]+"."+y[2], indexs+yy[3]+"."+mon[yy[1]]+"."+yy[2]],
              START : s[3]+"-"+mon[s[1]]+"-"+s[2]+'T'+s[4], END : e[3]+"-"+mon[e[1]]+"-"+e[2]+"T"+e[4]},
    success: function(result) {
      
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        
        drawDash(result.rtnData, result.start, result.end);
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
    url: "/dashboard/restapi/selectJiraSankeyByLink" ,
    dataType: "json",
    type: "get",
    data: { index: [indexs+d[3]+"."+mon[d[1]]+"."+d[2], indexs+y[3]+"."+mon[y[1]]+"."+y[2], indexs+yy[3]+"."+mon[yy[1]]+"."+yy[2]],
              START : s[3]+"-"+mon[s[1]]+"-"+s[2]+'T'+s[4], END : e[3]+"-"+mon[e[1]]+"-"+e[2]+"T"+e[4]},
    success: function(result) {
      console.log(result);
      if (result.rtnCode.code == "0000") {        
        drawSankey({ rtnData : result.rtnData, id : result.id });
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

var cnt = 0;
function drawDash(data, start, end) {  
  var indexs = $('#indexs').val();
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
      nYMin: 0, nYMax: 10000,
      nZMin: 0, nZMax: 5,
      nBubbleSize: 3,
      nPaddingTop : 50,
      nDefaultRadius : 3,
      htTypeAndColor : {
        'Success' :'#55c7c7',
        'Redirection' : '#fcc666',
        'Error' : '#fd7865'        
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
        console.log(new Date(start), new Date(end));
        var aData = this.getDataByXY(htXY.nXFrom, htXY.nXTo, htXY.nYFrom, htXY.nYTo);
        var start = parseInt(htXY.nXFrom)-9*60*60*1000;
        var end = parseInt(htXY.nXTo)-9*60*60*1000;
        var link = '/dashboard/selected_detail?start='+start+'&end='+end+'&min='+htXY.nYFrom+'&max='+htXY.nYTo;
        console.timeEnd('fOnSelect');
        console.log('adata length', aData.length);
        window.open(link, "EyeLink Service LIst", "menubar=1,status=no,scrollbars=1,resizable=1 ,width=1200,height=640,top=50,left=50");
        d3.select("#test").select("svg").remove();
        d3.select("#load").select("svg").remove();        
        $.ajax({
          url: "/dashboard/restapi/selectScatterSection" ,
          dataType: "json",
          type: "get",
          data: { start:start, end:end, min:htXY.nYFrom, max:htXY.nYTo},
          success: function(result) {
            if (result.rtnCode.code == "0000") {            
            console.log(new Date(result.start));
            console.log(new Date(result.end));
            console.log(result);
             summary(result.rtnData, result.start, result.end);
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
    }); 
      if(cnt != 0){         
        oScatterChart._empty();
        oScatterChart._redraw();      
        summary(data, start, end);
      }
      oScatterChart.addBubbleAndDraw(data);         
  }   
   if(cnt++ == 0) {
    summary(data, start, end);
   }  
};  

function summary(data, start, end) {  
  var chart = dc.barChart("#test");
  var load = dc.barChart("#load");
 
  var timeformat = d3.time.format('%m-%d %H:%M');
  
  if((end-start)<60*60*1000){
    start -= 30*60*1000;
    end += 30*60*1000;
  }
  
  var minDate = new Date(start); 
  var maxDate = new Date(end);
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
    //.x(d3.time.scale().domain([minDate, maxDate]))
    .round(d3.time.hour.round)
    .xUnits(function(){return 24;})
    .elasticY(true)
    .centerBar(true)
 //   .gap(gap)
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

function displayCount() {    
  var indexs = $('#indexs').val();  
  var mon = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];  
  var day = new Date();
  var d = day.toString().split(' ');  
  var pday = day.getTime() - 24*60*60*1000;
  pday = new Date(pday);      
    $.ajax({
    url: "/dashboard/restapi/countAccJira",
    dataType: "json",
    type: "GET",    
    data: { index: indexs+day.getFullYear()+"."+mon[day.getMonth()]+"."+d[2]},
    success: function(result) {
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
         $('#dayCnt').text(result.rtnData);               
         pdayCnt(pday, mon);
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
    url: "/dashboard/restapi/countAccJira",
    dataType: "json",
    type: "GET",    
    data: { index: indexs+day.getFullYear()+"."+mon[day.getMonth()]+".*"},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
        $('#monCnt').text(result.rtnData);        
        pmonCnt(day, mon);
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
    url: "/dashboard/restapi/countAccJiraError",
    dataType: "json",
    type: "GET",    
    data: { index: indexs+day.getFullYear()+"."+mon[day.getMonth()]+"."+d[2]},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        
         $('#errCnt').text(result.rtnData);               
        perrCnt(pday, mon);
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

function setStatus(obj, percent, msg, cnt) {
  // $('#mevent_status > .status > .status-number')
  obj.children('.progress').children('.progress-bar').css('width', percent + '%');
  obj.children('.status').children('.status-title').text('From the previous ' + msg + ' (' + cnt + ')');
  obj.children('.status').children('.status-number').text(repVal(percent) + '%');
}

function repVal(str) {
  str *= 1
  return str.toFixed(2);
}

function pdayCnt(day, mon){
 var indexs = $('#indexs').val();
 var d = day.toString().split(' ');

   $.ajax({
    url: "/dashboard/restapi/countAccJira",
    dataType: "json",
    type: "GET",    
    data: { index: indexs+day.getFullYear()+"."+mon[day.getMonth()]+"."+d[2]},
    success: function(result) {
       console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);        /
        setStatus($('#dayCnt_status'), parseInt($('#dayCnt').text())/result.rtnData*100, 'day', result.rtnData);       

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

function pmonCnt(day, mon){
  var indexs = $('#indexs').val();
   if(day.getMonth() == 0) {
    var index = indexs+(day.getFullYear()-1)+"."+mon[11]+".*";
  } else {
    var index = indexs+day.getFullYear()+"."+mon[day.getMonth()-1]+".*";
  }
  $.ajax({
    url: "/dashboard/restapi/countAccJira",
    dataType: "json",
    type: "GET",    
    data: { index: index },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);
        setStatus($('#monCnt_status'), parseInt($('#monCnt').text())/result.rtnData*100, 'month', result.rtnData); 
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

function perrCnt(day, mon){
  var indexs = $('#indexs').val();
  var d = day.toString().split(' ');
   $.ajax({
    url: "/dashboard/restapi/countAccJiraError",
    dataType: "json",
    type: "GET",    
    data: { index: indexs+day.getFullYear()+"."+mon[day.getMonth()]+"."+d[2]},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        //- $("#successmsg").html(result.message);
        setStatus($('#errCnt_status'), parseInt($('#errCnt').text())/result.rtnData*100, 'day', result.rtnData);       
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

function drawChart() {
  var markerName = "dashboardChart";
  var volumeChart = dc.barChart('#volumn-chart', markerName);

  d3.json("/dashboard/restapi/getJiraAccOneWeek", function(err, out_data) {
    // if (err) throw Error(error);
    var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
    var df = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');
    var numberFormat = d3.format('.2f');
    var maxDate = new Date();
    var minDate  = addDays(new Date(), -20);

    // for Test
    maxDate = new Date(new Date().getTime());
    minDate = new Date(new Date().getTime()-7*24*60*60*1000-12*60*60*1000);

    var data = out_data.rtnData;
    // console.log(out_data);
    
    data.forEach(function (d) {         
      var a = d.timestamp.split(':');
      var b = a[0].split('/');
      var c = a[3].split(' ');
      var mon = {'Jan' : 1, 'Feb' : 2, 'Mar' : 3, 'Apr' : 4, 'May' : 5, 'Jun' : 6, 'Jul' : 7, 'Aug' : 8, 'Sep' : 9, 'Oct' : 10, 'Nov' : 11, 'Dec' : 12 };      
      d.day=d3.time.day(new Date(b[2], mon[b[1]]-1, b[0], a[1], a[2], c[0]));
            
    });

    // console.log(data);

    var ndx = crossfilter(data);

    var moveDays = ndx.dimension(function (d) {    
      return d.day;
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
       
       /*document.getElementById('chart1').reload();
        var el = document.getElementById('chart1');
//        el.parentNode.removeChild(el);
        disp = el.style.display;
        el.style.display = 'none';z
        el.offsetHeight;
        el.style.display ='block';

        document.getElementById('chart1').remove();*/        
        d3.select("#test").select("svg").remove();
        d3.select("#load").select("svg").remove();
        d3.select("#sankey").select("svg").remove();
        /*document.createElement('chart1');*/
        console.log(d.x);
        getDash(d.x);        
      });  
    });    
    dc.renderAll(markerName);
  });
}

function clear(cvsId) {
    //var canvas = document.getElementById("canvas");       
    var canvas = document.getElementsByClassName("bigscatterchart-Success");    
    console.log(canvas);    
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);      
}

function drawSankey(data){    
  console.log(data);
  
  console.log(data.id);
  var colors = data.id;
  /*var json = JSON.parse(data.rtnData); 
  console.log(json);*/
    var chart = d3.select("#sankey").append("svg").chart("Sankey.Path");
   chart
      .name(label)
      .colorNodes(function(name, node) {
        return color(node, 1) || colors.fallback;
      })
      .colorLinks(function(link) {
        return color(link.source, 4) || color(link.target, 1) || colors.fallback;
      })
      .nodeWidth(15)
      .nodePadding(10)
      .spread(true)
      .iterations(0)
      .draw(data.rtnData);
    function label(node) {
      return node.name.replace(/\s*\(.*?\)$/, '');
    }
    
    function color(node, depth) {
      var id = node.id.replace(/(_score)?(_\d+)?$/, '');
      if (colors[id]) {
        return colors[id];
      } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
        return color(node.targetLinks[0].source, depth-1);
      } else {
        return null;
      }
    }
};