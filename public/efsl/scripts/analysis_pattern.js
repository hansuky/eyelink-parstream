$(document).ready(function() {
  var dateFormat = 'YYYY-MM-DD';
  $('#sdate').val(moment().format(dateFormat));
  $('#edate').val(moment().format(dateFormat));
  getPatternList();// pattern dataset

  $('#btn_search').on('click', function(){
    d3.selectAll('svg').remove();
    // TODO : pattern group, patterns 박스도 클리어하기
    getPatternList(); // pattern dataset
  });

  $('.statusUpdate').hide();

  $('#btnBatchUpdate').click(function() {
    var nodes =  $('#sample_2').dataTable().fnGetNodes();
    var checkbox = $('input[name=patternChk]:checked', nodes).closest('tr');
    var numOfCheck = checkbox.length;

    if(numOfCheck == 0) {
      alert('There is no checked item');
    } else {
      if(confirm('Do you want to batch update checked ' + numOfCheck + ' patterns ?')){

        var id = $('#lblCreatedDate').text();
        var queryBody = {};
        var fG = $('#lblGroup').text().split(' - ')[0];
        var updateDate = moment().format('YYYY-MM-DD');
        queryBody[fG] = {};
        checkbox.each(function(i) {
          var cN = checkbox[i].cells[1].innerText;
          var sV = $(this).find('td:eq(3)').find('option:selected').val();
          queryBody[fG][cN] = {};
          if ( !isStatusForAllChanged() ) {
            queryBody[fG][cN].status = sV;
          } else {
            queryBody[fG][cN].status = $('#allStatus option:selected').text();
          }
          queryBody[fG][cN].updateDate = updateDate;
        });
        console.log(queryBody);
        modifyPattern(id, queryBody);
      }
    }
  });
});

function getPatternList() {  
  var sdate = $('#sdate').val();
  var edate = $('#edate').val();
  var masterId = 'master';
  var nodeInfo = null;
  var data = { startDate: sdate, endDate: edate, masterId: masterId };
  var in_data = {url: '/analysis/restapi/getAnomalyPatternList', type: 'GET', data: data};
  ajaxTypeData(in_data, function(result){
    console.log('getPatternList[CODE]:', result.rtnCode.code);
    console.log('[getPatternList] result: ',result);
    if (result.rtnCode.code == '0000') {
      drawPatternList(result.rtnData, nodeInfo);
    }
  });
}

///// draw pattern lists /////
function drawPatternList(patternLists, nodeInfo) {
  $('#patternList').empty();
  // rtnData에서 machine.createDatetime 의 로컬타임 기준으로 날짜 추출
  var sb = new StringBuffer();
  patternLists.forEach(function(d) {
      sb.append('<tr><td class="clickPatternId"><a>' + d + '</td></tr>');
  });
  $('#patternList').append(sb.toString());

  // 생성된 패턴ID 클릭 이벤트
  $('.clickPatternId').on('click', function(){
    var creationDate = $(this)[0].innerText || $(this)[0].textContent;
    $('.clickPatternId').css({'color':'', 'font-weight': ''});
    $(this).css({'color':'red', 'font-weight': 'bold'});
    loadPatternData(creationDate, nodeInfo);
  });
}


function loadPatternData(createdDate, nodeInfo) {
  $('#lblCreatedDate').empty();
  $('#lblCreatedDate').append(createdDate);
  $('#lblCreatedDate').hide();
  // $('#lblGroup').empty();
  // $('#lblGroup').append('parent - child node');
  d3.selectAll('svg').remove();
  $('#sample').empty();
  // $('#sample_2').dataTable().fnClearTable();

  if($('#lblCreatedDate').text() == 'master'){
    // $('#btnBatchUpdate').show();
    $('.statusUpdate').show();
  } else {
    // $('#btnBatchUpdate').hide();
    $('.statusUpdate').hide();
  }  
  var data = { id : createdDate };
  var in_data = {url: '/analysis/restapi/getPatterns', type: 'GET', data: data};
  ajaxTypeData(in_data, function(result){
    console.log('loadPatternData[CODE]:', result.rtnCode.code);
    if (result.rtnCode.code == '0000') {
      var d = result.patternData;
      var treeData = sortObject(d);
      drawPatternTree(createdDate, treeData, nodeInfo);
    }
  });
}


