function summary() {
  var chart = dc.barChart("#test");
  var load = dc.barChart("#load");

  var date = new Date();
  var data = [];
  var minDate = new Date(date.getTime() - 20880001);
  var maxDate = new Date(date.getTime())+7200000;
  console.log(minDate);
  console.log(maxDate);
  for(var i=date.getTime() - 17280001; i<date.getTime(); i+=173){
    var num = Math.round((Math.random() * 10000)/(Math.random() * 1000 + 1));    

    data.push({
      x : i,
       y : num,
      date : new Date(i),
      hour : d3.time.hour(new Date(i)),     
      term : num < 1000 ? '1s' : (num < 3000 ? '3s' : (num < 5000 ? '5s' : (num < 7000 ? 'Slow' : 'Error'))),
      index : num < 1000 ? 0 : (num < 3000 ? 1 : (num < 5000 ? 2 : (num < 7000 ? 3 : 4)))
    });
  }

  console.log(data);
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
    .width(window.innerWidth*0.6)
    .height(480)    
    .margins({top: 30, right: 50, bottom: 40, left: 50})
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
    .width(window.innerWidth*0.6)
    .height(470)
    .margins({left: 140, top: 30, right: 10, bottom: 40})
    .brushOn(false)
    .transitionDuration(500)
    .clipPadding(10)
    .title(function(d) {
      for(var i=0; i<term.length; i++) {
        if(this.layer == term[i])         
          console.log(term[i]+ ' : ' + d.value[i]);
          return this.layer + ' : ' + d.value[i];
      }
    })
    .dimension(hourDim)
    .group(stackGroup, term[0], sel_stack('0'))
    .mouseZoomable(true)
    .renderHorizontalGridLines(true)
    .x(d3.time.scale().domain([minDate, maxDate]))
    .round(d3.time.hour.round)
    .xUnits(function(){return 10;})
    .elasticY(true)
    .elasticX(true)
    .centerBar(true)
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