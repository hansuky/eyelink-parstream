function drawChart() {
  var sdate = $('#sdate').val();
  var edate = $('#edate').val();
  console.log(sdate+', '+edate);
  $.ajax({
    url: "/reports/restapi/getTbRawDataByPeriod" ,
    dataType: "json",
    type: "get",
    data: {startDate:sdate, endDate:edate},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        // TO-DO json data 수신 방식 점검 필요 by 배성한
        //- $("#successmsg").html(result.message);
        // for test
        // var data = [
        //   {date:new Date('2016-01-01'), als_level: 5, dimming_level: 5, power:120, noise:130, vibration:200},
        //   {date:new Date('2016-01-15'), als_level: 7, dimming_level: 1, power:100, noise:150, vibration:100},
        //   {date:new Date('2016-02-02'), als_level: 1, dimming_level: 3, power:150, noise:170, vibration:100},
        //   {date:new Date('2016-03-02'), als_level: 6, dimming_level: 7, power:200, noise:110, vibration:100},
        //   {date:new Date('2016-04-02'), als_level: 4, dimming_level: 5, power:157, noise:100, vibration:100},
        //   {date:new Date('2016-05-02'), als_level: 8, dimming_level: 0, power:50,  noise:150, vibration:100},
        //   {date:new Date('2016-06-02'), als_level: 9, dimming_level: 1, power:125, noise:150, vibration:100},
        //   {date:new Date('2016-07-02'), als_level: 2, dimming_level: 3, power:158, noise:150, vibration:300},
        //   {date:new Date('2016-08-02'), als_level: 6, dimming_level: 7, power:123, noise:150, vibration:100},
        //   {date:new Date('2016-09-02'), als_level: 7, dimming_level: 5, power:132, noise:50, vibration:100},
        //   {date:new Date('2016-10-02'), als_level: 8, dimming_level: 3, power:160, noise:150, vibration:100},
        //   {date:new Date('2016-11-02'), als_level: 5, dimming_level: 2, power:50 , noise:150, vibration:100},
        // ];        
        var data = result.rtnData;        
        drawAll(data, sdate, edate);
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

function drawAll(data, sdate, edate) {
  var eventChart = dc.pieChart('#eventChart');
  var eventBar = dc.barChart('#eventBar');
  var checkLine = dc.compositeChart("#checkLine");
  var nodeBar = dc.barChart('#nodeBar');

  var minDate = new Date(sdate);  
  var maxDate = new Date(edate);

  var gap = (maxDate-minDate)/(24 * 60 * 60 * 1000);

  var group_id = new Array();

  // 데이터 가공
  var df = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
  data.forEach(function(d) {        
    d.event_time = df.parse(d.event_time);
    d.today = d3.time.day(d.event_time);
    d.month = d3.time.month(d.event_time);
    switch(d.event_type){
      case "1" :   // 피워
        d.index = 0;
        d.event_name = 'POWER';        
        break;
      case "17" :   // 조도
        d.index = 1;
        d.event_name = 'ALS';
        break;
      case "33" :     // 진동
        d.index = 2;
        d.event_name = 'VIBRATION';
        break;
      case "49" :    // 노이즈
        d.index = 3;
        d.event_name = 'NOISE';        
        break;
      case "65" :    // GPS
        d.index = 4;
        d.event_name = 'GPS';        
        break;
      case "81" :     // 센서상태
        d.index = 5;    
        d.event_name = 'STREET LIGHT';           
        break;
      case "97" : 
        d.index = 6;
        d.event_name = "DL";        
        break;
      case "153" :    // 재부팅
        d.index = 7;
        d.event_name = 'REBOOT';
        break;       
      }
       if(d.zone_id === 'ZONE-4')
          d.zone_id = 'ZONE-04';
  });

  var eventName = ["POWER", "ALS", "VIBRATION", "NOISE", "GPS", "STREET LIGHT", "DL", "REBOOT"];

  var nyx = crossfilter(data);
  var all = nyx.groupAll();

// Dimension by event_name
  var eventDim = nyx.dimension(function(d) {     
    return d.event_name;
  });
var cnt = 0;
  var eventGroup = eventDim.group().reduceCount(function(d) {
    return 1;
  });

// Dimension by today
  var todayDim = nyx.dimension(function (d) { return d.today; });

  var eventBarGroup = todayDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {
    return{};
  });

  // Dimension by today
  var todayDim = nyx.dimension(function (d) { return d.today; });
  var eventBarGroup = todayDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {
    return{};
  });

  console.log('gap : '+(maxDate-minDate)/(24 * 60 * 60 * 1000));  
  var checkDim = nyx.dimension(function(d) {  
    if(gap < 31) {
      return d.today; 
    } else {
      return d.month;
    }

  });
  var powerGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "1") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "1") {        
        -- p.cnt ;
      }            
     if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var alsGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "17") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }          
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "17") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var vibGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "33") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }          
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "33") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var noiseGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "49") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }           
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "49") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var gpsGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "65") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "65") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var lightGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "81") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }           
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "81") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var dlGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "97") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }           
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "97") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );
  var rebootGroup = checkDim.group().reduce(
    function (p, v) {
      p.tot++;
      if(v.event_type == "153") {                
        ++p.cnt ;
      }
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }           
      return p;
    },
    function (p, v) {
      p.tot--;
      if(v.event_type == "153") {        
        -- p.cnt ;
      }            
      if(p.cnt === 0){
        p.per = 0;
      } else {
        p.per = p.cnt/p.tot * 100;
      }
      return p;
    },
    function() {
      return { cnt:0, tot:0, per:0 };
    }
  );

