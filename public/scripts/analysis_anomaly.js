var liveValue = [];
setInterval(function() { 
  $.ajax({
    url: "/analysis/restapi/getClusterNodeLive" ,
    dataType: "json",
    type: "get",
    data: { },
    success: function(result) {        
      if (result.rtnCode.code == "0000") {                
        if(result.rtnData.length == 1){
          liveValue = result.rtnData[0];            
        } else {
          console.log(new Date());
        }
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });  
}, 5*1000);

function getData(){    
  $.ajax({  
    url: "/analysis/restapi/getAnomalyChartData",
    dataType: "json",
    type: "get",
    data: { },
    success: function(result) {      
      var raw = result.raw;      
      var point = new Date(result.pattern.timestamp).getTime(), start = point -50*60*1000, end = point+10*60*1000;      
      var now = new Date().getTime();      
      if (result.rtnCode.code == "0000") {                                              
        console.log(result);
        drawChart(raw, result.anomaly.vdata, start, end, now, point, now-point, 'voltage', '#voltage', result.pattern, result.pt.vapt, result.pt.vcpt);
        drawChart(raw, result.anomaly.adata, start, end, now, point, now-point, 'ampere', '#ampere', result.pattern, result.pt.aapt, result.pt.acpt);
        drawChart(raw, result.anomaly.apdata, start, end, now, point, now-point, 'active_power', '#active_power', result.pattern, result.pt.apapt, result.pt.apcpt);
        drawChart(raw, result.anomaly.pfdata, start, end, now, point, now-point, 'power_factor', '#power_factor', result.pattern, result.pt.pfapt, result.pt.pfcpt);
        console.log('start\n'+new Date(start));
        console.log('point\n'+new Date(point));
        console.log('now\n'+new Date(now));
        console.log('end\n'+new Date(end));
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

function drawChart(raw, compare, start, end, now, point, gap, id, chart_id, pattern, apt, cpt) {
  oriEnd = end;    
  var limit = 60,    duration = 1000;   
  
  var margin = {top: 10, right: 50, bottom: 30, left: 50},
  width = window.innerWidth*0.88 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;  
  
  if(pattern[id].status == "normal"){
    var color = 'green';    
  } else if(pattern[id].status == "caution"){ 
    var color = 'blue';    
  } else if(pattern[id].status == "anomaly"){   
    var color = 'red';
  } else {
    var color = 'gray';
  }
  
  liveValue = raw[raw.length-1];    
  var groups = {
    output: {
      value: liveValue[id],
      color: 'pink',
      data: d3.range(0).map(function() {
        return 0
      })
    }
  }
  now = new Date(liveValue.event_time).getTime();      

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
      var yStart = 0, yEnd = 180;
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
    .x(function(d, i) { return x(now + i*(duration)) })
    .y(function(d) { return y(d) })

  var valueline = d3.svg.line()
    .x(function(d) { return x(new Date(d.event_time)); })
    .y(function(d) { return y(d[id]); });
  
  var compareline = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d, i) { return x(d.date); })
    .y(function(d) {  return y(d.center);});

  var compareline2 = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d, i) { return x(d.date); })
    .y(function(d) {  return y(d.center2);});

  var compareline3 = d3.svg.line()
    .interpolate("cardinal")
    .x(function(d, i) { return x(d.date); })
    .y(function(d) {  return y(d.center3);});

  var upperOuterArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.max); })
    .y1(function (d) { return y(d.upper); });

  var upperInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.upper); })
    .y1(function (d) { return y(d.center); });

  var lowerInnerArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.center); })
    .y1(function (d) { return y(d.lower); });

  var lowerOuterArea = d3.svg.area()
    .interpolate('basis')
    .x (function (d,i) { return x(d.date); })
    .y0(function (d) { return y(d.lower); })
    .y1(function (d) { return y(d.min); });

  var svg = d3.select(chart_id)
    .append('svg')    
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xaxis = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom'))

  var yaxis = svg.append('g')
    .attr('class', 'y axis')   
    .call(y.axis = d3.svg.axis().scale(y).orient('left'))

  var legendWidth  = 380, legendHeight = 55;

  var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + margin.left + ', 0)');

  legend.append('rect')
    .attr('class', 'legend-bg')
    .attr('width',  legendWidth)
    .attr('height', legendHeight);

  legend.append('rect')
    .attr('class', 'inner')
    .attr('width',  55)
    .attr('height', 15)
    .attr('x', 10)
    .attr('y', 8);

  legend.append('text')
    .attr('x', 103)
    .attr('y', 19)
    .text('lower-upper');

  legend.append('rect')
    .attr('class', 'outer')
    .attr('width',  55)
    .attr('height', 15)
    .attr('x', 10)
    .attr('y', 33);  

  legend.append('text')
    .attr('x', 95)
    .attr('y', 43)
    .text('min-max');

  legend.append('path')
    .attr('class', 'compareline')
    .attr('d', 'M150,15L205,15');

  legend.append('text')
    .attr('x', 230)
    .attr('y', 19)
    .text('Pattern');

  legend.append('path')
    .attr('class', 'valueline')
    .attr('d', 'M150,40L205,40');

  legend.append('text')
    .attr('x', 225)
    .attr('y', 43)
    .text('Data');

    legend.append('path')
    .attr('class', 'compareline2')
    .attr('d', 'M265,15L320,15');

  legend.append('text')
    .attr('x', 348)
    .attr('y', 19)
    .text('Pattern2');

   legend.append('path')
    .attr('class', 'compareline3')
    .attr('d', 'M265,40L320,40');

  legend.append('text')
    .attr('x', 348)
    .attr('y', 43)
    .text('Pattern3');

