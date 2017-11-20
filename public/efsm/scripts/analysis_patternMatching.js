$(document).ready(function() {
  var dateFormat = 'YYYY-MM-DD HH:mm';
  $('#baseTime').val(moment().format(dateFormat));
  getMatchingList(); // pattern dataset


  $('#btn_search').click(function() {
    d3.selectAll("svg").remove();        
    getMatchingList(); // pattern dataset
  });

  $('#baseTime').datetimepicker({
    format: 'yyyy-mm-dd hh:ii',
    autoclose: true,
    todayBtn: true,
    pickerPosition: "bottom-left"
  });
  // Click creation date
  clickLinkFunc = function(link) {
    $('#tblPatterns > tbody').empty();
    d3.selectAll("svg").remove();
    var creationDate = link.innerText || link.textContent;
    //$('#creationDate').val(creationDate);
    $("#lblCreatedDate").empty();
    $("#lblCreatedDate").append(creationDate);

    console.log(creationDate);
    d3.selectAll("svg").remove();
    loadPatternData(creationDate);
  };

  // getPatternList();  

  //Metronic.init(); // init metronic core componets
  //eyelinkLayout.init(); // init eyelinklayout
  // QuickSidebar.init(); // init quick sidebar
  // Layout.init(); // init layout
  // Demo.init(); // init index page
  // ComponentsPickers.init();
  TableManaged.init();
  // ComponentsDropdowns.init();
});



// 날짜 변환 함수
function dateConvert(date){ 
  function pad(num) {
    num = num + '';
    return num.length < 2 ? '0' + num : num;
  }
  return date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":00"
}


function getMatchingList() {
  var basetime = $('#baseTime').val() + ':59';
  var timeRange = $('select[name=timeRange').val();
  var startDt = new Date(Date.parse(basetime) - (1000*60*timeRange));
  var endDt = new Date(Date.parse(basetime) + (1000*60*timeRange));
  var stime = String(dateConvert(startDt));
  var etime = String(dateConvert(endDt));
  console.log('%s, %s', stime, etime);
  var data = { startDate: stime, endDate: etime };
  var in_data = { url: "/analysis/restapi/getAnomaly_Pattern", type: "GET", data:data};
  ajaxTypeData(in_data, function(result){
    console.log('getPatternList[CODE]:', result.rtnCode.code);
    if (result.rtnCode.code == "0000") {
      var matchingList = result.rtnData;
      console.log(matchingList);
      drawMatchingHistory(matchingList);
    }
  });
        //test(matchingList);
}

function test(matchingList){
  var testdata = [];

  matchingList.forEach(function(d) {
    d = d._source.analysis;
    testdata.push(d);
  });
  console.log("tetset");
  console.log(testdata);

  //$('#matchingList').empty();
  $('#matchingList').DataTable({
    data : testdata,
    "columns" : [
      {title: "matching time", data: "timestamp"},
      {title: "voltage", data: "voltage_status",
        render: function(data, type, row, meta){
          if(type == 'display'){
            data = '<a href="#" class="clickV">' + data + '</a>';
          }
          return data;
        }
      },
      {title: "ampere", data: "ampere_status",
        render: function(data, type, row, meta){
          if(type == 'display'){
            data = '<a href="#" class="clickA">' + data + '</a>';
          }
          return data;
        }
      },
      {title: "active_power", data: "active_power_status",
        render: function(data, type, row, meta){
          if(type == 'display'){
            data = '<a href="#" class="clickAP">' + data + '</a>';
          }
          return data;
        }
      },
      {title: "power_factor", data: "power_factor_status",
        render: function(data, type, row, meta){
          if(type == 'display'){
            data = '<a href="#" class="clickPF">' + data + '</a>';
          }
          return data;
        }
      },
      {title: "v_cluster", data: "voltage"},
      {title: "a_cluster", data: "ampere"},
      {title: "ap_cluster", data: "active_power"},
      {title: "pf_cluster", data: "power_factor"}
    ],
    "columnDefs": [
      {"targets": [5,6,7,8], "visible": false}
    ]
  });
}

