var liveValue = [];
 setInterval(function() { 
    now = new Date().getTime();    
    var s = new Date(now-59*1000).toString().split(' ');
    var e = new Date(now+1*1000).toString().split(' ');
    var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
    $.ajax({
      url: "/analysis/restapi/getClusterNodePower" ,
      dataType: "json",
      type: "get",
      data: { nodeId : "0002.00000039", startDate : s[3]+'-'+mon[s[1]]+'-'+s[2]+'T'+s[4] , endDate : e[3]+'-'+mon[e[1]]+'-'+e[2]+'T'+e[4] },
      success: function(result) {
        // console.log(result);
        if (result.rtnCode.code == "0000") {        
        liveValue = result.rtnData[0];
        console.log(liveValue)
        } else {
          //- $("#errormsg").html(result.message);
        }
      },
      error: function(req, status, err) {
        //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
      }
    });  
  }, 30*1000);    

function getData() {
  var now = new Date();
  console.log('now : '+now);
  var min = Math.floor(now.getMinutes()/10)*10;  
  var point = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), min, 0);
  console.log('point : '+point);
  var start = new Date(point.getTime()-110*60*1000);  
  console.log('start : '+start);
  var end = new Date(point.getTime()+10*60*1000);
  console.log('end : '+end);
  var raw = [], match = {};
  var iso = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");
  var sDate = iso(new Date(start.getTime()-30*1000+9*60*60*1000)).split('.');
  var nDate = iso(new Date(now.getTime()+30*1000+9*60*60*1000)).split('.');
  console.log(sDate, nDate);
  $.ajax({
    url: "/analysis/restapi/getClusterNodePower" ,
    dataType: "json",
    type: "get",
    data: { nodeId : "0002.00000039", startDate : sDate[0] , endDate : nDate[0] },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {        
        raw = result.rtnData;        
        getPatternData(raw, start.getTime(), end.getTime(), now.getTime(), point);
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

function getPatternData(raw, start, end, now, point){
  $.ajax({
    url: "/analysis/restapi/getAnomalyPattern/2017-02-01T11:00:00",
    dataType: "json",
    type: "get",
    data: {},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {                        
        console.log(result.clust);
      var voltage = ({ center : result.clust.voltage.center['cluster_0'], min : result.clust.voltage.min_value['cluster_0'], max : result.clust.voltage.max_value['cluster_0'] })
      var ampere = ({ center : result.clust.ampere.center['cluster_0'], min : result.clust.ampere.min_value['cluster_0'], max : result.clust.ampere.max_value['cluster_0'] })
      var power_factor = ({ center : result.clust.power_factor.center['cluster_0'], min : result.clust.power_factor.min_value['cluster_0'], max : result.clust.power_factor.max_value['cluster_0'] })
      var active_power = ({ center : result.clust.active_power.center['cluster_0'], min : result.clust.active_power.min_value['cluster_0'], max : result.clust.active_power.max_value['cluster_0'] })
    var vdata = [], adata = [], pfdata = [], apdata = [];
    for(i=0; i<voltage.center.length; i++){
      vdata.push({date : start+i*60*1000, center : voltage.center[i], min : voltage.min[i], max : voltage.max[i]});
      adata.push({date : start+i*60*1000, center : ampere.center[i], min : ampere.min[i], max : ampere.max[i]});
      apdata.push({date : start+i*60*1000, center : active_power.center[i], min : active_power.min[i], max : active_power.max[i]});
      pfdata.push({date : start+i*60*1000, center : power_factor.center[i], min : power_factor.min[i], max : power_factor.max[i]});
    }    
        drawChart(raw, vdata, start, end, now, point, now-point, 'voltage', '#voltage');
        drawChart(raw, adata, start, end, now, point, now-point, 'ampere', '#ampere');
        drawChart(raw, apdata, start, end, now, point, now-point, 'active_power', '#active_power');
        drawChart(raw, pfdata, start, end, now, point, now-point, 'power_factor', '#power_factor');
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

function drawChart(raw, compare, start, end, now, point, gap, id, chart_id) {
  var limit = 60 * 1,    duration = 1000;   
 var margin = {top: 10, right: 50, bottom: 30, left: 50},
  width = window.innerWidth*0.88 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;  
  liveValue = raw[raw.length-1];  
    var groups = {
      output: {
        value: liveValue[id],
        color: 'red',
        data: d3.range(0).map(function() {
          return 0
        })
      }
    }

    var x = d3.time.scale()
     .domain([start, end])
    .range([0, width]);

    switch(id) {
      case 'voltage' :
        var yStart = 0, yEnd = 280;
        break;
      case 'ampere' :
        var yStart = 0, yEnd = 1.5;
        break;
      case 'active_power' :
        var yStart = 0, yEnd = 200;
        break;
      case 'power_factor' :
        var yStart = 0, yEnd = 1.5;
        break;      
    }
    var y = d3.scale.linear()    
    .domain([yStart, yEnd])
    .range([height, 3]);

    var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d, i) {       
      return x(now)  })
     //return x(now - (limit - 1 - i) * duration)  })
    .y(function(d) {      return y(d)   })

  var valueline = d3.svg.line()
  .x(function(d) { return x(new Date(d.event_time)); })
  .y(function(d) { return y(d[id]); });
  
   var compareline = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d, i) { return x(d.date); })
    .y(function(d) {  return y(d.center);});

  var upperInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.max); })
    .y1(function (d) { return y(d.center); });

  var lowerInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.center); })
    .y1(function (d) { return y(d.min); });

    var svg = d3.select(chart_id)
    .append('svg')    
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

