$(function(){
  $('#btn_search').on('click', function(){
    d3.selectAll("svg").remove();
    getPatternList(); // pattern dataset
  });

  // 업데이트 버튼 클릭 이벤트
  // $('#btnCheckedUpdate').on('click', function(){
  //   var checkbox = $("input[name=patternChk]:checked");
  //   var numOfCheck = $("input[name=patternChk]:checked").length;
  //   console.log(numOfCheck);
  //   if(numOfCheck == 0) {
  //         console.log("There is no checked item");
  //   } else {
  //     updatePatternData()
  //   }

  // });

});

// function updatePatternDate(checkedYN, numOfCheck, queryBody){

// }


function getPatternList() {
  "use strict";
  var sdate = $('#sdate').val() + "T00:00:00";
  var edate = $('#edate').val() + "T23:59:59";
  var masterId = "master";
  var nodeInfo = null;
  console.log("sDate : %s, eDate : %s", sdate, edate);
  $.ajax({
    url: "/analysis/restapi/getAnomalyPatternList" ,
    dataType: "json", type: "get",
    data: { startDate:sdate, endDate:edate, masterId:masterId },
    success: function(result) {
      if (result.rtnCode.code == "0000") {
        var patternLists = result.rtnData;
        drawPatternList(patternLists, nodeInfo);
      }
    },
    error: function(req, status, err) {
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
}


///// draw pattern lists /////
function drawPatternList(patternLists, nodeInfo) {
  "use strict";
  console.log("patternLists : ", patternLists);
  var seatvar = document.getElementsByClassName("patternList");
  $('#patternList').empty();
  var createdDate = patternLists[0]._id;
  patternLists.forEach(function(d) {
    d = d._id;
    var sb = new StringBuffer();
    if (d == 'master'){
      sb.append('<tr><th style="font-weight:bold"><a onclick="clickLinkFunc(this)">' + d + '</th></tr>');
    } else {
      sb.append('<tr><td><a onclick="clickLinkFunc(this)">' + d +'</td>');
    }
    $('#patternList').append(sb.toString());
  });
  $("#lblCreatedDate").empty();
  $("#lblCreatedDate").append(createdDate);
  loadPatternData(createdDate, nodeInfo);
}


function loadPatternData(creationDate, nodeInfo) {
  "use strict";
  $.ajax({
    url: "/analysis/restapi/getPatterns" ,
    dataType: "json", type: "get",
    data: {id : creationDate},
    success: function(result) {
      if (result.rtnCode.code == "0000") {
        console.log("getPatterns data : ", result);
        var d = (result.rtnData.pattern_info);
      }
      var sortedData = sortObject(d);
      drawPatternTree(creationDate, sortedData, nodeInfo);
    },
    error: function(req, status, err) {
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
}


function sortObject(obj) {
  "use strict";
  var sorted = {};
  Object.keys(obj).sort().forEach( function(key) {
    sorted[key] = obj[key];
  });
  return sorted;
}


function drawPatternTree(creationDate, treeData, nodeInfo){
  "use strict";
  var treeNode = [];
  for(var group in treeData){
    if (group != 'creation_Date'){
      var nodeData = getNodeData(treeData[group], group);
      treeNode.push(nodeData);
    }
  }
  // construct patternTree
  $('#patternTree').treeview({
    levels: 1,
    color: '#428bca',
    showTags: true,
    data: treeNode
  });

  /// 노트 선택시 이벤트
  $('#patternTree').on('nodeSelected', function(event, node){
    console.log(node.href + ' is selected');
    var nodeText = node.href.replace(/#/g,'');
    var nodeText = nodeText.split('-');
    var parentNode = nodeText[0];
    var childNode = nodeText[1];
    drawPatterns(creationDate, parentNode, childNode, treeData);
  });

  if (nodeInfo != null){
    var nodeText = nodeInfo.href.replace(/#/g,'').split('-');
    drawPatterns(creationDate, nodeText[0], nodeText[1], treeData);
    $('#patternTree').treeview('selectNode', [nodeInfo.nodeId, {silent: true}]);
    if (nodeInfo.parentId != undefined){
      $('#patternTree').treeview('expandNode', [nodeInfo.parentId, {levels:2, silent: true}]);
    }
  }
}


function getNodeData(treeData, group){
  "use strict";
  var normalCnt = 0;
  var cautionCnt =0;
  var anomalyCnt = 0;
  var undefineCnt = 0;
  for(var cno in treeData){
    if (treeData[cno] === "normal")       { normalCnt += 1; }
    else if (treeData[cno] === "caution") { cautionCnt += 1; }
    else if (treeData[cno] === "anomaly") { anomalyCnt += 1; }
    else { undefineCnt += 1; } //undefined
  }
  var totalCnt = normalCnt + cautionCnt + anomalyCnt + undefineCnt;

  var nodeData = {'text': group, href: '#'+ group,
    icon: "glyphicon glyphicon-copyright-mark",
    tags: [totalCnt],
    nodes: [
      { text: "normal", href: '#' + group + '-normal', color: "green", tags: [normalCnt]},
      { text: "caution", href: '#' + group + '-caution', color: "blue", tags: [cautionCnt]},
      { text: "anomaly", href: '#' + group + '-anomaly', color: "red", tags: [anomalyCnt]},
      { text: "undefined", href: '#' + group + '-undefined', color: "gray", tags: [undefineCnt]}
    ]
  };
  return nodeData;
}


//// 선택된 패턴그룹에 대한 패턴 리스트를 보여준다.
function drawPatterns(creationDate, parentNode, childNode, patternData) {
  var parentNodeData = sortObject(patternData[parentNode]);
  d3.selectAll("svg").remove();
  var seatvar = document.getElementsByClassName("tblPatterns");
  var cnt = 0
  $('#tblPatterns').empty();
  //console.log(typeof(patternData));
  var sb = new StringBuffer();
  var headTag = '<thead><tr>' +
    '<th style="text-align:center"><input type="checkbox" name="chkAll" ></th>' +
    '<th style="text-align:center"> Group </th>' +
    '<th style="text-align:center"> Cluster No. </th>' +
    '<th width=0 style="text-align:center"> Status </th>' +
    '<th style="text-align:center"></th>' +
  '</tr></thead>';
  sb.append(headTag);
  sb.append('<tbody class="patternBody">');

  if(childNode == undefined) {
    for (cno in parentNodeData){
      var selectTag = statusCheck(parentNodeData[cno]);
      if (parentNodeData[cno] == "undefined"){
        var dataTag = '<tr><td><input type="checkbox" name="patternChk" ></td>'+
          '<td>' + parentNode + '</td>' +
          '<td><a href="#" class="clickPattern">' + cno + '</td>' +
          '<td><select name="status" class="form-control input-small select2me form-md-line-input">' +
          selectTag + '</td>' +
          '<td><input type="button" class="updateBtn" value="update" /></td></tr>';
        sb.append(dataTag);
      } else {
        var dataTag = '<tr><td></td><td>' + parentNode + '</td>' +
          '<td><a href="#" class="clickPattern">' + cno + '</td>' +
          '<td>' + selectTag + '</td><td></td></tr>';
        sb.append(dataTag);
      }
    }
    sb.append("</tbody>");
  }
  else{
    for (cno in parentNodeData){
      if (parentNodeData[cno] == childNode) {
        var selectTag = statusCheck(parentNodeData[cno]);
        if (parentNodeData[cno] == "undefined"){
          var dataTag = '<tr><td><input type="checkbox" name="patternChk" ></td>'+
            '<td>' + parentNode + '</td>' +
            '<td><a href="#" class="clickPattern">' + cno + '</td>' +
            '<td><select name="status" class="form-control input-small select2me form-md-line-input">' +
            selectTag + '</td>' +
            '<td><input type="button" class="updateBtn" value="update" /></td></tr>';
          sb.append(dataTag);
        } else {
          var dataTag = '<tr><td></td><td>' + parentNode + '</td>' +
            '<td><a href="#" class="clickPattern">' + cno + '</td>' +
            '<td>' + selectTag + '</td><td></td></tr>';
          sb.append(dataTag);
        }
      }
    }
    sb.append("</tbody>");
  }
  $('#tblPatterns').append(sb.toString());

  /// Event ///
  $('input[name=chkAll]').click(function(){
    $('input:checkbox').not(this).prop('checked', this.checked);
  });

  /// update button click event ///
  $(".updateBtn").click(function(){
    var updateBtn = $(this);
    var td = updateBtn.parent().parent().children();
    console.log(td.eq(1).text());
    console.log(updateBtn.closest("tr"));

    if(confirm("수정 하시겠습니까?")) {
      var id = creationDate;
      var queryBody = {};
      var fG = td.eq(1).text();           // Factor Group
      var cN = td.eq(2).text();           // cluster No
      var sV = td.eq(3).children().val(); // status Value
      queryBody[fG] = {};
      queryBody[fG][cN] = sV;
      
      $.ajax({
        url: "/analysis/restapi/pattern_info/" + id + "/_update",
        dataType: "json", type: "POST", data: queryBody,
        success: function(result) {
          console.log("result: ", result);
          alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
          if (result.rtnCode.code == "D002") {
            // pattern tree data reload
            var nodeInfo = $('#patternTree').treeview('getSelected');
            loadPatternData(id, nodeInfo[0]);
          }
        },
        error: function(req, status, err) {
          $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
        }
      });
    }
  });

  $('.clickPattern').click(function(){
    var id = creationDate;
    var clickPattern = $(this);
    var td = clickPattern.parent().parent().children();

    var factGroup = td.eq(1).text();
    var clusterNo = td.eq(2).text();
    var target = "pattern_data." + factGroup + "." + clusterNo + ".center";

    //var state = td.eq(3).text();
    console.log(target);

    $.ajax({
      url: "/analysis/restapi/getClusterPattern" ,
      dataType: "json",
      type: "get",
      data: {id : creationDate, target : target},
      success: function(result) {
        if (result.rtnCode.code == "0000") {
          console.log(result);
          var d = result.rtnData.pattern_data;
          var graphData = d[factGroup][clusterNo]["center"];
          var set = [];
          var maxval = 0;
          var minval = 1000;

          console.log(graphData);
          for(i=0; i<graphData.length; i++){
            set.push({ x : i, y : graphData[i]});
            if(graphData[i] > maxval){
              maxval = graphData[i];
            }
            else if(graphData[i] < minval){
              minval = graphData[i];
            }
          };
          console.log(set);
          console.log(minval, maxval);

          d3.selectAll("svg").remove();
          drawPatternChart(set, minval, maxval);
        } else {

        }
      },
      error: function(req, status, err) {
        //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
      }
    });
  });
}

///// status select option //////
function statusCheck(statechk) {
  var optionTag;
  if (statechk === 'undefined') {
    optionTag = '<option value="normal">normal</option>' +
      '<option value="caution">caution</option>' +
      '<option value="anomaly">anomaly</option>' +
      '<option value="undefined" selected>undefined</option></select>'
  } else {
    optionTag = statechk;
  }
  return optionTag;
}
// function updateCheckedAll() {
// }

function drawPatternChart(dataset, minval, maxval) {
  // 그래프를 그려야 함!!!!!
  var margin = {top: 10, right: 20, bottom: 20, left: 40},
    width = (window.innerWidth*0.3) - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var xScale = d3.scale.linear().range([0, width]);

  var yScale = d3.scale.linear().range([height, 0]);

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
    xScale.domain([0, d3.max(dataset, function(d){ return d.x; })]);
    yScale.domain([0, d3.max(dataset, function(d){ return d.y; })]);

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
        .data([dataset])
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", line);
}


