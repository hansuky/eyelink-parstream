function getData() {
  
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };    
  var sdate = $('#sdate').val();    
  var edate = $('#edate').val();
  var name = $('#process').val();
  console.log(sdate, edate);
  if(name == '')  {
    var link = "/reports/restapi/getProcess" 
  } else {
    var link = "/reports/restapi/getProcessByName" 
  }  
  $.ajax({
    url: link,
    dataType: "json",
    type: "get",
    data: { sdate : sdate, edate : edate, name : name},
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
}

function drawChart(data) {    
  var minDate = new Date(data[0].timestamp), maxDate = new Date(data[data.length-1].timestamp);
  var cpuChart = dc.compositeChart("#cpuChart");
  var memoryChart = dc.compositeChart("#memoryChart");
  var filesystemChart = dc.compositeChart("#filesystemChart");
  var processTable = dc.dataTable(".processTable");

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
    .mouseZoomable(true)
    .x(d3.time.scale().domain([minDate, maxDate]))    
    .y(d3.scale.linear().domain([0, 100]))
    .round(d3.time.hour.round)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true) 
    .title(function(d) {console.log("\npct : " + d); return "\npct : " + d.value.avg; })
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
//    .brushOn(true)
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

  processTable 
    .dimension(timeDim)
    // Data table does not use crossfilter group but rather a closure
    // as a grouping function
    .group(function (d) {
        return new Date(d.timestamp);
    })
    // (_optional_) max number of records to be shown, `default = 25`
    .size(20)
    // There are several ways to specify the columns; see the data-table documentation.
    // This code demonstrates generating the column header automatically based on the columns.
    .columns([ 'pgid',  'cpu', 'memory', 'name', 'timestamp'   ])
    .sortBy(function (d) {
        return d.cpu;
    })
    // (_optional_) sort order, `default = d3.ascending`
    .order(d3.ascending)
    // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
    .on('renderlet', function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
    });

 dc.renderAll();
}