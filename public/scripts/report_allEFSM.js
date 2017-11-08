function drawChart() {  
  var sdate = $('#sdate').val();    
  var edate = $('#edate').val();  
  $.ajax({
    url: "/reports/restapi/getJiraAcc",
    dataType: "json",
    type: "get",
    data: { sdate : sdate, edate : edate }, 
    success: function(result) {   
      if (result.rtnCode.code == "0000") {             
        console.log(result)
        drawAll(result.rtnData, sdate, edate, result.minTime, result.maxTime);
      } else {
        //- $("#errormsg").html(result.message);
      }
    }
  });
}

function drawAll(data, sdate, edate, minTime, maxTime) {
  var pieChart = dc.pieChart('#pieChart');
  var countBar = dc.barChart('#countBar');
  var countLine = dc.compositeChart("#countLine");
  var serverCount = dc.barChart('#serverCount');   

  if(sdate == edate) {
    var minBar = d3.time.hour(new Date(minTime-60*60*1000));
    var maxBar = d3.time.hour(new Date(maxTime+60*60*1000));
    var minLine = d3.time.hour(new Date(minTime));
    var maxLine = d3.time.hour(new Date(maxTime));
  } else {
    var minBar = d3.time.day(new Date(minTime-24*60*60*1000));
    var maxBar = d3.time.day(new Date(maxTime+24*60*60*1000));
    var minLine = d3.time.day(new Date(minTime));
    var maxLine = d3.time.day(new Date(maxTime));
  }

  var gap = (maxLine-minLine)/(24 * 60 * 60 * 1000);  
  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var sectionDim = nyx.dimension(function(d){    
    return d.section;
  }); 

  var pieGroup = sectionDim.group().reduceCount(function(d){
    return 1;
  });

  if(sdate != edate) {    
    var dayDim = nyx.dimension(function(d){                  
      return d3.time.day(new Date(d.timestamp));

    });  } else {
    var dayDim = nyx.dimension(function(d) {                        
      return d3.time.hour(new Date(d.timestamp));
    });
  }

  var stackGroup = dayDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;    
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {    return{};  });

  var errGroup = dayDim.group().reduce(
    function (p, v) {      
      if(v.section == "error") {    ++p.cnt ;      }      
      return p;
    },
    function (p, v) {      
      if(v.section == "error") {   -- p.cnt ;      }                  
      return p;
    },
    function() {      return { cnt:0 };    }
  );

  var slowGroup = dayDim.group().reduce(
    function (p, v) {      
      if(v.section == "slow") {   ++p.cnt ;     }      
      return p;
    },
    function (p, v) {
      if(v.section == "slow") {    -- p.cnt ;      }                  
      return p;
    },
    function() {      return { cnt:0 };    }
  );  

  var s1Group = dayDim.group().reduce(
    function (p, v) {      
      if(v.section == "1s") {   ++p.cnt ;      }      
      return p;
    },
    function (p, v) {   
      if(v.section == "1s") {   -- p.cnt ;      }                  
      return p;
    },
    function() {      return { cnt:0 };    }
  );

   var s3Group = dayDim.group().reduce(
    function (p, v) {      
      if(v.section == "3s") {    ++p.cnt ;      }      
      return p;
    },
    function (p, v) {     
      if(v.section == "3s") {    -- p.cnt ;      }                  
      return p;
    },
    function() {      return { cnt:0 };    }
  );

  var s5Group = dayDim.group().reduce(
    function (p, v) {      
      if(v.section == "5s") {   ++p.cnt ;      }      
      return p;
    },
    function (p, v) {      
      if(v.section == "5s") {   -- p.cnt ;      }                  
      return p;
    },
    function() {      return { cnt:0 };    }
  );

  var typeDim = nyx.dimension(function(d){    
    return d.type;
  });

  var typeGroup = typeDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;        
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {    return{};  });

