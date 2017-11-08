function getData() {  
  var sdate = $('#sdate').val();    
  var edate = $('#edate').val();  
  
  $.ajax({
    url: "/reports/restapi/getCpuMemoryFilesystemAll" ,
    dataType: "json",
    type: "get",
    data: { sdate : sdate, edate : edate },
    success: function(result) {
      console.log(result);
      if (result.rtnCode.code == "0000") {              
        drawChart(result.rtnData);
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
    url: "/reports/restapi/getProcessList" ,
    dataType: "json",
    type: "get",
    data: { sdate : sdate, edate : edate },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {        
        drawTable(result.rtnData);
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

function drawChart(data) {    
  var minDate = new Date(data[0].timestamp);
  var maxDate = new Date(data[data.length-1].timestamp);
  console.log(minDate, maxDate);
  var cpuChart = dc.compositeChart("#cpuChart");
  var memoryChart = dc.compositeChart("#memoryChart");
  var filesystemChart = dc.compositeChart("#filesystemChart");

  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var timeDim = nyx.dimension(function(d) {    
    return new Date(d.timestamp); });

  var cpuGroup = timeDim.group().reduce(
    function(p, v){      
      p.cnt++;
      p.sum += v.cpu;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));      
      return p;
    }, 
    function(p, v) {
      p.cnt--
      p.sum -= p.cpu;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));
      return p;
    },
    function(){
      return { cnt : 0, sum : 0, avg : 0}
    }
  );

  var memoryGroup = timeDim.group().reduce(
    function(p, v){      
      p.cnt++;
      p.sum += v.memory;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));      
      return p;
    }, 
    function(p, v) {
      p.cnt--
      p.sum -= p.memory;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));
      return p;
    },
    function(){
      return { cnt : 0, sum : 0, avg : 0}
    }
  );

  var filesystemGroup = timeDim.group().reduce(
    function(p, v){      
      p.cnt++;
      p.sum += v.filesystem;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));      
      return p;
    }, 
    function(p, v) {
      p.cnt--
      p.sum -= p.filesystem;
      p.avg =parseFloat((p.sum/p.cnt).toFixed(3));
      return p;
    },
    function(){
      return { cnt : 0, sum : 0, avg : 0}
    }
  );

  var guide9Group = timeDim.group().reduce(
    function(p, v){     
      p.avg = v.guide9;
      return p;
    }, 
    function(p, v) {    
      p.avg = v.guide9;
      return p;
    },
    function(){
      return {avg : 0}
    }
  );

 var guide7Group = timeDim.group().reduce(
    function(p, v){     
      p.avg = v.guide7;
      return p;
    }, 
    function(p, v) {    
      p.avg = v.guide7;
      return p;
    },
    function(){
      return {avg : 0}
    }
  );

  cpuChart
    .width(window.innerWidth*0.28)
    .height(380)
     .margins({top: 20, right: 20, bottom: 40, left: 110})
    .dimension(timeDim)
    .transitionDuration(500)          
//    .brushOn(true)
//    .mouseZoomable(true)
    .x(d3.time.scale().domain([minDate, maxDate]))    
    .y(d3.scale.linear().domain([0, 100]))
    .round(d3.time.hour.round)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true) 
    .title(function(d) {      
      return "\npct : " + d.value.avg;
    })
    .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
    .compose([
      dc.lineChart(cpuChart).group(cpuGroup, "cpu")
        .valueAccessor(function(d){ 
         return d.value.avg; })          
        .colors("green"),
      dc.lineChart(cpuChart).group(guide9Group, "guide")
        .valueAccessor(function(d){
         return d.value.avg; })          
        .colors("red")
        .dashStyle([2,2])
    ]);

  memoryChart
    .width(window.innerWidth*0.28)
    .height(380)
     .margins({top: 20, right: 20, bottom: 40, left: 110})
    .dimension(timeDim)
    .transitionDuration(500)          
 //   .brushOn(true)
    .mouseZoomable(true)
    .x(d3.time.scale().domain([minDate, maxDate]))    
    .y(d3.scale.linear().domain([0, 100]))
    .round(d3.time.hour.round)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true) 
    .title(function(d) {      
      return "\npct : " + d.value.avg;
    })
    .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
    .compose([
      dc.lineChart(memoryChart).group(memoryGroup, "memory")
        .valueAccessor(function(d){                        
         return d.value.avg; })          
        .colors("blue"),
      dc.lineChart(memoryChart).group(guide9Group, "guide")
        .valueAccessor(function(d){            
         return d.value.avg; })          
        .colors("red")
        .dashStyle([2,2])
    ]);

  filesystemChart
    .width(window.innerWidth*0.28)
    .height(380)
     .margins({top: 20, right: 20, bottom: 40, left: 100})
    .dimension(timeDim)
    .transitionDuration(500)          
 //   .brushOn(true)
    .mouseZoomable(true)
    .x(d3.time.scale().domain([minDate, maxDate]))    
    .y(d3.scale.linear().domain([0, 100]))
    .round(d3.time.hour.round)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true) 
    .title(function(d) {      
      return "\npct : " + d.value.avg;
    })
    .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
    .compose([
      dc.lineChart(filesystemChart).group(filesystemGroup, "filesystem")
        .valueAccessor(function(d){                        
         return d.value.avg; })          
        .colors("#FFB2F5"),
      dc.lineChart(filesystemChart).group(guide7Group, "guide")
        .valueAccessor(function(d){            
         return d.value.avg; })          
        .colors("red")
        .dashStyle([2,2])
    ]);
  cpuChart.rangeChart(filesystemChart);
  memoryChart.rangeChart(cpuChart);  
  filesystemChart.rangeChart(memoryChart);
  dc.renderAll();
}

function drawTable(data) {    
  $("#sample").empty();
  var sb = new StringBuffer();
  sb.append('<div class="portlet-body form"><div class="chart" style="height:auto">');
  sb.append('<table class="table table-striped table-bordered table-hover" id="sample_2">');
  sb.append('<thead><tr><th>Pgid</th><th>Cpu</th><th>Memory</th><th>Name</th><th>Timestamp</th></tr></thead><tbody>');
  data.forEach(function(d){
    d._source.timestamp = new Date(d._source.timestamp);
    sb.append('<tr><td>'+d._source.system.process.pgid+'</td><td>'+d._source.system.process.cpu.total.pct+'</td>');
    sb.append('<td>'+d._source.system.process.memory.rss.pct+'</td><td>'+d._source.system.process.name+'</td>');
    sb.append('<td>'+d._source.timestamp+'</td></tr>');
  });
  sb.append('</tbody></table></div></div>');
  $('#sample').append(sb.toString());  
      TableManaged.init();
}