function sortObject(obj) {
  var sorted = {};
  Object.keys(obj).sort().forEach(function(key) { sorted[key] = obj[key]; });
  return sorted;
}

function drawPatternTree(creationDate, treeData, nodeInfo) {
  var treeNode = [];
  for(var group in treeData){
    var nodeData = getNodeData(treeData[group], group);
    treeNode.push(nodeData);
  }
  // construct patternTree
  $('#patternTree').treeview({
    levels: 1,
    color: '#428bca',
    showTags: true,
    data: treeNode
  });

  if (nodeInfo != null){
    var nodeText = nodeInfo.href.replace(/#/g,'').split('-');
    drawPatterns(creationDate, nodeText[0], nodeText[1], treeData);
    $('#patternTree').treeview('selectNode', [nodeInfo.nodeId, {silent: true}]);
    if (nodeInfo.parentId != undefined){
      $('#patternTree').treeview('expandNode', [nodeInfo.parentId, {levels:2, silent: true}]);
    }
  }

  /// 노드 선택시 이벤트
  $('#patternTree').on('nodeSelected', function(event, node){
    //$('input[type=checkbox]').attr('checked',true);
    console.log('selected node: ', node.href);
    var nodeText = node.href.replace(/#/g,'').split('-');    
    var parentNode = nodeText[0];
    var childNode = nodeText[1];
    drawPatterns(creationDate, parentNode, childNode, treeData);
    $('#sample_2').dataTable().fnPageChange('first');
  });
}


function getNodeData(treeData, group){
  var normalCnt = 0;
  var cautionCnt =0;
  var anomalyCnt = 0;
  var undefineCnt = 0;
  for(var cno in treeData){
    if (treeData[cno]['status'] === 'normal')       { normalCnt += 1; }
    else if (treeData[cno]['status'] === 'caution') { cautionCnt += 1; }
    else if (treeData[cno]['status'] === 'anomaly') { anomalyCnt += 1; }
    else { undefineCnt += 1; } //undefined
  }
  var totalCnt = normalCnt + cautionCnt + anomalyCnt + undefineCnt;
  var nodeData = {'text': group, href: '#'+ group,
    icon: 'glyphicon glyphicon-copyright-mark',
    tags: [totalCnt],
    nodes: [
      { text: 'normal', href: '#' + group + '-normal', color: 'green', tags: [normalCnt]},
      { text: 'caution', href: '#' + group + '-caution', color: 'blue', tags: [cautionCnt]},
      { text: 'anomaly', href: '#' + group + '-anomaly', color: 'red', tags: [anomalyCnt]},
      { text: 'undefined', href: '#' + group + '-undefined', color: 'gray', tags: [undefineCnt]}
    ]
  };
  return nodeData;
}

function isStatusForAllChanged() {
  var currentStatus = $('#allStatus option:selected').text();
  var defaultStatus = $('#allStatus option:first').text();
  if ( currentStatus != defaultStatus ) return true;
  return false;
}

function drawPatterns(creationDate, parentNode, childNode, patternData){
  d3.selectAll('svg').remove();
  $('#sample').empty();
  $('#lblGroup').text(parentNode);
  console.log(parentNode, childNode, patternData)
  console.log('patternData : ', patternData[parentNode]);
  var selectedNodeData = sortObject(patternData[parentNode]);
  var tableTag = getPatternsData(creationDate, parentNode, childNode, selectedNodeData);

  $('#sample').append(tableTag.toString());
  TableManaged.init();

  ///// Event /////
  // Checkbox event
  $('input[name=chkAll]').click(function(){
    $('input:checkbox').not(this).prop('checked', this.checked); });

  // click event about cluster number in patterns table
  $('#sample_2').on('click', '.clickClustNo', function(){
    d3.selectAll('svg').remove();
    $('#sample_2').DataTable().$('.clickClustNo').css({'color':'', 'font-weight': ''});
    $(this).css({'color':'red', 'font-weight': 'bold'});

    var row = $(this).closest('tr');
    var CN = row[0].cells[1].innerText;
    var masterCN = row[0].cells[2].innerText;
    var tgtCluster = parentNode + '.' + CN + '.center';
    var tgtMaster = parentNode + '.' + masterCN + '.center';
    console.log('[cluster]', CN, '| [master]', masterCN);
    var data = {
      id : creationDate,
      targetCluster : tgtCluster
    };
    console.log(data)
    var in_data = {url: '/analysis/restapi/getClusterPattern', type: 'GET', data: data};

    ajaxTypeData(in_data, function(result) {
      console.log('clusterClick[CODE]: ', result.rtnCode.code);
      console.log('result: ',result);
      if (result.rtnCode.code == '0000') {
        var patternGraph = result.patternData[parentNode][CN]['center'];
        var masterGraph;
        if (result.masterData == null) { masterGraph = null; }
        else { masterGraph = result.masterData[parentNode][masterCN]['center']; }
        var graphData = getGraphData(patternGraph, masterGraph);
        console.log(graphData);
        drawPatternChart(graphData);
      }
    });
  });

  $('[name="status"]').change(function(){
    var checkBox = $(this).closest('tr').find('input');
    checkBox.val(checkBox.prop('checked',true));
    initStatusForAll();

  });

  $('#allStatus').change(function(){
    if ( isStatusForAllChanged() ) {
      $(this).css('background-color', '#8d8');
      $('#sample_2 input[type=checkbox]').prop('checked',true);
    } else {
      $(this).css('background-color', '#ddd');
      $('#sample_2 input[type=checkbox]').prop('checked',false);
    }
  });

  $('input[name=patternChk]').click(function(){

    if ( $(this).prop('checked') == false ){
      $('#chkAll').prop('checked',false);
    } else {
      var $checkBoxes = $('input[name=patternChk]');
      var $checkedBoxes = $('input[name=patternChk]:checked');
      var isAllChecked = ($checkBoxes.length == $checkedBoxes.length);
      if (isAllChecked){
        $('#chkAll').prop('checked',true);
      }else {
        $('#chkAll').prop('checked',false);
      }
    }
  });
}

function pad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function insertNewPattern(id, group, CN, newCN){
  // let step = $('#step option:selected').text();
  // let machine = $('#machine option:selected').text();
  
  var target = group + '.' + CN;

  var data = {id : id, target: target};
  var in_data = {url: '/analysis/restapi/getClusterData', type: 'GET', data: data};
  ajaxTypeData(in_data, function(result){
    console.log('getPatternData[CODE]:', result.rtnCode.code);
    if (result.rtnCode.code == '0000') {
      var d = result.rtnData[group][CN];
      var queryBody = {};
      queryBody[group] = {};
      queryBody[group][newCN] = d;

      let body = {};      
      body.data = queryBody;
      console.log('[insertNewPattern] queryBody: ',queryBody);
      var in_data = {url: '/analysis/restapi/pattern_data/master/_update', type: 'POST', data: body};
      ajaxTypeData(in_data, function(result) {
        if (result.rtnCode.code == 'D001') {
          console.log('insert completed');
          var nodeInfo = $('#patternTree').treeview('getSelected');
          loadPatternData(id, nodeInfo[0]);
        }
      });
    }
  });
}

function modifyPattern(id, data){    
  let body = {};  
  body.data = data;
  var in_data = {url: '/analysis/restapi/pattern_info/' + id + '/_update', type: 'POST', data: body};
  ajaxTypeData(in_data, function(result) {
    if (result.rtnCode.code == 'D002') {
      var nodeInfo = $('#patternTree').treeview('getSelected');
      if (confirm('Successfully updated !!')){
        loadPatternData(id, nodeInfo[0]);
      }
    }
    initStatusForAll();
  });
}
function initStatusForAll(){
  $('#allStatus :nth-child(1)').prop('selected', true);
  $('#allStatus').css('background-color','#ddd');
}
//// 선택된 패턴그룹에 대한 패턴 리스트를 보여준다.
function getPatternsData(patternId, pNode, cNode, nodeData) {
  console.log(pNode, cNode)
  var sb = new StringBuffer();
  sb.append('<div class="portlet-body form"><div class="chart" style="height:auto">');
  sb.append('<table class="table table-striped table-bordered table-hover" id="sample_2">');
  sb.append('<thead><tr><th><input type="checkbox" id="chkAll" name="chkAll"></th>');
  sb.append('<th>Cluster #</th><th>Master C#</th><th>Status</th></tr></thead><tbody>');
  if(cNode == undefined) {
    for (var cno in nodeData){
      var tbTag = statusCheck(patternId, cno, nodeData[cno].masterCN, nodeData[cno].status);
      sb.append(tbTag);
    }
    sb.append('</tbody>');
  } else{
    for (var cno in nodeData){
      if (nodeData[cno].status == cNode) {
        var tbTag = statusCheck(patternId, cno, nodeData[cno].masterCN, nodeData[cno].status);
        sb.append(tbTag);
      }
    }
    sb.append('</tbody>');
  }
  sb.append('</table></div></div>');

  return sb;
}


///// status select option //////
function statusCheck(patternId, cno, masterCN, status) {
  var tag = new StringBuffer();
  var opt = '';

  if (patternId == 'master' || masterCN == 'unknown'){
    tag.append('<tr><td><input type="checkbox" name="patternChk" ></td>');
    tag.append('<td class="clickClustNo"><a>' + cno + '</td>');
    tag.append('<td>' + masterCN + '</td>');
    if (status == 'normal'){
      opt = '<option selected>normal</option><option>caution</option><option>anomaly</option><option>undefined</option></select>';
    } else if (status == 'caution'){
      opt = '<option>normal</option><option selected>caution</option><option>anomaly</option><option>undefined</option></select>';
    } else if (status == 'anomaly') {
      opt = '<option>normal</option><option>caution</option><option selected>anomaly</option><option>undefined</option></select>';
    } else if (status == 'undefined') {
      opt = '<option>normal</option><option>caution</option><option>anomaly</option><option selected>undefined</option></select>';
    }
    tag.append('<td><select name="status">' + opt + '</td></tr>');
  } else {
    tag.append('<tr><td></td>');
    tag.append('<td><a class="clickClustNo">' + cno + '</td>');
    tag.append('<td>' + masterCN + '</td>');
    tag.append('<td>' + status + '</td></tr>');
  }
  return tag;
}

function getGraphData(pData, mData) {
  var graphData = {};
  var pSet = [];
  var mSet = [];

  if (mData == null ){
    for (i=0; i<pData.length; i++) {
      pSet.push({ x : i, y : pData[i]});
    }
  } else {
    for (i=0; i<pData.length; i++) {
      pSet.push({ x : i, y : pData[i]});
      mSet.push({ x : i, y : mData[i]});
    }
  }
  var array;
  if (mData != null){ array = pData.concat(mData); }
  else { array = pData; }

  var minVal = Math.min.apply(null,array);
  var maxVal = Math.max.apply(null,array);

  console.log(minVal, maxVal);
  graphData.pSet = pSet;
  graphData.mSet = mSet;
  graphData.minVal = minVal;
  graphData.maxVal = maxVal;

  return graphData;
}

function drawPatternChart(graphData) {
  var margin = {top: 30, right: 90, bottom: 30, left: 55};
  let chartWidth = $('#patternChart').parent().width();
  // let width = (window.innerWidth*0.32) - margin.left - margin.right;
  let width = chartWidth - margin.right;
  let height = 400 - margin.top;
  var xScale = d3.scale.linear().range([0, width]);
  var yScale = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10);
  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

  var masterLine = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });
  var patternLine = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = d3.select('#patternChart')
      .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.left + margin.bottom)
      .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  xScale.domain([0, d3.max(graphData.pSet, function(d){ return d.x; })]);
  yScale.domain([graphData.minVal-(graphData.maxVal/100), graphData.maxVal+(graphData.maxVal/100)]);

  // Add the X Axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  // Add the Y Axis
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);


  svg.append('path')
      .data([graphData.mSet])
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('opacity', 0.4)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 6)
      .attr('d', masterLine);

  svg.append('path')
      .data([graphData.pSet])
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 2.5)
      .attr('d', patternLine);
}
