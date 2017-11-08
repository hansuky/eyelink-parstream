function getData() {
  var sdate = $('#sdate').val();  
  $.ajax({
    url: "/dashboard/restapi/getAccTimeseries" ,
    dataType: "json",
    type: "get",
    data: { date : sdate, interval : '10m' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        drawAccTimeseries(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });

  $.ajax({
    url: "/dashboard/restapi/getProcessTimeseries" ,
    dataType: "json",
    type: "get",
    data: { date : sdate },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {        
        drawProcessTimeseries(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });

  $.ajax({
    url: "/dashboard/restapi/getTopTimeseries" ,
    dataType: "json",
    type: "get",
    data: { date : sdate },
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        console.log(result);
        drawTopTimeseries(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });

  $.ajax({
    url: "/dashboard/restapi/getTotalTimeseries" ,
    dataType: "json",
    type: "get",
    data: { date : sdate },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {
        drawTotalTimeseries(result.rtnData);
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

function drawMetricChart() {
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };    
  var sdate = $('#sdate').val();  
  var s = sdate.split('-')
  var sindex =new Date(new Date(s[0], parseInt(s[1])-1, s[2]).getTime()-24*60*60*1000);
  var edate = $('#edate').val();
  /*console.log(sdate, edate);*/
  var index = [], cnt = 0;
  var e = edate.split('-');
  for(i=sindex.getTime(); i < new Date(e[0], parseInt(e[1])-1, e[2]).getTime()+24*60*60*1000; i+=24*60*60*1000){       
    var day = new Date(i).toString().split(' ');    
    index[cnt++] = "metricbeat-"+day[3]+'.'+mon[day[1]]+'.'+day[2];    
  }  
  var s = sindex.toString().split(' ');
  var gte = s[3]+'-'+mon[s[1]]+'-'+s[2]+'T15:00:00.000Z';
  var e = edate.split('-');
  var lte = e[0]+'-'+e[1]+'-'+e[2]+'T15:00:00.000Z';
  /*console.log(index);*/
  $.ajax({
    url: "/dashboard/restapi/getMetricTimeseries" ,
    dataType: "json",
    type: "get",
    data: { index : index, gte : gte , lte : lte},
    success: function(result) {
      // console.log(result);
      if (result.rtnCode.code == "0000") {
        var data = result.rtnData;            
        /*console.log(data);*/
        drawMericTimeseries(data);

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


function drawAccTimeseries(data) {
  var chartName = '#ts-chart01';
  chart01 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'res_time'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'error'},{interpolate:'linear'})    
    .addSerie(data,{x:'timestamp',y:'slow'},{interpolate:'linear'})    
    // .xscale.tickFormat(d3.time.format("%b %d"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart01(chartName);
}

function drawProcessTimeseries(data){  
  var chartName = '#ts-chart02';
  chart02 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'cpu_total'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'memory_rss'},{interpolate:'linear'})
    // .xscale.tickFormat(french_timeformat)
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart02(chartName);
}

function drawTopTimeseries(data) { 
  var chartName = '#ts-chart03';
  chart03 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'top1'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'top2'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top3'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top4'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top5'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top6'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top7'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top8'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top9'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'top10'},{interpolate:'linear'})

    // .xscale.tickFormat(french_timeformat)
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart03(chartName);
}

function drawTotalTimeseries(data) {
  var chartName = '#ts-chart04';
  chart04 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'memory_used'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'memory_actual_used'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'memory_swap_used'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'cpu_user'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'cpu_system'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'cpu_idle'},{interpolate:'linear'})
    // .xscale.tickFormat(french_timeformat)
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

  chart04(chartName);
}