function drawMatchingHistory(matchingList) {
  "use strict";
  var seatvar = document.getElementsByClassName("matchingList");
  var cnt = 0;
  $('#matchingList').empty();
  var sb = new StringBuffer();
  matchingList.forEach(function(d) {
    d = d._source.analysis;
    var listkey = d.timestamp.replace('T', ' ');
    if(cnt == 0) {
      var headTag = '<thead><tr>' +
        '<th style="text-align:center"> Matching time </th>' +
        '<th style="text-align:center"> voltage </th>' +
        '<th style="text-align:center"> ampere </th>' +
        '<th style="text-align:center"> active_power </th>' +
        '<th style="text-align:center"> power_factor </th>' +
        // '<th style="display:none;"> v_status </th>' +
        // '<th style="display:none;"> a_status </th>' +
        // '<th style="display:none;"> ap_status </th>' +
        // '<th style="display:none;"> pf_status </th>' +
        '</tr></thead>';
      sb.append(headTag);
      sb.append('<tbody class="matchingListBody">');
      cnt++;
    }
    var preTag = '<td style="text-align:center"><a onclick="javascript_:clickPattern('
    var dataTag = '<tr><td style="text-align:center">' + listkey +'</td>' +
      preTag + "'voltage'," + "'" + d.timestamp + "','" + d.voltage+ "'" + ')">' + d.voltage_status +'</td>' +
      preTag + "'ampere'," + "'" + d.timestamp + "','" + d.ampere+ "'" + ')">' + d.ampere_status +'</td>' +
      preTag + "'active_power'," + "'" + d.timestamp + "','" + d.active_power+ "'" + ')">' + d.active_power_status +'</td>' +
      preTag + "'power_factor'," + "'" + d.timestamp + "','" + d.power_factor+ "'" + ')">' + d.power_factor_status +'</td>' +
      '</tr>';
    sb.append(dataTag);
  });
  sb.append("</tbody>");
  $('#matchingList').append(sb.toString());
}

function clickPattern(factor,timestamp,clusterNo){
  console.log(factor, timestamp, clusterNo);
  var creationDate = timestamp.split('T')[0];
  var target = "pattern_data." + factor + ".center." + clusterNo;
  var data = {id : creationDate, target : target};
  var in_data = { url : "/analysis/restapi/getClusterPattern", type : "GET", data : data };  
  ajaxTypeData(in_data, function(result){  
    if (result.rtnCode.code == "0000") {
      console.log(result);
      var matchData = result.rtnData.pattern_data[factor]['center'][clusterNo];
      console.log(matchData);
      // var pCenter = result.rtnData.pattern_data[factor]['center'][clusterNo];
      // var pMin = result.rtnData.pattern_data[factor]['min_value'][clusterNo];
      // var pMax = result.rtnData.pattern_data[factor]['max_value'][clusterNo];
      // var pLower = result.rtnData.pattern_data[factor]['lower'][clusterNo];
      // var pUpper = result.rtnData.pattern_data[factor]['upper'][clusterNo];
      // console.log(pCenter, pMin, pMax, pLower, pUpper);

      // var listVal = [];
      // listVal.push(Math.max.apply(Math, pCenter));
      // listVal.push(Math.min.apply(Math, pCenter));
      // listVal.push(Math.max.apply(Math, pMax));
      // listVal.push(Math.min.apply(Math, pMin));

      var minval = Math.min.apply(Math, matchData);
      var maxval = Math.max.apply(Math, matchData);
      var stime = new Date(Date.parse(timestamp) - (1000*60*110));
      var set = [];
      console.log(stime);

      for(i=0; i<matchData.length; i++){
        set.push({ind : i, x : stime-(i-120)*60*1000, y : matchData[i]});
      }

      console.log(set);

      d3.selectAll("svg").remove();
      drawPatternChart(stime, set, minval, maxval);
    } else {
      console.log("failure!!!!!!!");
    }  
  });
}

function drawPatternChart(stime, matchData, minval, maxval){
  var etime = new Date(Date.parse(stime) + (1000*60*120));

  console.log(stime, etime);
  // var timeRange = $('select[name=timeRange').val();
  // var startDt = new Date(Date.parse(basetime) - (1000*60*timeRange));
  // var endDt = new Date(Date.parse(basetime) + (1000*60*timeRange));
  // var stime = dateConvert(startDt)
  // var etime = dateConvert(endDt)
  // var stime = new Data(parseInt)

  //////////////////////////////
  var margin = {top: 10, right: 20, bottom: 20, left: 40},
    width = (window.innerWidth*0.44) - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var xScale = d3.time.scale()
    .domain([stime, etime])
    .range([0, width]);


  var yScale = d3.scale.linear()
    .domain([0, maxval])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = d3.select("#patternChart")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.left + margin.bottom)
      .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    

  // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("path")
        .data([matchData])
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", line);
}