/* dc.pieChart('#eventChart') */
  pieChart 
    .width(window.innerWidth*0.45)
    .height(400)
    .radius(160)
    .dimension(sectionDim)
    .group(pieGroup)    
    .drawPaths(true)
    .legend(dc.legend())
    .label(function (d){
      if(pieChart.hasFilter() && !pieChart.hasFilter(d.key)) {
        return '0(0%)';
      }
      var label = d.key;
      if(all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    })
    .renderLabel(true)
    .colors(d3.scale.ordinal().range(["#EDC951",  "#31a354", "#00A0B0", "#FFB2F5" , "#CC333F"]));

  var term = ['1s', '3s', '5s', 'slow', 'error'];
  countBar
    .width(window.innerWidth*0.43)
    .height(380)
    .margins({left: 65, top: 10, right: 10, bottom: 40})
    .brushOn(true)
    .transitionDuration(500)
    .clipPadding(20)
    .title(function(d) {
      for(var i=0; i<term.length; i++) {
        if(this.layer == term[i])                   
          return this.layer + ' : ' + d.value[i];
      }
    })      
    .dimension(dayDim)
    .group(stackGroup, term[0], sel_stack('0'))
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)
    .x(d3.time.scale().domain([minBar, maxBar]))    
    .xUnits(function(){return 24;})
    .elasticY(true)
    .centerBar(true)
  //.gap(20)
    .colors(d3.scale.ordinal().range(["#EDC951",  "#31a354", "#00A0B0", "#FFB2F5" , "#CC333F"]));

  if(sdate == edate){
    countBar.round(d3.time.hour.round);
  } else {
    countBar.round(d3.time.day.round);
  }
    
  countBar.legend(dc.legend());
  
  dc.override(countBar, 'legendables', function() {
    var items = countBar._legendables();
    return items.reverse();    
  });

  for(var i = 1; i<term.length; ++i){
    countBar.stack(stackGroup, term[i], sel_stack(i));
  }  
    /*  dc.barChart('#eventBar')  */
  function sel_stack(i) {
    return function(d) {            
      return d.value[i]?d.value[i]:0;
    };
  }

  countLine
    .width(window.innerWidth*0.43)
    .height(380)
     .margins({top: 20, right: 20, bottom: 40, left: 120})
    .dimension(dayDim)
    .transitionDuration(500)
    .elasticY(true)
    .y(d3.scale.linear().domain([0, data.length]))      
    .brushOn(true)
    .mouseZoomable(true)
    .x(d3.time.scale().domain([minLine, maxLine]))
    .y(d3.scale.linear().domain([0, 100]))
    .round(function(d) {
      if(edate == sdate) {
        return d3.time.hour.round;
      } else {
      return d3.time.day.round;
    }})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true) 
    .title(function(d) {
      console.log(d);
      return "\nCount : " + d.value.cnt;
    })
    .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
    .compose([
      dc.lineChart(countLine).group(errGroup, "error")
        .valueAccessor(function(d){
         return d.value.cnt; })
        .colors("#CC333F"),
      dc.lineChart(countLine).group(slowGroup, "slow")
        .valueAccessor(function(d){
          return d.value.cnt; })
        .colors("#FFB2F5"),
      dc.lineChart(countLine).group(s1Group, "1s")
        .valueAccessor(function(d){
          return d.value.cnt; })
        .colors("#EDC951"),
      dc.lineChart(countLine).group(s3Group, "3s")
        .valueAccessor(function(d){
          return d.value.cnt; })
        .colors('#31a354'),
      dc.lineChart(countLine).group(s5Group, "5s")
        .valueAccessor(function(d){
          return d.value.cnt; })
        .colors("#00A0B0")
    ]);

  if(sdate == edate) {
    countLine.rangeChart(countBar);
    countBar.rangeChart(countLine);
  } 
  var serverList = ["jira"];
  serverCount
    .width(window.innerWidth*0.43)
    .height(380)
    .margins({left: 65, top: 10, right: 10, bottom: 40})
    .brushOn(true)
    .transitionDuration(500)
    .clipPadding(30)
    .title(function(d) {
      for(var i=0; i<term.length; i++) {
        if(this.layer == term[i])                   
          return this.layer + ' : ' + d.value[i];
      }
    })      
    .dimension(typeDim)
    .group(typeGroup, term[0], sel_stack('0'))
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)
    //.centerBar(true)
    .gap(serverList.length+20)             
    .x(d3.scale.ordinal().domain(serverList))     
    .xUnits(dc.units.ordinal)
    .colors(d3.scale.ordinal().range(["#EDC951",  "#31a354", "#00A0B0", "#FFB2F5" , "#CC333F"]));
    
  serverCount.legend(dc.legend());
  
  dc.override(serverCount, 'legendables', function() {
    var items = serverCount._legendables();
    return items.reverse();    
  });


  for(var i = 1; i<term.length; ++i){
    serverCount.stack(typeGroup, term[i], sel_stack(i));
  }  

  dc.renderAll();
}