$(document).ready(function() {                          
  var dateFormat = 'YYYY-MM-DD';
  $('#sdate').val(moment().subtract(4,'days').format(dateFormat));
  $('#edate').val(moment().format(dateFormat));

  // time series char를 그린다.
  drawChart();
  $('#btn_search').click(function() {
    drawChart();
  });
});  

function drawMarkerSelect2(ndx, data, mapMarkerChart, mapPieChart) {
  // console.log(data);
  var dimGeo = ndx.dimension(function(d) { return d.geo; });
  var dimGeoGroup = dimGeo.group().reduceCount();
  console.log('dimGeoGroup : %s', dimGeoGroup.size());
  // console.log($('#bubble-map .map'));
  mapMarkerChart
    .width(window.innerWidth*0.35)
    .height((window.innerWidth*0.4)*0.5)
    .dimension(dimGeo)
    .group(dimGeoGroup)
    .center([37.467271, 127.042861])
    .zoom(9)
    .cluster(true);

  // dc.renderAll(groupname);
}

function drawChart() {
  var sdate = $('#sdate').val();
  var edate = $('#edate').val();
  var data = { sdate : sdate, edate :edate };
  var in_data = { url : "/reports/restapi/getRangePowerData", type : "GET", data : data };
  ajaxTypeData(in_data, function(result){        
    if (result.rtnCode.code == "0000") {
      var data = result.rtnData;              
      drawPower(data, sdate, edate);
    }
  });
}

function drawPower(data, sdate, edate) {

  var markerName = "fault";
  var dayCount = dc.barChart('#dayCount', markerName);
  var groupCount = dc.pieChart('#groupCount', markerName);
  var dataTable = dc.dataTable('.dataTable', markerName);
  var mapMarkerChart = dc_leaflet.markerChart("#bubble-map-map", markerName);

  var minDate = new Date(sdate);  
  var maxDate = new Date(edate);

  var group_id = new Array();

  var msHour = 1000*60*60;
  var gap = (maxDate-minDate)/(24 * msHour);
  var maxCnt = 0;
  
  var nyx = crossfilter(data);  
  var all = nyx.groupAll();
 
// Dimension by today
  var todayDim = nyx.dimension(function (d) {   
    return d3.time.day(new Date(d.event_time)); });
  var powerSumGroup = todayDim.group().reduceCount(function(d) {
    return 1;
  });

// Dimension by Node_ID
  var zoneDim = nyx.dimension(function(d) {               
    return d.zone_id; });
  var zonePieGroup = zoneDim.group().reduceCount(function(d) {        
    return 1;
  });

// drawMarkerSelect2(nyx, data, mapMarkerChart);

   /* dc.barChart('#dayCount') */
  dayCount
    .width(window.innerWidth*0.3)
    .height(310)
    .margins({top: 15, right: 50, bottom: 40, left: 40})
    .transitionDuration(500)
    .dimension(todayDim)
    .group(powerSumGroup)
    .elasticY(true)
    .brushOn(true)
    .centerBar(true)
    .gap(gap)         
    .x(d3.time.scale().domain([minDate, maxDate]))
    .round(d3.time.days.round)
    .alwaysUseRounding(true)
    .renderHorizontalGridLines(true)
    .xUnits(d3.time.days);

  /* dc.pieChart('#groupCount') */
  groupCount
    .width(window.innerWidth*0.2)
    .height(310)
    .radius(130)
    .dimension(zoneDim)
    .group(zonePieGroup)    
    .drawPaths(true)
    .legend(dc.legend())    
    .renderLabel(true);
/*    .colors(d3.scale.ordinal().range(["#EDC951", "#CC333F", "#756bb1", "#31a354", "#fd8d3c", "#00A0B0", "#003399", "#FFB2F5"]));*/

  /* dc.dataTable('.dataTable') */
    dataTable
    .dimension(todayDim)
    .group(function (d) {
       return d3.time.day(new Date(d.event_time));
     })
    .size(10)     
    .columns([ 
      'event_time',            
      'zone_id',
      'node_id',
      'ampere',
      'voltage',
      'active_power',            
      'amount_of_active_power',
      'apparent_power'
    ])
    .sortBy(function (d) {        return d.event_time;    })    
    .order(d3.ascending)    
    .on('renderlet', function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
    });
  dc.renderAll(markerName);

  
}