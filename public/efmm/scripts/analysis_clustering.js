$(document).ready(function(e) {
  let dateFormat = 'YYYY-MM-DD';
  let dadate = '';
  $('#sdate').val(moment().format(dateFormat));
  $('#edate').val(moment().format(dateFormat));
  // time series char를 그린다.
  let interval = $("select[name=interval]").val();
  let machine = $("select[name=machine]").val();
  getMasterList(interval, machine);

  $('#btn_search').click(function() {
    let interval = $("select[name=interval]").val();
    let machine = $("select[name=machine]").val();
    d3.selectAll("svg").remove();
    getMasterList(interval, machine);
  });

  $('input[type="radio"]').on('click change', function(e) {

    if ($('#factor0').is(':checked') === true) {
      var factor = $('#factor0').val();
      console.log('[clickfunc] factor0: ',factor);
    } else if ($('#factor1').is(':checked') === true) {
      var factor = $('#factor1').val();
      console.log('[clickfunc] factor1: ',factor);
    }
    // else if ($('#factor2').is(':checked') === true) {
    //   var factor = $('#factor2').val();
    // } else if ($('#factor3').is(':checked') === true) {
    //   var factor = $('#factor3').val();
    // }
    var dadate = $('#dadate').val();
    if (dadate != '') {
      d3.selectAll("svg").remove();
      drawCheckChart(factor, dadate);
    }
  });
  clickfunc = function(link) {
    var dadate = link.innerText || link.textContent;
    dadate = dadate.replace(' ', 'T');
    $('#dadate').val(dadate);
    if ($('#factor0').is(':checked') === true) {
      var factor = $('#factor0').val();
      console.log('[clickfunc] factor0: ',factor);
    } else if ($('#factor1').is(':checked') === true) {
      var factor = $('#factor1').val();
      console.log('[clickfunc] factor1: ',factor);
    }
    // else if ($('#factor2').is(':checked') === true) {
    //   var factor = $('#factor2').val();
    // } else if ($('#factor3').is(':checked') === true) {
    //   var factor = $('#factor3').val();
    // }
    // else if ($('#factor4').is(':checked') === true) {
    //   var factor = $('#factor4').val();
    // }
    d3.selectAll("svg").remove();
    drawCheckChart(factor, dadate);
  };
});

function getMasterList(interval, machine) {
  var sdate = $('#sdate').val();
  var edate = $('#edate').val();

  var data = {
    sdate: sdate,
    edate: edate,
    interval: interval,
    machine: machine
  };
  var in_data = {
    url: "/analysis/restapi/getDaClusterMaster",
    type: "GET",
    data: data
  };
  ajaxTypeData(in_data, function(result) {
    if (result.rtnCode.code == "0000") {
      var master = result.rtnData;
      drawMaster(master);
    }
  });
}

function drawMaster(master) {

  var seatvar = document.getElementsByClassName("masterList");
  var cnt = 0
  $('#masterList').empty();
  master.forEach(function(d) {
    var sb = new StringBuffer();
    if (cnt == 0) {
      sb.append('<tr><th>DA Time</th><th>Start Date-End Date</th><th>Interval</th><th></th></tr>');
      cnt++;
    }
    var sdate = d.start_date.split(' ');
    var edate = d.end_date.split(' ');
    sb.append('<tr><td><a href="#" onclick="clickfunc(this)">' + d.da_time + '</td><td> ' + d.start_date + ' ~ ' + d.end_date + ' </td>');
    if (d.time_interval == 180) {
      var interval = '3hours';
    } else if (d.time_interval == 360) {
      var interval = '6hours';
    } else {
      var interval = d.time_interval + 'mins';
    }
    sb.append('<td>' + interval + '</td>');
    sb.append('<td><a href="#" onclick="javascript_:window.open(');
    var script = "'clusteringPop?dadate=" + d.da_time + "&interval=" + interval + "&start=" + d.start_date + "&end=" + d.end_date + "', '', 'menubar=1,status=no,scrollbars=1,resizable=1 ,width=1200,height=640,top=50,left=50'";
    sb.append(script + ');" class="btn red"> Detail </a></td></tr>')

    $('#masterList').append(sb.toString());
  });
}

function drawCheckChart(machine, dadate) {
  console.log('[drawCheckChart] machine:',machine);
  var data = {
    dadate: dadate,
    machine: machine
  }
  var in_data = {
    url: "/analysis/restapi/getDaClusterDetail",
    type: "GET",
    data: data
  };
  ajaxTypeData(in_data, function(result) {
    if (result.rtnCode.code == "0000") {
      console.log(result.rtnData);
      drawCheckCluster(result.rtnData, dadate, machine);
    }
  });
}

