$(document).ready(function(e) {
  getData();

  $('#selections.select').change(function(){
    // TODO : 전체 차트 refresh
    getData();
  });
});

const past = 55*60*1000;
const future = 5*60*1000
const dataCntPerTick = 10;

var liveValue = [];
setInterval(function() {
  let step = $('#step option:selected').text();
  let machine = $('#machine option:selected').text();
  var in_data = { url : "/analysis/restapi/getOeeDataLive", type : "GET", data : {step:step, machine:machine} };
  ajaxTypeData(in_data, function(result){
    if (result.rtnCode.code == "0000") {
      // TODO : 라이브 데이터를 10초에 한번 10건씩 조회하긴하는데 그 중 한개만 사용 중, 10개를 다음 데이터 읽어오기 전까지 하나씩 찍어주어야 하는데...
      if(result.rtnData.length > 0){
        liveValue = result.rtnData[0];

      }
    }
  });
}, dataCntPerTick*1000);


function getData(){
  let step = $('#step option:selected').text();
  let machine = $('#machine option:selected').text();

  var in_data = { url : "/analysis/restapi/getOeeChartData", type : "GET", data : {step:step, machine:machine} };
  ajaxTypeData(in_data, function(result){
    // console.log(result);
    if (result.rtnCode.code == "0000") {
      var raw = result.raw;
      var point = new Date(raw[0].dtSensed).getTime(), start = point-past, end = point+future;
      // var now = new Date().getTime();
      var now = point;
      var tot = { "overall_oee" : [], "availability" : [], "quality" : [], "performance" : []  };

      for(factor in tot){
        drawChart(raw, result.tot[factor], start, end, now, point, now-point, factor, '#'+factor, result.pattern, step, machine);
        // drawChart(raw, 'result.tot[factor]', start, end, now, point, now-point, factor, '#'+factor, 'result.pattern');
      }
      // console.log('point\n'+new Date(point));
      // console.log('start\n'+new Date(start));
      // console.log('end\n'+new Date(end));
      // console.log('now\n'+new Date(now));
    }
  });
}