// Dimension by Node_ID
  var zoneDim = nyx.dimension(function(d) { 
    
    return d.zone_id; });
  var nodeBarGroup = zoneDim.group().reduceCount(function(d) {
    return 1;
  });

  /* dc.pieChart('#eventChart') */
  eventChart 
    .width(window.innerWidth*0.4)
    .height((window.innerWidth*0.4)*0.5)
    .radius((window.innerWidth*0.4)*0.2)
    .dimension(eventDim)
    .group(eventGroup)    
    .drawPaths(true)
    .legend(dc.legend())
    .label(function (d){
      if(eventChart.hasFilter() && !eventChart.hasFilter(d.key)) {
        return '0(0%)';
      }
      var label = d.key;
      if(all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
      }
      return label;
    })
    .renderLabel(true)
    .colors(d3.scale.ordinal().range(["#EDC951", "#CC333F", "#756bb1", "#31a354", "#fd8d3c", "#00A0B0", "#003399", "#FFB2F5"]));

/*  dc.barChart('#eventBar')  */
  function sel_stack(i) {
      return function(d) {            
          return d.value[i]?d.value[i]:0;
      };
  }
  eventBar
    .width(window.innerWidth*0.4)
    .height((window.innerWidth*0.4)*0.5)
    .margins({left: 140, top: 15, right: 10, bottom: 40})
    .brushOn(false)
    .clipPadding(10)
    .transitionDuration(500)
    .title(function(d) {
      for(var i=0; i<8; i++) {
        if(this.layer == eventName[i])
          return this.layer + ' : ' + d.value[i];
      }
    })
    .dimension(todayDim)
    .group(eventBarGroup, "POWER", sel_stack('0'))
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)
    .x(d3.time.scale().domain([minDate, maxDate]))
    .gap(gap)
    .round(d3.time.day.round)
    .xUnits(function(){return 10;})
    .elasticY(true)
    .elasticX(true)
  //  .centerBar(true)
    .colors(d3.scale.ordinal().range(["#EDC951", "#CC333F", "#756bb1", "#31a354", "#fd8d3c", "#00A0B0", "#003399", "#FFB2F5"]))
    /*.renderLabel(true)*/;
    eventBar.legend(dc.legend());
    dc.override(eventBar, 'legendables', function() {
      var items = eventBar._legendables();
      return items.reverse();
    });
    for(var i = 1; i<8; ++i){
      eventBar.stack(eventBarGroup, eventName[i], sel_stack(i));
    }

    checkLine
/*      .renderArea(true)
      .renderHorizontalGridLines(true)*/
      .width(window.innerWidth*0.4)
      .height((window.innerWidth*0.4)*0.5)
       .margins({top: 20, right: 20, bottom: 40, left: 140})
      .dimension(checkDim)
      .transitionDuration(500)
//      .elasticY(true)
      .y(d3.scale.linear().domain([0, data.length]))      
      .brushOn(false)
      .mouseZoomable(true)
      .x(d3.time.scale().domain([minDate, maxDate]))
      .y(d3.scale.linear().domain([0, 100]))
      .round(function(d) {
        if(gap > 30) {
          return d3.time.month.round;
        } else {
        return d3.time.day.round;
      }})
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true)
   //   .yAxisLabel("Date")
      .title(function(d) {
        console.log(d);
        return "\nCount : " + d.value.cnt;
      })
      .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
      .compose([
          dc.lineChart(checkLine).group(powerGroup, "Power")
            .valueAccessor(function(d){
             return d.value.per; })
            .colors('#EDC951'),
          dc.lineChart(checkLine).group(alsGroup, "ALS")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#CC333F'),
          dc.lineChart(checkLine).group(vibGroup, "Vibration")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#756bb1'),
          dc.lineChart(checkLine).group(noiseGroup, "Noise")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#31a354'),
          dc.lineChart(checkLine).group(gpsGroup, "GPS")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#fd8d3c'),
          dc.lineChart(checkLine).group(lightGroup, "StreetLight")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#00A0B0'),
          dc.lineChart(checkLine).group(dlGroup, "DL")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#003399'),
          dc.lineChart(checkLine).group(rebootGroup, "Reboot")
            .valueAccessor(function(d){
              return d.value.per; })
            .colors('#FFB2F5'),
        ]);


  /*  dc.barChart('#nodeBar')  */
  nodeBar
    .width(window.innerWidth*0.4)
    .height((window.innerWidth*0.4)*0.5)
    .margins({top: 15, right: 50, bottom: 40, left: 40})
    .transitionDuration(500)
    .dimension(zoneDim)
    .group(nodeBarGroup)
    .elasticY(true)
    .brushOn(true)
    //.centerBar(true)
    .gap(group_id.length+20)         
    .x(d3.scale.ordinal().domain(group_id))    
    .xUnits(dc.units.ordinal)     
    .alwaysUseRounding(true)
    .renderHorizontalGridLines(true)
    .colors(d3.scale.ordinal().range(["#EDC951", "#CC333F", "#756bb1", "#31a354", "#fd8d3c", "#00A0B0", "#003399", "#FFB2F5"]));

    dc.renderAll();
}
