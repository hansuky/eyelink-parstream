'use strict';
function drawChart() {
  var markerName = "dashboardChart";
  var volumeChart = dc.barChart('#volumn-chart', markerName);

  d3.json("/dashboardes/restapi/getDashboardRawData", function(err, out_data) {
    // if (err) throw Error(error);

    var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
    var df = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ');
    var numberFormat = d3.format('.2f');
    var maxDate = new Date();
    var minDate  = addDays(new Date(), -20);

    // for Test
    maxDate = new Date('11/30/2016');
    minDate = new Date('11/10/2016');
    console.log(minDate);
    console.log(maxDate);

    var data = out_data.rtnData;
    // console.log(out_data);

    var cnt_event_type = 0,
        cnt_fault_type = 0;
    data.forEach(function (d) {
      // console.log(d);
      d.event_time = d._source.event_time;
      d.event_type = d._source.event_type;
      // console.log('date : ' + df.parse("2016-11-28"));
      d.dd = df.parse(d.event_time);
      d.month = d3.time.month(d.dd);
      d.day = d3.time.day(d.dd);
      d.hour = d._source.event_time.substring(11,13);
      // console.log(d.hour);

      // d.month = d3.time.month(d.dd); // pre-calculate month for better performance
      // d.VOLTAGE = +d.VOLTAGE;
      // if (d.event_type == '81')
        // d.event_type_fault = 1;
      // d.ampere = d.ampere;
      // d.ampere += d.ampere;
      // d.POWER_FACTOR = +d.POWER_FACTOR;
      // d.active_power += d.active_power;
      // d.REACTIVE_POWER = +d.REACTIVE_POWER;
      // d.APPARENT_POWER = +d.APPARENT_POWER;
      // d.AMOUNT_OF_ACTIVE_POWER = +d.AMOUNT_OF_ACTIVE_POWER;
      // d.check = +0.85;
      // console.log(d);
      // d.active_power += d.active_power;
      // d.geo = d.gps_latitude + ',' + d.gps_longitude;
      // d.geo = (d.node_id === '0001.00000001') ? '37.457271, 127.042861':'37.468271, 127.032861';
    });

    // console.log(data);

    var ndx = crossfilter(data);

    var moveDays = ndx.dimension(function (d) {
      console.log(d);
      return d.day;
    })

    var volumnByDayGroup = moveDays.group().reduceCount(function (d) {
      console.log(d.event_type);
      return d.event_type;
    })
    // console.log(ampereGroup);

    volumeChart
      // .width(600)
      .height(60)
      .margins({top: 0, right: 50, bottom: 20, left: 40})
      .dimension(moveDays)
      .group(volumnByDayGroup)
      .centerBar(true)
      .gap(1)
      .x(d3.time.scale().domain([minDate, maxDate]))
      .round(d3.time.day.round)
      .alwaysUseRounding(true)
      .xUnits(d3.time.days);

    dc.renderAll(markerName);
  });
}