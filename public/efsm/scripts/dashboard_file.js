var cyclick = '';
var nodeList = [];
function makeDatabyDay(day){
  var data = { date : day.getTime(), gap : 0 };
  getDash(data);
  getMap(data);
}

function getMap(data){
  var in_data = { url : "/dashboard/restapi/getJiramapdata", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){
    if (result.rtnCode.code == "0000") {  
      var elseJson = { nodes : result.nodes, edges : result.edges };      
      getServerMap(elseJson);             
      znodeLIst = result.nodeList;
    }
  });    
}

function getDash(data){  
  var in_data = { url : "/dashboard/restapi/selectJiraAccDash", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){  
    if (result.rtnCode.code == "0000") {        
      drawScatter(result.rtnData, result.start, result.end, result.max);
      summary(result.rtnData, result.start, result.end);
    }
  });

  var in_data = { url : "/dashboard/restapi/selectJiraSankeyByLink", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){
    if (result.rtnCode.code == "0000") {                        
      drawSankey({rtnData : result.rtnData, id : result.id});
    } 
  });  
}

function getServerMap(elesJson) {
  console.log(elesJson)
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

  var defaults = {
     container: document.getElementById('cynav')
    , viewLiveFramerate: 0 // set false to update cy pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
    , thumbnailEventFramerate: 30 // max thumbnail's updates per second triggered by cy updates
    , thumbnailLiveFramerate: false // max thumbnail's updates per second. Set false to disable
    , dblClickDelay: 200 // milliseconds
    , removeCustomContainer: true // destroy the container specified by user on plugin destroy
    , rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
  };
  var nav = cy.navigator ( defaults );

  var server = $("#server").val();
  if(server=="all"){
    cy.$('#jira').json({ selected: true });
    var data = { date : new Date().getTime(), gap : 0 };
    getDash(data);
    displayCount();
    drawWeekly();          
  }
  var timeStamp = 0;

  cy.maxZoom(1);        
  cy.minZoom(1);

  cy.on('click', 'node', function(evt){      
    var server = $("#server").val();  
    var ser = { 'jira' : 'jira_access', 'TESTAPP' : 'test-agent', 'BCIPPTEST' : 'pp2' };
    cyclick = this.id();        
    if((evt.timeStamp-timeStamp)<500){

      location.href='/dashboard/?server='+ser[cyclick];
      //} else if(server === 'all' && cyclick == 'TESTAPP') {      
    } else {
      if(server === 'all' && cyclick == 'jira'){
        displayCount();
        drawWeekly();      
        var data = { date : new Date().getTime(), gap : 0 };
        getDash(data);
      } else {
        allServer = ser[cyclick];
        getAgentData(new Date);
        displayCountAgent();
      }
    }
    timeStamp = evt.timeStamp;
     nodeList.forEach(function(d){      
      if(d.id == cyclick){
         d.status = (d.status == 0) ?1 : 0
      }
    });     
  });  
};
var allServer = '';