function drawCheckCluster(data, dadate, machine) {
  var cate = new Array();
  var idx = 0;
  if ($('input[name="c0"]').prop('checked'))
    cate[idx++] = 'c0';
  if ($('input[name="c1"]').prop('checked'))
    cate[idx++] = 'c1';
  if ($('input[name="c2"]').prop('checked'))
    cate[idx++] = 'c2';
  if ($('input[name="c3"]').prop('checked'))
    cate[idx++] = 'c3';
  var demo = new Vue({
    el: '#table',
    data: {
      people_count: 200,
      lineCategory: ['c0', 'c1', 'c2', 'c3'],
      selectCate: cate,
      lineFunc: null
    },
    methods: {
      displayLine: function() {
        var self = this;
        var input = 0;

        //generation function
        function generate(data, id, lineType, axisNum) {
          var margin = {
              top: 14,
              right: 10,
              bottom: 60,
              left: 30
            },
            width = $(id).width() - margin.left - margin.right,
            height = $(id).height() - margin.top - margin.bottom;

          var legendSize = 10,
            color = d3.scale.category20();

          var x = d3.time.scale().range([0, width]);
          var y = d3.scale.linear().range([height, 0]);

          var ddata = (function() {
            var temp = {},
              seriesArr = [];

            self.lineCategory.forEach(function(name) {
              temp[name] = {
                category: name,
                values: []
              };
              seriesArr.push(temp[name]);
            });

            data.forEach(function(d) {
              self.lineCategory.map(function(name) {
                temp[name].values.push({
                  'category': name,
                  'time': new Date(d['time']),
                  'num': d[name]
                });
              });
            });
            return seriesArr;
          })();
          x.domain(d3.extent(data, function(d) {
            return new Date(d.time);
          }));
          if (machine === '100') {
            y.domain([0, 100]);
          } else if (machine === '200') {
            y.domain([0, 100]);
          }
          // else if(machine === 'voltage') {
          //   y.domain([0, 240]);
          // } else if(machine === 'power_factor') {
          //   y.domain([0, 1.5]);
          // }

          //data.length/10 is set for the garantte of timeseries's fitting effect in svg chart
          var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(7)
            .tickSize(-height)
            .tickPadding([7])
            .orient("bottom");

          var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .tickSize(-width)
            .tickPadding([8])
            .orient("left");

          // Define the div for the tooltip
          var div = d3.select("body").append("div")
            .attr("class", "tip")
            .style("opacity", 0);

          d3.select('#svg-path').remove();

          var svg = d3.select(id).append("svg")
            .attr("id", "#svg-path")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("g")
            .attr("class", "x axis")
            .attr("id", "line-x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

          var line = d3.svg.line()
            .interpolate(lineType)
            .x(function(d) {
              return x(d['time']);
            })
            .y(function(d) {
              return y(d['num']);
            });

          var path = svg.append("g")
            .attr("class", "click_path");

          path.selectAll(".click_line")
            .data(ddata)
            .enter()
            .append("path")
            .attr("class", function(d) {
              return "click_line click_line_" + d['category'];
            })
            .attr("d", function(d) {
              return line(d['values']);
            })
            .style("display", function(d) {
              //to check if the checkbox has been selected and decide whether to show it out
              //use display:none and display:inherit to control the display of scatter dots
              if ($("#" + d['category']).prop("checked"))
                return 'inherit';
              else
                return 'none';
            })
            .attr("stroke", function(d) {
              return color(d['category']);
            });

          d3.selectAll('.click_legend').remove();

          var legend = svg.append('g')
            .attr('class', 'click_legend');

          var singLegend = legend.selectAll('.path_legend')
            .data(self.selectCate)
            .enter()
            .append('g')
            .attr('class', 'path_legend')
            .attr('transform', function(d, i) {
              return 'translate(' + ((5 + (width - 20) / 4) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
            });

          singLegend.append('rect')
            .attr('width', legendSize)
            .attr('height', legendSize)
            .style('fill', function(d) {
              return color(d);
            });

          singLegend.append('text')
            .attr('x', legendSize * 1.4)
            .attr('y', legendSize / 1.3)
            .attr('font-size', function() {
              if ($(id).width() > 415)
                return '.9em';
              else {
                return '.55em';
              }
            })
            .text(function(d) {
              if (d === 'c0') {
                var rename = "Cluster0";
              } else if (d === 'c1') {
                var rename = "Cluster1";
              } else if (d === 'c2') {
                var rename = "Cluster2";
              } else if (d === 'c3') {
                var rename = "Cluster3";
              } else {
                var rename = "Cluster4";
              }
              return rename;
            });

          //draw the rect for legends
          var rect = svg.append('g')
            .attr("class", 'legendOuter');

          rect.selectAll('.legendRect')
            .data(self.selectCate)
            .enter()
            .append('rect')
            .attr('class', 'legendRect')
            .attr('width', (width - 20) / 4)
            .attr('height', legendSize + 10)
            .attr('transform', function(d, i) {
              return 'translate(' + (i * (5 + (width - 20) / 4)) + ',' + (height + margin.bottom - legendSize - 20) + ')';
            });

          var points = svg.selectAll(".seriesPoints")
            .data(ddata)
            .enter().append("g")
            .attr("class", "seriesPoints");

          points.selectAll(".tipNetPoints")
            .data(function(d) {
              return d['values'];
            })
            .enter().append("circle")
            .attr("class", "tipNetPoints")
            .attr("class", function(d) {
              return "tipNetPoints_" + d['category'];
            })
            .attr("cx", function(d) {
              return x(d['time']);
            })
            .attr("cy", function(d) {
              return y(d['num']);
            })
            .text(function(d) {
              return d['num'];
            })
            .attr("r", "6px")
            .style("fill", "transparent")
            .on("mouseover", function(d) {

              var mainCate = (function() {
                if (d['num'] != 0) {
                  if (d['category'] === 'c0') {
                    var rename = "Cluster0";
                  } else if (d['category'] === 'c1') {
                    var rename = "Cluster1";
                  } else if (d['category'] === 'c2') {
                    var rename = "Cluster2";
                  } else if (d['category'] === 'c3') {
                    var rename = "Cluster3";
                  } else {
                    var rename = "Cluster3";
                  }
                  return rename + ' | ';
                } else
                  return '';
              })();

              div.transition()
                .duration(200)
                .style("opacity", .9);
              div.html(' ' + mainCate + d['num'] + ' ')
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

              svg.append("g")
                .attr("class", "tipDot")
                .append("line")
                .attr("class", "tipDot")
                .transition()
                .duration(50)
                .attr("x1", $(this)[0]['cx']['animVal']['value'])
                .attr("x2", $(this)[0]['cx']['animVal']['value'])
                .attr("y2", height);

              svg.append("polyline")
                .attr("class", "tipDot")
                .style("fill", "white")
                .attr("points", ($(this)[0]['cx']['animVal']['value'] - 3.5) + "," + (0 - 2.5) + "," + $(this)[0]['cx']['animVal']['value'] + "," + (0 + 6) + "," + ($(this)[0]['cx']['animVal']['value'] + 3.5) + "," + (0 - 2.5));

              svg.append("polyline")
                .attr("class", "tipDot")
                .style("fill", "white")
                .attr("points", ($(this)[0]['cx']['animVal']['value'] - 3.5) + "," + (y(0) + 2.5) + "," + $(this)[0]['cx']['animVal']['value'] + "," + (y(0) - 6) + "," + ($(this)[0]['cx']['animVal']['value'] + 3.5) + "," + (y(0) + 2.5));
            })
            .on("mouseout", function(d) {

              div.transition()
                .duration(500)
                .style("opacity", 0);

              var currentX = $(this)[0]['cx']['animVal']['value'];

              d3.select(this).transition().duration(100).style("opacity", 0);

              var ret = $('.tipNetPoints').filter(function(index) {
                return ($(this)[0]['cx']['animVal']['value'] === currentX);
              });

              $.each(ret, function(index, val) {
                $(val).animate({
                  opacity: "0"
                }, 100);
              });

              d3.selectAll('.tipDot').transition().duration(100).remove();
            });

          this.getOpt = function() {
            var axisOpt = new Object();
            axisOpt['x'] = x;
            axisOpt['y'] = y;
            axisOpt['xAxis'] = xAxis;
            axisOpt['legendSize'] = legendSize;
            axisOpt['height'] = height;
            axisOpt['width'] = width;
            axisOpt['margin'] = margin;
            return axisOpt;
          }

          this.getSvg = function() {
            var svgD = new Object();
            svgD['svg'] = svg;
            svgD['path'] = path;
            svgD['line'] = line;
            svgD['rect'] = rect;
            svgD['legend'] = legend;
            svgD['color'] = color;
            svgD['points'] = points;
            return svgD;
          }
        }

        //inits chart
        self.lineFunc = new generate(data, "#Cluster", "linear", 30);
      },
      checkOpt: function(e) {
        var self = this;
        //check the Scatter Choice and Refresh the charts
        var count = 0;
        for (var i = 0; i < self.lineCategory.length; i++) {
          if ($("#" + self.lineCategory[i]).prop("checked"))
            count++;
        }

        //judge if the checked checkbox reach the max limitation
        if (count > 10) {
          alert("NOTICE: The MAXIMUM selection should be TEN.");
          e.target.checked = false;
        }

        self.selectCate = [];
        for (var i = 0; i < self.lineCategory.length; i++) {
          if ($("#" + self.lineCategory[i]).prop("checked")) {
            self.selectCate.push(self.lineCategory[i]);
            d3.selectAll(".click_line_" + self.lineCategory[i]).transition().duration(300).style("display", 'inherit');
            d3.selectAll(".tipNetPoints_" + self.lineCategory[i]).transition().duration(300).style("display", 'inherit');
          } else {
            d3.selectAll(".click_line_" + self.lineCategory[i]).transition().duration(300).style("display", 'none');
            d3.selectAll(".tipNetPoints_" + self.lineCategory[i]).transition().duration(300).style("display", 'none');
          }
        }

        //redraw the legend and chart
        this.legendRedraw(self.selectCate, "#Cluster", self.lineFunc.getSvg()['legend'], self.lineFunc.getSvg()['rect'], self.lineFunc.getOpt()['legendSize'], self.lineFunc.getOpt()['margin'], self.lineFunc.getOpt()['height'], self.lineFunc.getOpt()['width'], self.lineFunc.getSvg()['color']);
      },
      legendRedraw: function(selectCate, id, legend, rect, legendSize, margin, height, width, color) {

        //update the scatter plot legend
        legend.selectAll('.path_legend')
          .data(selectCate)
          .transition()
          .duration(200)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width - 20) / 4) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
          })

        legend.selectAll('rect')
          .data(selectCate)
          .style('fill', function(d) {
            return color(d);
          });

        legend.selectAll('text')
          .data(selectCate)
          .attr('x', legendSize * 1.4)
          .attr('y', legendSize / 1.3)
          .attr('font-size', function() {
            if ($(id).width() > 415)
              return '.9em';
            else {
              return '.55em';
            }
          })
          .text(function(d) {
            if (d === 'c0') {
              var rename = "Cluster0";
            } else if (d === 'c1') {
              var rename = "Cluster1";
            } else if (d === 'c2') {
              var rename = "Cluster2";
            } else if (d === 'c3') {
              var rename = "Cluster3";
            } else {
              var rename = "Cluster4";
            }
            return rename;
          });


        //create new legends
        var singLegend = legend.selectAll('.path_legend')
          .data(selectCate)
          .enter()
          .append('g')
          .attr('class', 'path_legend')
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width - 20) / 4) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
          });

        singLegend.append('rect')
          .attr('width', legendSize)
          .attr('height', legendSize)
          .style('fill', function(d) {
            return color(d);
          });

        singLegend.append('text')
          .attr('x', legendSize * 1.4)
          .attr('y', legendSize / 1.3)
          .attr('font-size', function() {
            if ($(id).width() > 415)
              return '.9em';
            else {
              return '.55em';
            }
          })
          .text(function(d) {
            if (d === 'c0') {
              var rename = "Cluster0";
            } else if (d === 'c1') {
              var rename = "Cluster1";
            } else if (d === 'c2') {
              var rename = "Cluster2";
            } else if (d === 'c3') {
              var rename = "Cluster3";
            } else {
              var rename = "Cluster4";
            }
            return rename;
          });

        //remove the old legends
        legend.selectAll('.path_legend')
          .data(selectCate)
          .exit()
          .remove();

        //redraw the rect around the legend
        rect.selectAll('.legendRect')
          .data(selectCate)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width - 20) / 4) * i) + ',' + (height + margin.bottom - legendSize - 20) + ')';
          });

        rect.selectAll('.legendRect')
          .data(selectCate)
          .enter()
          .append('rect')
          .attr('class', 'legendRect')
          .attr('width', (width - 20) / 4)
          .attr('height', legendSize + 10)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width - 20) / 4) * i) + ',' + (height + margin.bottom - legendSize - 20) + ')';
          });

        rect.selectAll('.legendRect')
          .data(selectCate)
          .exit()
          .remove();
      }
    },
    compiled: function() {
      var self = this;
      self.displayLine();
    }
  });
}