var statusWidth  = 63, statusHeight = 55;

 var status = svg.append('g')
    .attr('class', 'status')
    .attr('transform', 'translate(' + 500 + ', 0)');

  status.append('rect')
    .attr('class', 'status-bg')
    .attr('width',  statusWidth)
    .attr('height', statusHeight);

    status.append('text')
    .attr('x', 10)
    .attr('y', 15)
    .text(pattern[id].status);

    status.append('circle')    
    .attr('class', 'sign')
    .attr('cy',  34)
    .attr('cx', 32)
    .attr('r', 12)
    .style("fill", color );

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

svg.append('path')
    .datum(compare)     
    .attr('class', 'area upper outer')
    .attr('d', upperOuterArea);
    //.attr('clip-path', 'url(#rect-clip)');

  svg.append('path')
    .datum(compare)     
    .attr('class', 'area lower outer')
    .attr('d', lowerOuterArea)
    .attr('clip-path', 'url(#rect-clip)');

  svg.append("path")   
  .attr("class", "compareline3")   
//   .attr('opacity', 0.5)
  .attr("d", compareline(compare));

  svg.append("path")   
  .attr("class", "compareline2")   
//   .attr('opacity', 0.5)
  .attr("d", compareline(compare));

  svg.append("path")     
  .attr("class", "compareline")   
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

     var circle =svg.selectAll("dot4")
        .data(cpt)
        .enter().append('circle')
        .attr("r", 3)   
        .attr('opacity', 1)
        .attr("cx", function(d) { return x(d.date); })     
        .attr("cy", function(d) { return y(d.value); })   
        .attr('class', 'cpt')
        .attr("fill", "blue")
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)                    
                .style("opacity", 1)
                .style("fill", "yellow");    
            div .html('caution</br>'+d.value)  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });   

       var circle =svg.selectAll("dot5")
        .data(apt)
        .attr('class', 'apt')
        .enter().append('circle')
        .attr("r", 3)   
        .attr('opacity', 0.1)
        .attr("cx", function(d) { console.log(d); return x(d.date); })     
        .attr("cy", function(d) { return y(d.value); })   
        .attr("fill", "red")
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)                    
                .style("opacity", 1);    
            div .html('anomaly</br>'+d.value)  
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
  
  oriNow = now;
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
    var d = ddata[ddata.length-1];
    //console.log(new Date(d.date));            
   x.domain([now-50*60*1000+gap, now+10*60*1000-gap]);     
   //console.log(new Date(now-50*60*1000+gap), new Date(now+10*60*1000-gap));     
   //x.domain([start,end]);
  // Slide paths left
    paths.attr('transform', null)
    .transition()
    .duration(duration)
    .ease('linear')
    .each('end', tick);
   //   .attr('transform', 'translate(' + x(now - (limit) * duration) + ')')         
    if(oriEnd<=now){
       if(now > oriEnd+3*60*1000) {
              console.log('reload');
             // window.location.reload(true);
      }
      if(now >= (end+2*60*1000)){
        end += 2*60*1000;
      }
      if((oriEnd-end) < 10*1000) {
        oriNow = now;        
        $.ajax({
          url: "/analysis/restapi/getAnomalyPatternCheck/",
          dataType: "json",
          type: "get",
          data: {},
          success: function(result) {            
            console.log(result.rtnCode.message);            
            if (result.rtnCode.code == "0000") {                                                      
                console.log('reload');
                window.location.reload(true);

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
    }
  }
  tick();  
}
var cnt = 0, oriEnd = 0, oriNow = 0;

