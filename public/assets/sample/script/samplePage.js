$(function(){ 
  var date = new Date();
  var timeformat = d3.time.format('%m-%d %H:%M');

  var data = [];
  for(var i=date.getTime() - 17280001; i<date.getTime(); i+=173){
    var num = Math.round(_.random(0, 10000) / _.random(1, 1000));          
    console.log(i);
    data.push({
      x : i,            
      y : num,
      date : new Date(i),
      hour : d3.time.hour(new Date(i)),            
      type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others')),            
      term : num < 1000 ? '1s' : (num < 3000 ? '3s' : (num < 5000 ? '5s' : (num < 7000 ? 'Slow' : 'Error'))),
      index : num < 1000 ? 0 : (num < 3000 ? 1 : (num < 5000 ? 2 : (num < 7000 ? 3 : 4)))
    });
  } 
  
  if(Modernizr.canvas){
    doBigScatterChart();
  }
  var oScatterChart;
  function doBigScatterChart(){
    oScatterChart = new BigScatterChart({
      sContainerId : 'chart1',
      nWidth : window.innerWidth*0.2,
      nHeight : 300,
      nXMin: date.getTime() - 17280001, nXMax: date.getTime(),
      nYMin: 0, nYMax: 10000,
      nZMin: 0, nZMax: 5,
      nBubbleSize: 3,
      nPaddingTop : 50,
      nDefaultRadius : 3,
      htTypeAndColor : {
        'Success' : '#b6da54', // type name : color
        'Warning' : '#fcc666',
        'Failed' : '#fd7865',
        'Others' : '#55c7c7'
      },
      sXLabel : '(time)',
      sYLabel : '(ms)',
      htGuideLine : {
        'nLineWidth' : 1,
        'aLineDash' : [2, 5],
        'nGlobalAlpha' : 0.2
      },
      sXLabel : '',
      nPaddingRight : 5,
      fOnSelect : function(htPosition, htXY){
        console.log('fOnSelect', htPosition, htXY);
        console.time('fOnSelect');
        var aData = this.getDataByXY(htXY.nXFrom, htXY.nXTo, htXY.nYFrom, htXY.nYTo);
        console.timeEnd('fOnSelect');
        console.log('adata length', aData.length);
        //alert('Selected data count : ' + aData.length);
      }
    }); 
      oScatterChart.addBubbleAndDraw(data);    
  }
   summary(data);
});

function summary(data) {
  console.log(data) ;
  var chart = dc.barChart("#test");
  var load = dc.barChart("#load");
 
  var timeformat = d3.time.format('%m-%d %H:%M');

  var date = new Date();  
  var minDate = new Date(date.getTime() - 17280001); 
  var maxDate = new Date(date.getTime() + 1800000);  
  var gap = (maxDate-minDate)/(24 * 60 * 60 * 1000);

  var nyx = crossfilter(data);
  var all = nyx.groupAll();

  var termDim = nyx.dimension(function(d) {      
    return d.term; 
  });

  var BarGroup = termDim.group().reduceCount(function(d) {
    return 1;
  });

  var hourDim = nyx.dimension(function(d) {    
    return d.hour;
  });
  var stackGroup = hourDim.group().reduce(function(p, v){
    p[v.index] = (p[v.index] || 0) + 1;    
    return p;
  }, function(p, v) {
    p[v.index] = (p[v.index] || 0) - 1;
    return p;
  }, function() {
    return{};
  });
  
var term = ['1s', '3s', '5s', 'Slow', 'Error'];
chart
    .width(window.innerWidth*0.2)
    .height(300)    
    .margins({top: 20, right: 20, bottom: 20, left: 50})
    .brushOn(false)    
    .dimension(termDim)
    .group(BarGroup)
    .elasticY(true)
    .brushOn(true)    
    .x(d3.scale.ordinal().domain(term))
    .xUnits(dc.units.ordinal)    
    .renderLabel(true)
    .on('renderlet', function(chart) {
        chart.selectAll('rect').on("click", function(d) {
            console.log("click!", d);
        });
    });
     
/*  dc.barChart('#eventBar')  */
  function sel_stack(i) {
      return function(d) {            
          return d.value[i]?d.value[i]:0;
      };
  }

  load
    .width(window.innerWidth*0.2)
    .height(300)
    .margins({left: 90, top: 10, right: 10, bottom: 40})
    .brushOn(false)
    .transitionDuration(500)
    .clipPadding(10)
    .title(function(d) {
      for(var i=0; i<term.length; i++) {
        if(this.layer == term[i])         
          console.log(term[i] + ' : ' + d.value[i]);
          return this.layer + ' : ' + d.value[i];
      }
    })      
    .dimension(hourDim)
    .group(stackGroup, term[0], sel_stack('0'))
    .mouseZoomable(false)
    .renderHorizontalGridLines(true)
    .x(d3.time.scale().domain([minDate, maxDate]))
    .round(d3.time.hour.round)
    .xUnits(function(){return 8;})
    .elasticY(true)
  
    .colors(d3.scale.ordinal().range(["#EDC951",  "#31a354", "#00A0B0", "#FFB2F5" , "#CC333F"]));
    load.legend(dc.legend());
    dc.override(load, 'legendables', function() {
      var items = load._legendables();
      return items.reverse();
    });
    for(var i = 1; i<term.length; ++i){
      load.stack(stackGroup, term[i], sel_stack(i));
    }  
 dc.renderAll();
}