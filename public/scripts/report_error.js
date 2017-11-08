function getData(){  
  var sdate = $('#sdate').val();     
  var edate = $('#edate').val(); 
  $.ajax({
    url: "/reports/restapi/getAccessError" ,
    dataType: "json",
    type: "get",
    data: { sdate : sdate, edate : edate},
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        drawChart(result.rtnData, sdate, edate);        
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

function drawChart(data, sdate, edate) {
  var s = sdate.split('-');
  var minDate = new Date(new Date(s[0], parseInt(s[1])-1, s[2], 0, 0, 0).getTime()-24*60*60*1000);
  var e = edate.split('-');
  var maxDate = new Date(e[0], parseInt(e[1])-1, e[2], 24, 0, 0);

  var groupName = "error";

  var marker = dc_leaflet.markerChart("#demo .map .map", "map");
  var countBar = dc.barChart("#countBar", groupName);
  var typePie = dc.pieChart("#typePie", groupName);
  var hourLine = dc.lineChart("#hourLine", groupName);
  var weekLine = dc.lineChart("#weekLine", groupName);  
  var monLine = dc.lineChart("#monLine", groupName);  
  
  var week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var month = ['Jan', 'Feb' , 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var facilities = nyx.dimension(function(d) { return d.geo; });
  var facilitiesGroup = facilities.group().reduceCount();

  var dayDim = nyx.dimension(function(d) {
    return d3.time.day(new Date(d.timestamp));
  });

  var barGroup = dayDim.group().reduceCount(function(d) {
    return 1;
  });

  var typeDim = nyx.dimension(function(d) {    
    return d.type;
  });
  var pieGroup = typeDim.group().reduceCount(function(d) {
    return 1;
  });

  var hourDim = nyx.dimension(function(d) {
    return new Date(d.timestamp).getHours()
  });

  var hourGroup = hourDim.group().reduceCount(function(d) {
    return 1;
  });

  var weekDim = nyx.dimension(function(d) {    
    return new Date(d.timestamp).getDay(); 
  });

  var weekGroup = weekDim.group().reduceCount(function(d) {
    return 1;
  });

  var wNumDim = nyx.dimension(function(d){        
    return new Date(d.timestamp).getDay();
  });

  var wNumGroup = wNumDim.group().reduceCount(function(d) {
    return 1;
  });

  var monDim = nyx.dimension(function(d) {     
    return new Date(d.timestamp).getMonth();
  });

  var monGroup = monDim.group().reduceCount(function(d) {
    return 1;
  });

  countBar
    .width(window.innerWidth*0.44)
    .height(390)
    .x(d3.time.scale().domain([minDate, maxDate]))    
    .xUnits(function(){return 20;})    
    .round(d3.time.day.round)
    .alwaysUseRounding(true)
    .dimension(dayDim)
    .group(barGroup)
    .elasticY(true)
    .brushOn(true)
    .mouseZoomable(true)
    .centerBar(true)    
    .clipPadding(20);

  typePie
    .width(window.innerWidth*0.44)
    .height(400)
    .radius(160)
    .dimension(typeDim)
    .group(pieGroup)    
    .drawPaths(true)
    .legend(dc.legend())
    .label(function (d){      
      if(typePie.hasFilter() && !typePie.hasFilter(d.key)) {
        return '0(0%)';
      }
      var label = d.key;
      if(all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    })
    .renderLabel(true)
    .colors(d3.scale.ordinal().range(["#FFB2F5", "#EDC951",  "#31a354", "#00D8FF", "#8041D9", "#CC333F", "#00A0B0", "#B5B2FF" ]));

  hourLine
    .width(window.innerWidth*0.44)
    .height(390)
    .x(d3.scale.linear().domain([0,23]))
    .elasticY(true)    
    .renderArea(true)
    .brushOn(true)
    .renderDataPoints(true)        
    .dimension(hourDim)
    .group(hourGroup);

  weekLine
    .width(window.innerWidth*0.44)
    .height(390)
    .x(d3.scale.linear().domain([0,6]))       
    .elasticY(true)    
    .brushOn(true)
    .renderDataPoints(true)                
    .dimension(wNumDim)
    .group(wNumGroup)
    .title(function(d){      
      return week[d.key]+' : '+d.value;
    });

  weekLine.xAxis().tickFormat(function(v) {return week[v];})  ;

  monLine
    .width(window.innerWidth*0.44)
    .height(390)
    .x(d3.scale.linear().domain([0,11]))             
    .elasticY(true)
    .renderDataPoints(true)        
    .brushOn(true)   
    .dimension(monDim)
    .group(monGroup)    
    .title(function(d){         
      return month[d.key]+' : '+d.value;
    });

  monLine.xAxis().tickFormat(function(v) {return month[v];})  ;

  marker
    .dimension(facilities)
    .group(facilitiesGroup)
    .width(window.innerWidth*0.44)
    .height(400)
    .center([37.467271, 127.042861])
    .zoom(11)
    .cluster(true);

  dc.renderAll(groupName);
  dc.renderAll("map");  
}