function drawChart(raw, tot, start, end, now, point, gap, factor, chart_id, pattern, step, machine) {

  var step = step;
  var cid = machine;
  var compare = tot.data;
  var apt = tot.apt;
  var cpt = tot.cpt;

  let oriEnd = end;
  var limit = 60,    duration = 1000;

  var color = 'green';
  if(pattern[factor].status.status == "normal"){
    var color = 'green';
  } else if(pattern[factor].status.status == "caution"){
    var color = 'blue';
  } else if(pattern[factor].status.status == "anomaly"){
    var color = 'red';
  } else {
    var color = 'gray';
  }

  liveValue = raw[0];
  console.log('liveValue: ',liveValue);

  var margin = {top: 10, right: 50, bottom: 30, left: 50};
  // width = window.innerWidth*0.88 - margin.left - margin.right,
  let chartWidth = $('#overall_oee').parent().width();
  let width = chartWidth - margin.left - margin.right;
  let height = 250 - margin.top - margin.bottom;

  // X 축 범위 설정
  var x = d3.time.scale()
    .domain([start, end])
    .range([0, width]);

  // Y 축 범위 설정
  let yStart = (tot.min * 100 * 0.5);
  let yEnd = (tot.max * 100 * 1.2);
  // yStart = 0;
  // yEnd = 125; // TODO : 위 자동 계산 식 이용하기
  var y = d3.scale.linear()
    .domain([yStart, yEnd])
    .range([height, 3]);

  now = new Date(liveValue.dtSensed).getTime();
  var lineFunction = d3.svg.line()
    .interpolate('basis')
    .x(function(d, i) { return x(now + i*(duration)); })
    .y(function(d) { return y(d); })

  var valuelineFunction = d3.svg.line()
    .interpolate('basis')
    .x(function(d) { return x(new Date(d.dtSensed)); })
    .y(function(d) { return y(d[factor]); });

  var compareline = setLine(d3, x, y, "cardinal", "date", "center");
  var compareline2 = setLine(d3, x, y, "cardinal", "date", "center2");
  var compareline3 = setLine(d3, x, y, "cardinal", "date", "center3");

  var upperOuterArea = setArea(d3, x, y, "basis", "date", "max", "upper");
  var upperInnerArea = setArea(d3, x, y, "basis", "date", "upper", "center");
  var lowerInnerArea = setArea(d3, x, y, "basis", "date", "center", "lower");
  var lowerOuterArea = setArea(d3, x, y, "basis", "date", "lower", "min");

  var svg = d3.select(chart_id)
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xaxis = svgSet(svg, 'g', 'x axis', 0, height)
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.time.format("%H:%M")));

  var yaxis = svg.append('g')
    .attr('class', 'y axis')
    .call(y.axis = d3.svg.axis().scale(y).orient('left'));

  var legendWidth  = 385, legendHeight = 55;
  var legend = svgSet(svg, 'g', 'legend', margin.left , 0);

  rectLegendBG(legend, 'legend-bg', legendWidth, legendHeight);

  rectLegend(legend, 'inner', 55, 15, 10, 8);
  textLegend(legend, 75, 19, 'lower-upper');

  rectLegend(legend, 'outer', 55, 15, 10, 33);
  textLegend(legend, 75, 43, 'min-max');

  pathLegend(legend, 'compareline', 'M150,15L205,15');
  textLegend(legend, 215, 19, 'Pattern');

  pathLegend(legend, 'valueline', 'M150,40L205,40');
  textLegend(legend, 215, 43, 'Data');

  pathLegend(legend, 'compareline2', 'M265,15L320,15');
  textLegend(legend, 330, 19, 'Pattern2');

  pathLegend(legend, 'compareline3', 'M265,40L320,40');
  textLegend(legend, 330, 43, 'Pattern3');

  var statusWidth  = 63, statusHeight = 55;

  var status = svgSet(svg, 'g', 'status', 500 , 0);

  rectLegendBG(status, 'status-bg', statusWidth, statusHeight);
  // console.log(pattern[factor].status.status.length  )
  var length = (pattern[factor].status.status.length<8)?pattern[factor].status.status.length:pattern[factor].status.status.length*1.3;
  textLegend(status, 20-length, 15, pattern[factor].status.status);
  // textLegend(status, 20-'normal'.length, 15, 'normal');

  status.append('circle')
    .attr('class', 'sign')
    .attr('cy',  34)
    .attr('cx', 32)
    .attr('r', 12)
    .style("fill", color );

  svgPath(svg, compare, 'area upper inner', upperInnerArea);
  svgPath(svg, compare, 'area lower inner', lowerInnerArea);
  svgPath(svg, compare, 'area upper outer', upperOuterArea);
  svgPath(svg, compare, 'area lower outer', lowerOuterArea);

  svgPath(svg, compare, 'compareline3', compareline);
  svgPath(svg, compare, 'compareline2', compareline);
  svgPath(svg, compare, 'compareline', compareline);

  svgPath(svg, raw, 'valueline', valuelineFunction);

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var formatTime = d3.time.format("%H:%M:%S");
  // Add the scatterplot
  svg.selectAll("dot1")
    .data(raw)
    .enter().append("circle")
    .attr("r", 5)
    .attr('opacity', 0)
    .attr("cx", function(d) { return x(new Date(d.dtSensed)); })
    .attr("cy", function(d) { return y(d[factor]); })
    .on("mouseover", function(d) {
      divTransition(div, 200, 1);
      div .html(formatTime(new Date(d.dtSensed)) + "<br/>"  + d[factor])
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        divTransition(div, 500, 0);
    });
      // Add the scatterplot
  svgCircle(svg, x, y, compare, "dot2", 5, 0, "date", "center")
    .on("mouseover", function(d, i) {
      divTransition(div, 200, 1);
      div .html(d.center.toFixed(3))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
         divTransition(div, 500, 0);
    });

  var ddata = [];
  var circle = svgCircle(svg, x, y, ddata, "dot3", 5, 0.5, "date", "value")
    .on("mouseover", function(d) {
      divTransition(div, 200, 1);
      div .html(formatTime(new Date(d.date)) + "<br/>"  + d.value)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        divTransition(div, 500, 0);
    });

   var circle = svgCircle(svg, x, y, cpt, "dot4", 3, 1, "date", "value")
    .attr('class', 'cpt')
    .attr("fill", "blue")
    .on("mouseover", function(d) {
      divTransition(div, 200, 1).style("fill", "yellow");
      div .html('caution</br>'+d.value)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      divTransition(div, 500, 0);
    });

  var circle = svgCircle(svg, x, y, apt, "dot5", 3, 0.1, "date", "value")
    .attr('class', 'apt')
    .attr("fill", "red")
    .on("mouseover", function(d) {
      divTransition(div, 200, 1);
      div .html('anomaly</br>'+d.value)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      divTransition(div, 500, 0);
    });

  var paths = svg.append('g');

  var groups = {
    output: {
      value: liveValue[factor],
      color: 'black',
      data: d3.range(0).map(function() {
        return 0
      })
    }
  }

  for (var name in groups) {
    var group = groups[name];
    group.path = paths.append('path')
      .data([group.data])
      .attr('class', name + ' group')
      .style('stroke', group.color);
  }

  let oriNow = now;

  function tick() {
    now = new Date().getTime();
    value = liveValue[factor];
    for (var name in groups) {
      var group = groups[name];
      group.value = value;
      group.data.push(value) // Real values arrive at irregular intervals
      group.path.attr('d', lineFunction);
    }
    ddata.push({ date:now, value:value});
    var d = ddata[ddata.length-1];

    x.domain([now-past+gap, now+future-gap]);

    // Slide paths left
    paths.attr('transform', null)
      .transition()
      .duration(duration)
      .ease('linear')
      // 트랜지션이 끝나는 시점에 동작할 내역(call back)
      .each('end', tick);

    //.attr('transform', 'translate(' + x(now - (limit) * duration) + ')')
    if(oriEnd<=now){
      if(now > oriEnd+3*60*1000) {
        window.location.reload(true);
      }
      if(now >= (end+2*60*1000)){
        end += 2*60*1000;
      }
      if((oriEnd-end) < 10*1000) {
        oriNow = now;
        var in_data = { url : "/analysis/restapi/getAnomalyPatternCheck/", type : "GET", data : {step:step, machine:cid} };
        ajaxTypeData(in_data, function(result){
          console.log(result.rtnCode.message);
          if (result.rtnCode.code == "0000") {
            console.log('reload');
            window.location.reload(true);
          }
        });
      }
    }
  }
  tick();
}