var cnt = 0;
function drawScatter(data, start, end, max) {    
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
      },
      nPaddingRight : 5,
      fOnSelect : function(htPosition, htXY){        
        var aData = this.getDataByXY(htXY.nXFrom, htXY.nXTo, htXY.nYFrom, htXY.nYTo);
        console.log(new Date(parseInt(htXY.nXFrom)), new Date(parseInt(htXY.nXTo)));
        console.log(htXY.nXFrom, htXY.nxTo);
        var link = '/dashboard/selected_detail_jira?start='+htXY.nXFrom+'&end='+htXY.nXTo+'&min='+htXY.nYFrom+'&max='+htXY.nYTo;
        console.timeEnd('fOnSelect');
        console.log('adata length', aData.length);
        window.open(link, "EyeLink Service List", "menubar=1,status=no,scrollbars=1,resizable=1 ,width=1200,height=640,top=50,left=50");        
      }
    }); 
      if(cnt != 0){         
        oScatterChart._empty();
        oScatterChart._redraw();      
        //summary(data, start, end);
      }
      oScatterChart.addBubbleAndDraw(data);         
  }   
   if(cnt++ == 0) {
    //summary(data, start, end);
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
    .centerBar(false)
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
  var data = { date : new Date().getTime() };
  var in_data = { url : "/dashboard/restapi/countAccJiraDay", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){
    if (result.rtnCode.code == "0000") {
      $('#dayCnt').text(result.today);
      setStatus($('#dayCnt_status'), result.today/result.yday*100, 'day', result.yday);
    }
  });
  
  var in_data = { url : "/dashboard/restapi/countAccJiraMon", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){  
    if (result.rtnCode.code == "0000") {
      $('#monCnt').text(result.tmon);
      setStatus($('#monCnt_status'), result.tmon/result.ymon*100, 'mon', result.ymon);                
    }    
  });

  var in_data = { url : "/dashboard/restapi/countAgentError", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){
    if (result.rtnCode.code == "0000") {
      $('#errCnt').text(result.today);
      setStatus($('#errCnt_status'), result.today/result.yday*100, 'day', result.yday);
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

function drawWeekly() {
  var markerName = "dashboardChart";
  var volumeChart = dc.barChart('#volumn-chart', markerName);

  d3.json("/dashboard/restapi/getJiraAccOneWeek", function(err, out_data) {               
    var maxDate = new Date();    
    maxDate.setHours(23);    
    maxDate.setMinutes(59);    
    maxDate.setMilliseconds(59);
    var minDate = new Date(new Date().getTime()-7*24*60*60*1000);
    minDate.setHours(0);    
    minDate.setMinutes(0);  
    minDate.setMilliseconds(0);
    console.log(minDate, maxDate);

    var ndx = crossfilter(out_data.rtnData);

    var moveDays = ndx.dimension(function (d) {    
      return d3.time.day(new Date(d.timestamp));
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
      .elasticY(true)
      .round(d3.time.day.round)
      .alwaysUseRounding(true)
      .xUnits(function(){return 9;})      
      .title(function(d) {
        for(var i=0; i<type.length; i++) {
          if(this.layer == type[i])                   
            return this.layer + ' : ' + d.value[i];
          }
        }
      )
      .colors(d3.scale.ordinal().range(["#EDC951",  "#CC333F"]));

    for(var i = 1; i<type.length; ++i){
      volumeChart.stack(stackGroup, type[i], sel_stack(i));
    }  

    volumeChart.on("renderlet.somename", function(chart) {
      chart.selectAll('rect').on("click", function(d) {
        d3.select("#test").select("svg").remove();
        d3.select("#load").select("svg").remove();
        d3.select("#sankey").select("svg").remove();                
        makeDatabyDay(d.x);        
      });  
    });    
    dc.renderAll(markerName);
  });
}

function clear(cvsId) {
  //var canvas = document.getElementById("canvas");       
  var canvas = document.getElementsByClassName("bigscatterchart-Success");      
  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);      
}

function drawSankey(data){    
  var colors = data.id;
  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

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
    
  chart.on('link:mouseover', function(link) {  
    if(link.errcnt != 0){
      div.transition()    
        .duration(200)    
        .style("opacity", 1);    
      div .html('ErrCnt</br>' + link.errcnt)  
        .style("left", (d3.event.pageX) + "px")   
        .style("top", (d3.event.pageY - 28) + "px");  
    }
      //alert('ErrCount : ' + link.errcnt);
  });

  chart.on('link:mouseout', function(link) {  
    if(link.errcnt != 0){
      div.transition()    
        .duration(500)    
        .style("opacity", 0); 
    }
    //alert('ErrCount : ' + link.errcnt);
  });

  chart.on('link:click', function(link) {  
    if(link.errcnt != 0){
      window.open('sankey_pop?link='+link.elist,'pop', 'menubar=no,status=no,scrollbars=no,resizable=no ,width=1000,height=640,top=50,left=50');
    }
    //alert('ErrCount : ' + link.errcnt);
  });

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