var xaxis = svg.append('g')
.attr('class', 'x axis')
.attr('transform', 'translate(0,' + height + ')')
.call(x.axis = d3.svg.axis().scale(x).orient('bottom'))

var yaxis = svg.append('g')
 .attr('class', 'y axis')   
    .call(y.axis = d3.svg.axis().scale(y).orient('left'))

var legendWidth  = 310, legendHeight = 55;

 var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + margin.left + ', 0)');

  legend.append('rect')
    .attr('class', 'legend-bg')
    .attr('width',  legendWidth)
    .attr('height', legendHeight);

  legend.append('rect')
    .attr('class', 'inner')
    .attr('width',  75)
    .attr('height', 15)
    .attr('x', 10)
    .attr('y', 10);

  legend.append('text')
    .attr('x', 115)
    .attr('y', 20)
    .text('min-max');

  legend.append('path')
    .attr('class', 'compareline')
    .attr('d', 'M10,40L85,40');

  legend.append('text')
    .attr('x', 115)
    .attr('y', 43)
    .text('Pattern');

  legend.append('path')
    .attr('class', 'live-line')
    .attr('d', 'M170,40L245,40');

  legend.append('text')
    .attr('x', 275)
    .attr('y', 43)
    .text('Live');  

   legend.append('path')
    .attr('class', 'valueline')
    .attr('d', 'M170,17L245,17');

  legend.append('text')
    .attr('x', 275)
    .attr('y', 20)
    .text('Compare');
  
svg.append('path')
    .datum(compare)     
    .attr('class', 'area upper inner')
    .attr('d', upperInnerArea);
    //.attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .datum(compare)     
    .attr('class', 'area lower inner')
    .attr('d', lowerInnerArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append("path")   
  .attr("class", "compareline")   
//   .attr('opacity', 0.5)
  .attr("d", compareline(compare));

  svg.append("path")   
  .attr("class", "valueline")   
  .attr("d", valueline(raw));
 

var formatTime = d3.time.format("%I:%M:%S");
// Define the div for the tooltip
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

    // Add the scatterplot
    svg.selectAll("dot1")  
        .data(raw)     
        .enter().append("circle")               
        .attr("r", 5)   
        .attr('opacity', 0)
        .attr("cx", function(d) { return x(new Date(d.event_time)); })     
        .attr("cy", function(d) { return y(d[id]); })   
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
            div .html(formatTime(new Date(d.event_time)) + "<br/>"  + d[id])  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
        // Add the scatterplot
    svg.selectAll("dot2")  
        .data(compare)     
        .enter().append("circle")               
        .attr("r", 5)   
        .attr('opacity', 0)
        .attr("cx", function(d, i) { return x(d.date); })     
        .attr("cy", function(d) { return y(d.center); })   
        .on("mouseover", function(d, i) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
 //           div .html(formatTime(new Date(start+((i+1)*60*1000))) + "<br/>"  + d)  
            div .html(d.center.toFixed(3))  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });

        var ddata = [];
      var circle =svg.selectAll("dot3")
        .data(ddata)
        .enter().append('circle')
        .attr("r", 5)   
        .attr('opacity', 0.5)
        .attr("cx", function(d) { console.log(d); return x(d.date); })     
        .attr("cy", function(d) { return y(d.value); })   
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", 1);    
            div .html(formatTime(new Date(d.date)) + "<br/>"  + d.value)  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });

    var paths = svg.append('g');

    for (var name in groups) {
      var group = groups[name]     
      group.path = paths.append('path')
      //group.circle = paths.append('circle')
      .data([group.data])
      .attr('class', name + ' group')
      .style('stroke', group.color);
   }
    
  function tick() {       
    now = new Date().getTime();    
    value = liveValue[id];    
    for (var name in groups) {
      var group = groups[name]
        //group.data.push(group.value) // Real values arrive at irregular intervals
        group.value = value
        group.data.push(value)
        group.path.attr('d', line)        
      }      
      ddata.push({ date:now, value:value});            
     x.domain([now-109*60*1000+gap, now+10*60*1000-gap]);
    // Slide paths left
      paths.attr('transform', null)
      .transition()
      .duration(duration)
      .ease('linear')
      .each('end', tick);
   //   .attr('transform', 'translate(' + x(now - (limit) * duration) + ')')         
      if(end<=now){
        console.log('reload');
        window.location.reload(true);
      }     

    }
    tick();  
}