function setLine(d3, x, y, type, key1, key2) {
  return d3.svg.line()
    .interpolate(type)
    .x(function(d, i) { return x(d[key1]); })
    .y(function(d) { return y(d[key2]); })
}

function setArea(d3, x, y, type, key1, key2, key3) {
  return d3.svg.area()
    .interpolate(type)
    .x (function (d,i) { return x(d[key1]); })
    .y0(function (d) { return y(d[key2]); })
    .y1(function (d) { return y(d[key3]); })
}

function rectLegend(legend, className, width, height, x, y) {
  return legend
    .append('rect')
    .attr('class', className)
    .attr('width', width)
    .attr('height', height)
    .attr('x', x)
    .attr('y', y)
}

function rectLegendBG(legend, className, width, height) {
  return legend
    .append('rect')
    .attr('class', className)
    .attr('width', width)
    .attr('height', height)
}

function textLegend(legend, x, y, text){
  return legend
    .append('text')
    .attr('x', x)
    .attr('y', y)
    .text(text)
}

function pathLegend(legend, className, d) {
  return legend
    .append('path')
    .attr('class', className)
    .attr('d', d);
}

function svgSet(svg, append, className, tX, tY){
  return svg
    .append(append)
    .attr('class', className)
    .attr('transform', 'translate('+tX+','+tY+')');
}

function svgPath(svg, data, className, d){
  return svg
    .append('path')
    .datum(data)
    .attr('class', className)
    .attr('d', d)
}

function svgCircle(svg, x, y, data, className, r, opacity, cx, cy) {
  return svg
    .selectAll(className)
    .data(data)
    .enter().append("circle")
    .attr("r", r)
    .attr('opacity', opacity)
    .attr("cx", function(d, i) { return x(d[cx]); })
    .attr("cy", function(d) { return y(d[cy]*100); })
}

function divTransition(div, duration, opacity){
  return div
    .transition()
    .duration(duration)
    .style("opacity", opacity)
}
function jsonConcat(o1, o2) {
 for (var key in o2) {
  o1[key] = o2[key];
 }
 return o1;
}